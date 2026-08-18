const { getDomainAge } = require('../utils/whois');
const CheckLog = require('../models/CheckLog');
const ScamReport = require('../models/ScamReport');

/**
 * Compute Levenshtein distance between two strings.
 * Inline implementation — no external dependency needed.
 */
function levenshtein(a, b) {
  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }
  return dp[m][n];
}

// Well-known Indian domains to check for typosquatting
const KNOWN_DOMAINS = [
  'tata.com', 'flipkart.com', 'paytm.com', 'razorpay.com', 'phonepe.com',
  'amazon.in', 'myntra.com', 'zomato.com', 'swiggy.com', 'ola.com',
  'uber.com', 'hdfc.com', 'icici.com', 'sbi.co.in', 'axisbank.com',
  'kotak.com', 'bajaj.com', 'reliance.com', 'infosys.com', 'wipro.com',
  'tcs.com', 'google.com', 'microsoft.com', 'apple.com', 'facebook.com',
  'instagram.com', 'whatsapp.com', 'telegram.org', 'linkedin.com',
  'naukri.com', 'indeed.com', 'internshala.com', 'upwork.com'
];

// Suspicious TLDs often used in scam sites
const SUSPICIOUS_TLDS = [
  '.xyz', '.top', '.click', '.buzz', '.gq', '.tk', '.ml', '.cf', '.ga',
  '.work', '.rest', '.fit', '.icu', '.cam', '.monster', '.surf'
];

/**
 * Extract the domain from a URL string.
 */
function extractDomain(urlString) {
  try {
    const url = new URL(urlString.startsWith('http') ? urlString : `https://${urlString}`);
    return url.hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

/**
 * Check if a domain is typosquatting a known domain.
 * Returns the matched known domain or null.
 */
function checkTyposquatting(domain) {
  // Extract just the name part (before the TLD)
  const domainBase = domain.split('.')[0];
  
  for (const known of KNOWN_DOMAINS) {
    const knownBase = known.split('.')[0];
    // Skip if it's an exact match (it IS the real domain)
    if (domain === known) return null;
    // Check Levenshtein distance on the base name
    const distance = levenshtein(domainBase, knownBase);
    if (distance > 0 && distance <= 2) {
      return known;
    }
  }
  return null;
}

/**
 * Map numeric score to risk level.
 */
function getRiskLevel(score) {
  if (score <= 30) return 'low';
  if (score <= 60) return 'medium';
  return 'high';
}

/**
 * POST /api/check-link
 * Body: { url: string }
 */
async function checkLink(req, res) {
  try {
    const { url } = req.body;
    if (!url || !url.trim()) {
      return res.status(400).json({ error: 'URL is required' });
    }

    const domain = extractDomain(url.trim());
    if (!domain) {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    let score = 0;
    const reasons = [];
    let domainAgeDays = null;

    // 1. WHOIS domain age check
    const whoisResult = await getDomainAge(domain);
    domainAgeDays = whoisResult.ageDays;

    if (domainAgeDays !== null) {
      if (domainAgeDays < 30) {
        score += 30;
        reasons.push(`Domain registered only ${domainAgeDays} day${domainAgeDays === 1 ? '' : 's'} ago — very new domains are often used for scams`);
      } else if (domainAgeDays < 90) {
        score += 15;
        reasons.push(`Domain registered ${domainAgeDays} days ago — relatively new`);
      }
    } else {
      reasons.push('Could not determine domain age — WHOIS data unavailable');
    }

    // 2. Typosquatting check
    const typosquatMatch = checkTyposquatting(domain);
    if (typosquatMatch) {
      score += 35;
      reasons.push(`Domain closely mimics '${typosquatMatch}' — possible typosquatting`);
    }

    // 3. Suspicious TLD check
    const hasSuspiciousTLD = SUSPICIOUS_TLDS.some(tld => domain.endsWith(tld));
    if (hasSuspiciousTLD) {
      score += 15;
      reasons.push('Uses a TLD commonly associated with scam or disposable websites');
    }

    // 4. Check against community-reported domains if DB connected
    if (require('mongoose').connection.readyState === 1) {
      try {
        const report = await ScamReport.findOne({ type: 'domain', value: domain });
        if (report) {
          score += 25;
          reasons.push(`This domain was reported ${report.reportCount} time${report.reportCount === 1 ? '' : 's'} by other users`);
        }
      } catch (dbErr) {
        console.error('ScamReport lookup failed:', dbErr.message);
      }
    }

    // Cap score and determine level
    score = Math.min(score, 100);
    const riskLevel = getRiskLevel(score);

    // If nothing was flagged
    if (reasons.length === 0) {
      reasons.push('No suspicious patterns detected — always verify independently');
    }

    // Log the check if DB connected
    if (require('mongoose').connection.readyState === 1) {
      CheckLog.create({
        checkType: 'link',
        inputSnippet: url.substring(0, 200),
        riskLevel,
        reasons
      }).catch(err => console.error('Failed to log check:', err.message));
    }

    return res.json({ riskLevel, score, reasons, domainAgeDays });
  } catch (err) {
    console.error('check-link error:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { checkLink };
