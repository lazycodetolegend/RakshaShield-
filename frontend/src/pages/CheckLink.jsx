import { useState } from 'react';
import client from '../api/client';
import RiskScoreCard from '../components/RiskScoreCard';
import ReasonList from '../components/ReasonList';
import Disclaimer from '../components/Disclaimer';

export default function CheckLink() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [docketId] = useState(() => 'DOM-' + Math.floor(100000 + Math.random() * 900000));

  async function handleSubmit(e) {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await client.post('/check-link', { url: url.trim() });
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Domain lookup failed. Verify connectivity.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Official Form Sheet */}
      <div className="document-sheet border-2 border-ink p-6 sm:p-10 relative">
        {/* Document Header */}
        <div className="border-b-2 border-ink pb-6 mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 font-docket text-xs text-ink-muted uppercase tracking-widest mb-1.5">
              <span className="px-1.5 py-0.5 bg-ink text-paper-light text-[10px] font-bold">
                DOCKET FORM 02
              </span>
              <span>REF NO: {docketId}</span>
            </div>
            <h1 className="font-slab font-black text-2xl sm:text-4xl text-ink tracking-tight uppercase leading-tight">
              Domain & Link Investigation
            </h1>
            <p className="font-docket text-xs sm:text-sm text-ink-muted mt-1">
              Verify unfamiliar domains against WHOIS age records, corporate typosquatting signatures, and high-risk disposable TLDs.
            </p>
          </div>

          <div className="border border-rule-dark p-2 bg-paper font-docket text-[10px] text-ink-muted shrink-0 text-right">
            <div>TARGET: <span className="font-bold text-ink">DNS / WHOIS</span></div>
            <div>STATUS: <span className="font-bold text-ink">READY</span></div>
          </div>
        </div>

        {/* Section 01: URL Input Field */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-docket text-xs font-bold uppercase tracking-wider text-ink">
                [ FIELD 01: TARGET URL OR DOMAIN ADDRESS ]
              </label>
              <span className="font-docket text-[10px] text-ink-muted">WEB ADDRESS</span>
            </div>
            
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="e.g. https://flipkart-festivedeal.xyz or tata-recruitment.org"
              className="w-full px-4 py-3.5 border-2 border-rule-dark bg-paper text-ink placeholder:text-ink-light font-docket text-xs sm:text-sm leading-relaxed rounded-none shadow-inner"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2">
            <button
              type="submit"
              disabled={loading || !url.trim()}
              className="px-8 py-3.5 bg-ink text-paper-light font-docket text-xs sm:text-sm font-bold uppercase tracking-widest border-2 border-ink hover:bg-paper-dark hover:text-ink transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed shadow-[3px_3px_0px_rgba(201,191,165,1)] hover:shadow-[1px_1px_0px_rgba(28,27,24,1)] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="spinner !border-paper-light/30 !border-t-paper-light"></div>
                  [ QUERYING WHOIS REGISTRIES... ]
                </span>
              ) : (
                '▶ EXECUTE DOMAIN AUDIT'
              )}
            </button>

            <span className="font-docket text-[11px] text-ink-muted text-center sm:text-right">
              WHOIS QUERY + LEVENSHTEIN DISTANCE
            </span>
          </div>
        </form>

        {/* Error Alert Box */}
        {error && (
          <div className="mt-6 p-4 bg-danger-bg border-2 border-danger font-docket text-xs text-danger font-bold animate-fade-in">
            [ ALERT: ERROR ENCOUNTERED ] {error}
          </div>
        )}

        {/* Verification Result Docket */}
        {result && (
          <div className="mt-8 pt-8 border-t-2 border-ink space-y-6">
            <div className="flex items-center justify-between font-docket text-xs text-ink-muted pb-2 border-b border-rule">
              <span className="font-bold text-ink uppercase tracking-wider">
                [ SECTION 02: DOMAIN AUDIT CERTIFICATE ]
              </span>
              <span>DOCKET ID: {docketId}</span>
            </div>

            <RiskScoreCard riskLevel={result.riskLevel} score={result.score} docketId={docketId} />

            {/* Domain Age Metadata Box */}
            {result.domainAgeDays !== null && (
              <div className="border border-rule-dark bg-paper p-4 font-docket text-xs flex flex-wrap items-center justify-between gap-3 shadow-inner">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-ink">REGISTRY CHRONOLOGY:</span>
                  <span>Domain registered {result.domainAgeDays} days ago</span>
                </div>
                <span className={`px-2 py-0.5 text-[10px] font-bold border ${
                  result.domainAgeDays < 30 
                    ? 'bg-danger-bg text-danger border-danger' 
                    : result.domainAgeDays < 90 
                    ? 'bg-caution-bg text-caution border-caution' 
                    : 'bg-verified-bg text-verified border-verified'
                }`}>
                  {result.domainAgeDays < 30 ? 'HIGH RISK: NEW REGISTRATION' : result.domainAgeDays < 90 ? 'ELEVATED: RECENT' : 'ESTABLISHED DOMAIN'}
                </span>
              </div>
            )}

            <ReasonList reasons={result.reasons} />
          </div>
        )}

        {/* Statutory Disclaimer */}
        <Disclaimer />
      </div>
    </div>
  );
}
