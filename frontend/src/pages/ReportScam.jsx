import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import client from '../api/client';
import Disclaimer from '../components/Disclaimer';

const typeOptions = [
  { value: 'upi', label: 'UPI Handle / VPA' },
  { value: 'domain', label: 'Domain Name / Phishing URL' },
  { value: 'phone', label: 'Phone Number / WhatsApp Contact' },
];

export default function ReportScam() {
  const [searchParams] = useSearchParams();
  const [type, setType] = useState(searchParams.get('type') || 'upi');
  const [value, setValue] = useState(searchParams.get('value') || '');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [dispatchId] = useState(() => 'DISPATCH-' + Math.floor(100000 + Math.random() * 900000));

  useEffect(() => {
    const paramType = searchParams.get('type');
    const paramValue = searchParams.get('value');
    if (paramType) setType(paramType);
    if (paramValue) setValue(paramValue);
  }, [searchParams]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!value.trim()) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await client.post('/report-scam', {
        type,
        value: value.trim(),
        reason: reason.trim() || undefined,
      });
      setSuccess(response.data);
      setValue('');
      setReason('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit incident report. Please verify database connectivity.');
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
              <span className="px-1.5 py-0.5 bg-danger text-paper-light text-[10px] font-bold">
                INCIDENT DISPATCH
              </span>
              <span>DOCKET NO: {dispatchId}</span>
            </div>
            <h1 className="font-slab font-black text-2xl sm:text-4xl text-ink tracking-tight uppercase leading-tight">
              Community Incident Report
            </h1>
            <p className="font-docket text-xs sm:text-sm text-ink-muted mt-1">
              File a suspicious UPI ID, malicious domain, or fraudulent phone number into the public protection ledger.
            </p>
          </div>

          <div className="border border-rule-dark p-2 bg-paper font-docket text-[10px] text-ink-muted shrink-0 text-right">
            <div>INTAKE: <span className="font-bold text-ink">ANONYMOUS</span></div>
            <div>VERIFICATION: <span className="font-bold text-ink">CROWDSOURCED</span></div>
          </div>
        </div>

        {/* Success Confirmation Receipt */}
        {success && (
          <div className="mb-8 p-6 border-2 border-verified bg-verified-bg font-docket animate-fade-in">
            <div className="flex items-center gap-2 mb-2 text-verified font-bold text-sm uppercase">
              <span>✅ DISPATCH RECORDED & LOGGED</span>
            </div>
            <p className="font-slab font-bold text-lg text-ink">
              {success.message}
            </p>
            <div className="mt-3 pt-3 border-t border-verified/30 text-xs text-ink-muted flex items-center justify-between">
              <span>TOTAL INCIDENTS LOGGED FOR TARGET:</span>
              <span className="font-bold text-ink text-sm">[{success.reportCount} RECORD(S)]</span>
            </div>
          </div>
        )}

        {/* Dispatch Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Field 01: Type */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-docket text-xs font-bold uppercase tracking-wider text-ink">
                [ FIELD 01: INCIDENT TARGET CATEGORY ]
              </label>
              <span className="font-docket text-[10px] text-ink-muted">SELECT CLASSIFICATION</span>
            </div>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-4 py-3.5 border-2 border-rule-dark bg-paper text-ink font-docket text-xs sm:text-sm leading-relaxed rounded-none shadow-inner cursor-pointer"
            >
              {typeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Field 02: Target Value */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-docket text-xs font-bold uppercase tracking-wider text-ink">
                [ FIELD 02: TARGET IDENTIFIER STRING ]
              </label>
              <span className="font-docket text-[10px] text-ink-muted">
                {type === 'upi' ? 'VPA HANDLE' : type === 'domain' ? 'HOSTNAME' : 'PHONE DIGITS'}
              </span>
            </div>
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={
                type === 'upi'
                  ? 'e.g. payment-clearance@oksbi'
                  : type === 'domain'
                  ? 'e.g. tatasteel-recruitment.xyz'
                  : 'e.g. +91 98765 43210'
              }
              className="w-full px-4 py-3.5 border-2 border-rule-dark bg-paper text-ink placeholder:text-ink-light font-docket text-xs sm:text-sm leading-relaxed rounded-none shadow-inner"
              required
            />
          </div>

          {/* Field 03: Modus Operandi Reason */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-docket text-xs font-bold uppercase tracking-wider text-ink">
                [ FIELD 03: MODUS OPERANDI / INCIDENT DESCRIPTION ]
              </label>
              <span className="font-docket text-[10px] text-ink-muted">OPTIONAL DETAILS</span>
            </div>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Detail what occurred (e.g. Asked for Rs 850 registration deposit prior to interview / impersonated HR / sent fake UPI QR code)..."
              rows={4}
              className="w-full px-4 py-3.5 border-2 border-rule-dark bg-paper text-ink placeholder:text-ink-light font-docket text-xs sm:text-sm leading-relaxed rounded-none shadow-inner"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2">
            <button
              type="submit"
              disabled={loading || !value.trim()}
              className="px-8 py-3.5 bg-danger text-paper-light font-docket text-xs sm:text-sm font-bold uppercase tracking-widest border-2 border-ink hover:bg-ink hover:text-paper-light transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed shadow-[3px_3px_0px_rgba(28,27,24,1)] hover:shadow-[1px_1px_0px_rgba(28,27,24,1)] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="spinner !border-paper-light/30 !border-t-paper-light"></div>
                  [ TRANSMITTING DISPATCH... ]
                </span>
              ) : (
                '🚩 TRANSMIT INCIDENT DISPATCH'
              )}
            </button>

            <span className="font-docket text-[11px] text-ink-muted text-center sm:text-right">
              ANONYMOUS ENTRY // NO PII LOGGED
            </span>
          </div>
        </form>

        {/* Error Alert Box */}
        {error && (
          <div className="mt-6 p-4 bg-danger-bg border-2 border-danger font-docket text-xs text-danger font-bold animate-fade-in">
            [ ALERT: DISPATCH FAILED ] {error}
          </div>
        )}

        {/* Statutory Disclaimer */}
        <Disclaimer />
      </div>
    </div>
  );
}
