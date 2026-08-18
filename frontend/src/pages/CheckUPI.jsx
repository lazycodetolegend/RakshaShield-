import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import RiskScoreCard from '../components/RiskScoreCard';
import ReasonList from '../components/ReasonList';
import Disclaimer from '../components/Disclaimer';

export default function CheckUPI() {
  const [mode, setMode] = useState('text'); // 'text' or 'qr'
  const [value, setValue] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [docketId] = useState(() => 'UPI-' + Math.floor(100000 + Math.random() * 900000));
  const [decodedUpiId, setDecodedUpiId] = useState(null);
  const [rawQrContent, setRawQrContent] = useState(null);
  const [qrPreview, setQrPreview] = useState(null);
  const [showRawQr, setShowRawQr] = useState(false);
  const fileInputRef = useRef(null);

  function resetResults() {
    setResult(null);
    setError(null);
    setDecodedUpiId(null);
    setRawQrContent(null);
  }

  async function handleTextSubmit(e) {
    e.preventDefault();
    if (!value.trim()) return;

    setLoading(true);
    resetResults();

    try {
      const response = await client.post('/check-upi', { value: value.trim() });
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'UPI check query failed. Verify backend service.');
    } finally {
      setLoading(false);
    }
  }

  async function handleQrUpload(file) {
    if (!file) return;

    setLoading(true);
    resetResults();
    setQrPreview(URL.createObjectURL(file));

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await client.post('/check-upi/qr', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setResult(response.data);
      setDecodedUpiId(response.data.decodedUpiId);
      setRawQrContent(response.data.rawQrContent);
    } catch (err) {
      setError(err.response?.data?.error || 'QR code processing failed.');
    } finally {
      setLoading(false);
    }
  }

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (file) handleQrUpload(file);
  }

  function handleDrop(e) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) handleQrUpload(file);
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
                DOCKET FORM 03
              </span>
              <span>REF NO: {docketId}</span>
            </div>
            <h1 className="font-slab font-black text-2xl sm:text-4xl text-ink tracking-tight uppercase leading-tight">
              UPI & Payment ID Query
            </h1>
            <p className="font-docket text-xs sm:text-sm text-ink-muted mt-1">
              Cross-reference suspected Virtual Payment Addresses (VPA) and UPI links against the crowdsourced fraud database.
            </p>
          </div>

          <div className="border border-rule-dark p-2 bg-paper font-docket text-[10px] text-ink-muted shrink-0 text-right">
            <div>DATASET: <span className="font-bold text-ink">COMMUNITY LEDGER</span></div>
            <div>STATUS: <span className="font-bold text-ink">READY</span></div>
          </div>
        </div>

        {/* Advisory Box */}
        <div className="mb-6 p-3 bg-paper border border-rule-dark font-docket text-xs text-ink-muted flex items-start gap-2">
          <span className="text-ink font-bold shrink-0">ℹ️ NOTICE:</span>
          <span>
            This lookup queries crowdsourced community scam records. It is explicitly not a live banking/NPCI verification API.
          </span>
        </div>

        {/* Input Mode Toggle */}
        <div className="flex items-center gap-0 mb-6 border border-rule-dark">
          <button
            type="button"
            onClick={() => { setMode('text'); resetResults(); setQrPreview(null); }}
            className={`flex-1 py-2.5 font-docket text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
              mode === 'text'
                ? 'bg-ink text-paper-light'
                : 'bg-paper text-ink hover:bg-paper-dark'
            }`}
          >
            ENTER UPI ID MANUALLY
          </button>
          <button
            type="button"
            onClick={() => { setMode('qr'); resetResults(); }}
            className={`flex-1 py-2.5 font-docket text-xs font-bold uppercase tracking-wider border-l border-rule-dark transition-colors cursor-pointer ${
              mode === 'qr'
                ? 'bg-ink text-paper-light'
                : 'bg-paper text-ink hover:bg-paper-dark'
            }`}
          >
            SCAN A QR CODE IMAGE
          </button>
        </div>

        {/* Mode: Manual Text Input */}
        {mode === 'text' && (
          <form onSubmit={handleTextSubmit} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="font-docket text-xs font-bold uppercase tracking-wider text-ink">
                  [ FIELD 01: UPI ID OR DEEP-LINK STRING ]
                </label>
                <span className="font-docket text-[10px] text-ink-muted">VPA FORMAT: name@bank</span>
              </div>
              
              <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="e.g. merchant-fee99@oksbi or upi://pay?pa=..."
                className="w-full px-4 py-3.5 border-2 border-rule-dark bg-paper text-ink placeholder:text-ink-light font-docket text-xs sm:text-sm leading-relaxed rounded-none shadow-inner"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2">
              <button
                type="submit"
                disabled={loading || !value.trim()}
                className="px-8 py-3.5 bg-ink text-paper-light font-docket text-xs sm:text-sm font-bold uppercase tracking-widest border-2 border-ink hover:bg-paper-dark hover:text-ink transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed shadow-[3px_3px_0px_rgba(201,191,165,1)] hover:shadow-[1px_1px_0px_rgba(28,27,24,1)] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="spinner !border-paper-light/30 !border-t-paper-light"></div>
                    [ QUERYING SCAM LEDGER... ]
                  </span>
                ) : (
                  '▶ QUERY PAYMENT DATABASE'
                )}
              </button>

              <span className="font-docket text-[11px] text-ink-muted text-center sm:text-right">
                CROSS-REFERENCED ACROSS ALL REPORT TYPES
              </span>
            </div>
          </form>
        )}

        {/* Mode: QR Code Upload */}
        {mode === 'qr' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <label className="font-docket text-xs font-bold uppercase tracking-wider text-ink">
                [ FIELD 01: QR CODE EXHIBIT IMAGE ]
              </label>
              <span className="font-docket text-[10px] text-ink-muted">JSQR DECODER</span>
            </div>

            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-rule-dark bg-paper-light hover:border-ink hover:bg-paper p-8 text-center cursor-pointer transition-all"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                disabled={loading}
              />

              {qrPreview && !loading ? (
                <div className="space-y-3">
                  <div className="inline-block border-2 border-ink p-1 bg-paper-dark">
                    <img src={qrPreview} alt="QR Code Exhibit" className="max-h-48 max-w-full mx-auto" />
                  </div>
                  <p className="text-xs font-docket text-ink-muted">Click to replace QR image</p>
                </div>
              ) : loading ? (
                <div className="flex flex-col items-center gap-3 py-4">
                  <div className="spinner"></div>
                  <div className="font-docket text-xs text-ink font-bold animate-pulse">
                    [ DECODING QR PAYLOAD & QUERYING LEDGER... ]
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="font-slab font-bold text-lg text-ink">
                    Drag & Drop QR Code Image
                  </div>
                  <p className="text-xs font-docket text-ink-muted">
                    or <span className="underline font-bold text-ink">click to attach file</span>
                  </p>
                  <div className="inline-block mt-2 px-2 py-0.5 border border-rule text-[10px] font-docket text-ink-muted bg-paper-dark/50">
                    SUPPORTS: PNG, JPG, WEBP // UPI QR CODES
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

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
                [ SECTION 02: PAYMENT RISK AUDIT CERTIFICATE ]
              </span>
              <span>DOCKET ID: {docketId}</span>
            </div>

            {/* Decoded QR Info — shown above the stamp when in QR mode */}
            {decodedUpiId && (
              <div className="border-2 border-ink bg-paper p-4 font-docket animate-fade-in">
                <div className="text-[10px] text-ink-muted font-bold uppercase tracking-widest mb-2">
                  DECODED QR CODE READOUT
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-ink font-bold">EXTRACTED UPI ID:</span>
                  <span className="px-2 py-0.5 bg-ink text-paper-light text-sm font-mono font-bold">
                    {decodedUpiId}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowRawQr(!showRawQr)}
                  className="text-[11px] text-ink-muted underline cursor-pointer"
                >
                  {showRawQr ? '[-] HIDE' : '[+] VIEW'} RAW QR PAYLOAD
                </button>
                {showRawQr && rawQrContent && (
                  <pre className="mt-2 p-2 bg-paper-dark border border-rule text-[11px] text-ink font-mono whitespace-pre-wrap break-all">
                    {rawQrContent}
                  </pre>
                )}
              </div>
            )}

            <RiskScoreCard
              riskLevel={result.riskLevel}
              score={result.reportCount > 0 ? Math.min(result.reportCount * 25, 100) : 0}
              docketId={docketId}
            />

            {/* Community Report Count Ledger Box */}
            <div className="border border-rule-dark bg-paper p-4 font-docket text-xs flex flex-wrap items-center justify-between gap-3 shadow-inner">
              <div className="flex items-center gap-2">
                <span className="font-bold text-ink">COMMUNITY INCIDENT COUNT:</span>
                <span>{result.reportCount} previous report(s) on file</span>
              </div>
              <span className={`px-2 py-0.5 text-[10px] font-bold border ${
                result.reportCount >= 3 
                  ? 'bg-danger-bg text-danger border-danger' 
                  : result.reportCount > 0 
                  ? 'bg-caution-bg text-caution border-caution' 
                  : 'bg-verified-bg text-verified border-verified'
              }`}>
                {result.reportCount >= 3 ? 'FLIGHT RISK: HIGH REPORTS' : result.reportCount > 0 ? 'SUSPICIOUS: FLAGGED' : 'ZERO INCIDENTS LOGGED'}
              </span>
            </div>

            <ReasonList reasons={result.reasons} />

            {/* Action to file a scam report */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-rule font-docket">
              <span className="text-xs text-ink-muted">
                Did this payment handle request an advance deposit or registration fee?
              </span>
              <Link
                to={`/report?type=upi&value=${encodeURIComponent(decodedUpiId || value)}`}
                className="px-4 py-2 border-2 border-danger text-danger bg-danger-bg font-bold text-xs uppercase tracking-wider hover:bg-danger hover:text-paper-light transition-colors"
              >
                🚩 File Incident Dispatch on this UPI ID
              </Link>
            </div>
          </div>
        )}

        {/* Statutory Disclaimer */}
        <Disclaimer />
      </div>
    </div>
  );
}
