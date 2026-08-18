import { useState } from 'react';
import client from '../api/client';
import RiskScoreCard from '../components/RiskScoreCard';
import ReasonList from '../components/ReasonList';
import UploadScreenshot from '../components/UploadScreenshot';
import Disclaimer from '../components/Disclaimer';

export default function CheckMessage() {
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [error, setError] = useState(null);
  const [extractedText, setExtractedText] = useState(null);
  const [showExtracted, setShowExtracted] = useState(false);
  const [docketId] = useState(() => 'MSG-' + Math.floor(100000 + Math.random() * 900000));

  async function handleSubmit(e) {
    e.preventDefault();
    if (!text.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setExtractedText(null);

    try {
      const response = await client.post('/check-message', { text: text.trim() });
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Verification dispatch failed. Ensure services are online.');
    } finally {
      setLoading(false);
    }
  }

  async function handleScreenshot(file) {
    setOcrLoading(true);
    setError(null);
    setResult(null);
    setExtractedText(null);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await client.post('/check-message/ocr', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setResult(response.data);
      if (response.data.extractedText) {
        setExtractedText(response.data.extractedText);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'OCR processing failed on attached image.');
    } finally {
      setOcrLoading(false);
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
                DOCKET FORM 01
              </span>
              <span>REF NO: {docketId}</span>
            </div>
            <h1 className="font-slab font-black text-2xl sm:text-4xl text-ink tracking-tight uppercase leading-tight">
              Offer & Message Verification
            </h1>
            <p className="font-docket text-xs sm:text-sm text-ink-muted mt-1">
              Analyze job proposals, WhatsApp recruitment messages, tasks, and emails for upfront fee demands and pressure patterns.
            </p>
          </div>

          <div className="border border-rule-dark p-2 bg-paper font-docket text-[10px] text-ink-muted shrink-0 text-right">
            <div>SCAN TYPE: <span className="font-bold text-ink">NLP / HEURISTIC</span></div>
            <div>STATUS: <span className="font-bold text-ink">READY</span></div>
          </div>
        </div>

        {/* Section 01: Transcript Intake */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-docket text-xs font-bold uppercase tracking-wider text-ink">
                [ FIELD 01: MESSAGE / OFFER TRANSCRIPT TEXT ]
              </label>
              <span className="font-docket text-[10px] text-ink-muted">RAW TEXT INPUT</span>
            </div>
            
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste the suspicious job offer letter, WhatsApp task assignment, or email body text here..."
              rows={7}
              className="w-full px-4 py-3.5 border-2 border-rule-dark bg-paper text-ink placeholder:text-ink-light font-docket text-xs sm:text-sm leading-relaxed rounded-none shadow-inner"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2">
            <button
              type="submit"
              disabled={loading || !text.trim()}
              className="px-8 py-3.5 bg-ink text-paper-light font-docket text-xs sm:text-sm font-bold uppercase tracking-widest border-2 border-ink hover:bg-paper-dark hover:text-ink transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed shadow-[3px_3px_0px_rgba(201,191,165,1)] hover:shadow-[1px_1px_0px_rgba(28,27,24,1)] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="spinner !border-paper-light/30 !border-t-paper-light"></div>
                  [ RUNNING FORENSIC SCORER... ]
                </span>
              ) : (
                '▶ EXECUTE SCAM EVALUATION'
              )}
            </button>

            <span className="font-docket text-[11px] text-ink-muted text-center sm:text-right">
              CONFIDENTIAL & ANONYMOUS INTAKE
            </span>
          </div>
        </form>

        {/* Section 02: Evidence Attachment OCR */}
        <UploadScreenshot onUpload={handleScreenshot} isLoading={ocrLoading} />

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
                [ SECTION 03: VERIFICATION CERTIFICATE ]
              </span>
              <span>DOCKET ID: {docketId}</span>
            </div>

            <RiskScoreCard riskLevel={result.riskLevel} score={result.score} docketId={docketId} />
            <ReasonList reasons={result.reasons} />

            {/* Collapsible OCR Text Readout */}
            {extractedText && (
              <div className="mt-4 border border-rule-dark bg-paper font-docket p-4">
                <button
                  type="button"
                  onClick={() => setShowExtracted(!showExtracted)}
                  className="text-xs font-bold text-ink uppercase flex items-center justify-between w-full cursor-pointer"
                >
                  <span>{showExtracted ? '[-] HIDE' : '[+] VIEW'} EXTRACTED OCR TEXT TRANSCRIPT</span>
                  <span className="text-[10px] text-ink-muted">TESSERACT READOUT</span>
                </button>
                {showExtracted && (
                  <pre className="mt-3 p-3 bg-paper-light border border-rule text-xs text-ink whitespace-pre-wrap font-mono leading-relaxed max-h-60 overflow-y-auto">
                    {extractedText}
                  </pre>
                )}
              </div>
            )}
          </div>
        )}

        {/* Statutory Disclaimer */}
        <Disclaimer />
      </div>
    </div>
  );
}
