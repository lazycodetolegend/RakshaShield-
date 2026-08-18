const axios = require('axios');
const whoiser = require('whoiser');

/**
 * Look up domain age via HTTPS RDAP (preferred, firewall/cloud friendly)
 * with WHOIS fallback.
 * 
 * @param {string} domain - The domain name (e.g., "example.com")
 * @returns {Promise<{ageDays: number|null, creationDate: string|null}>}
 */
async function getDomainAge(domain) {
  if (!domain || typeof domain !== 'string' || !domain.includes('.')) {
    return { ageDays: null, creationDate: null };
  }

  const cleanDomain = domain.toLowerCase().trim();

  // Method 1: Try modern RDAP over HTTPS (port 443) — works reliably on Render/cloud/firewalls
  try {
    const rdapRes = await axios.get(`https://rdap.org/domain/${cleanDomain}`, {
      timeout: 4000,
      headers: { 'Accept': 'application/rdap+json, application/json' },
      validateStatus: (status) => status >= 200 && status < 400
    });

    const events = rdapRes.data?.events || [];
    const regEvent = events.find(
      (e) => e.eventAction === 'registration' || e.eventAction === 'transfer'
    );

    if (regEvent && regEvent.eventDate) {
      const created = new Date(regEvent.eventDate);
      if (!isNaN(created.getTime())) {
        const now = new Date();
        const ageDays = Math.floor((now - created) / (1000 * 60 * 60 * 24));
        return { ageDays: Math.max(0, ageDays), creationDate: created.toISOString() };
      }
    }
  } catch (rdapErr) {
    // RDAP not available or timed out — silently fallback to WHOIS
  }

  // Method 2: Fallback to TCP WHOIS (port 43) via whoiser
  try {
    const results = await whoiser.domain(cleanDomain, { follow: 1, timeout: 5000 });
    const serverData = Object.values(results || {})[0];
    
    if (serverData) {
      const creationDate =
        serverData['Created Date'] ||
        serverData['Creation Date'] ||
        serverData['created'] ||
        serverData['Registered On'] ||
        serverData['Registration Date'] ||
        serverData['Domain Registration Date'] ||
        null;

      if (creationDate) {
        const created = new Date(creationDate);
        if (!isNaN(created.getTime())) {
          const now = new Date();
          const ageDays = Math.floor((now - created) / (1000 * 60 * 60 * 24));
          return { ageDays: Math.max(0, ageDays), creationDate: created.toISOString() };
        }
      }
    }
  } catch (whoisErr) {
    console.warn(`WHOIS fallback unavailable for ${cleanDomain}: ${whoisErr.message}`);
  }

  // Graceful fallback: return null without throwing error
  return { ageDays: null, creationDate: null };
}

module.exports = { getDomainAge };
