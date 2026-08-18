const whoiser = require('whoiser');

/**
 * Look up domain age via WHOIS.
 * @param {string} domain - The domain name (e.g., "example.com")
 * @returns {Promise<{ageDays: number|null, creationDate: string|null}>}
 */
async function getDomainAge(domain) {
  try {
    const results = await whoiser.domain(domain, { follow: 1, timeout: 10000 });
    
    // Results are keyed by WHOIS server name — take the first one
    const serverData = Object.values(results)[0];
    if (!serverData) {
      return { ageDays: null, creationDate: null };
    }

    // Different registries use different field names for creation date
    const creationDate = 
      serverData['Created Date'] ||
      serverData['Creation Date'] ||
      serverData['created'] ||
      serverData['Registered On'] ||
      serverData['Registration Date'] ||
      serverData['Domain Registration Date'] ||
      null;

    if (!creationDate) {
      return { ageDays: null, creationDate: null };
    }

    const created = new Date(creationDate);
    if (isNaN(created.getTime())) {
      return { ageDays: null, creationDate: creationDate };
    }

    const now = new Date();
    const ageDays = Math.floor((now - created) / (1000 * 60 * 60 * 24));

    return { ageDays, creationDate: created.toISOString() };
  } catch (err) {
    console.error('WHOIS lookup failed for', domain, err.message);
    return { ageDays: null, creationDate: null };
  }
}

module.exports = { getDomainAge };
