import { useState, useRef } from 'react';
import client from '../api/client';
import RiskScoreCard from '../components/RiskScoreCard';
import ReasonList from '../components/ReasonList';

export default function CheckVoice() {
  const [file, setFile] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [docketId] = useState(() => 'VOC-' + Math.floor(100000 + Math.random() * 900000));
  const fileInputRef = useRef(null);

  function handleFile(selectedFile) {
    if (selectedFile) {
      setFile(selectedFile);
      setAudioUrl(URL.createObjectURL(selectedFile));
      setResult(null);
      setError(null);
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragActive(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFile(dropped);
  }

  function handleFileChange(e) {
    const selected = e.target.files[0];
    if (selected) handleFile(selected);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('audio', file);

      const response = await client.post('/check-voice', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 90000,
      });

      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Acoustic voice analysis failed. Verify ML service is active.');
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
                DOCKET FORM 04
              </span>
              <span>REF NO: {docketId}</span>
            </div>
            <h1 className="font-slab font-black text-2xl sm:text-4xl text-ink tracking-tight uppercase leading-tight">
              Voice & Audio Deepfake Audit
            </h1>
            <p className="font-docket text-xs sm:text-sm text-ink-muted mt-1">
              Analyze WhatsApp voice notes, extortion threats, and emergency voice clips using pretrained neural acoustic models for deepfake synthesis signatures.
            </p>
          </div>

          <div className="border border-rule-dark p-2 bg-paper font-docket text-[10px] text-ink-muted shrink-0 text-right">
            <div>MODEL: <span className="font-bold text-ink">WAV2VEC2-XLSR</span></div>
            <div>SAMPLING: <span className="font-bold text-ink">16 kHz MONO</span></div>
          </div>
        </div>

        {/* Section 01: Audio Exhibit Intake */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-docket text-xs font-bold uppercase tracking-wider text-ink">
                [ FIELD 01: AUDIO EXHIBIT FILE ATTACHMENT ]
              </label>
              <span className="font-docket text-[10px] text-ink-muted">FORMAT: MP3 / WAV / OGG / OPUS / M4A</span>
            </div>

            <div
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed p-6 sm:p-8 text-center cursor-pointer transition-all duration-150 ${
                dragActive
                  ? 'border-ink bg-paper-dark'
                  : 'border-rule-dark bg-paper-light hover:border-ink hover:bg-paper'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*,.mp3,.wav,.ogg,.opus,.m4a,.aac"
                onChange={handleFileChange}
                className="hidden"
                disabled={loading}
              />

              {file ? (
                <div className="space-y-3 font-docket">
                  <div className="text-2xl">🎙️</div>
                  <div className="text-xs sm:text-sm text-ink font-bold">
                    EXHIBIT ATTACHED: <span className="underline">{file.name}</span>
                  </div>
                  <div className="text-[11px] text-ink-muted">
                    SIZE: {(file.size / 1024).toFixed(1)} KB // TYPE: {file.type || 'audio file'}
                  </div>
                  <p className="text-[10px] text-ink-muted pt-1">Click to replace audio file</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-3xl mb-1">🎧</div>
                  <div className="font-slab font-bold text-lg text-ink">
                    Drag & Drop Audio Recording / Voice Note
                  </div>
                  <p className="text-xs font-docket text-ink-muted">
                    or <span className="underline font-bold text-ink">click to select audio exhibit from disk</span>
                  </p>
                  <div className="inline-block mt-2 px-2 py-0.5 border border-rule text-[10px] font-docket text-ink-muted bg-paper-dark/50">
                    WHATSAPP VOICE NOTES, MP3, WAV, OGG, OPUS // MAX 25MB
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Audio Player Preview */}
          {audioUrl && (
            <div className="border border-rule-dark bg-paper p-4 font-docket animate-fade-in shadow-inner">
              <div className="flex items-center justify-between mb-2 text-xs text-ink font-bold uppercase">
                <span>[ AUDIO EVIDENCE PLAYBACK MONITOR ]</span>
                <span className="text-[10px] text-ink-muted">INSPECTION PLAYER</span>
              </div>
              <audio controls src={audioUrl} className="w-full mt-1 custom-audio-player" />
            </div>
          )}

          {/* Action Trigger */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2">
            <button
              type="submit"
              disabled={loading || !file}
              className="px-8 py-3.5 bg-ink text-paper-light font-docket text-xs sm:text-sm font-bold uppercase tracking-widest border-2 border-ink hover:bg-paper-dark hover:text-ink transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed shadow-[3px_3px_0px_rgba(201,191,165,1)] hover:shadow-[1px_1px_0px_rgba(28,27,24,1)] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="spinner !border-paper-light/30 !border-t-paper-light"></div>
                  [ RUNNING NEURAL ACOUSTIC MODEL... ]
                </span>
              ) : (
                '▶ EXECUTE ACOUSTIC DEEPFAKE SCAN'
              )}
            </button>

            <span className="font-docket text-[11px] text-ink-muted text-center sm:text-right">
              PRETRAINED WAV2VEC2 NEURAL CLASSIFIER
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
                [ SECTION 02: ACOUSTIC CLASSIFICATION CERTIFICATE ]
              </span>
              <span>DOCKET ID: {docketId}</span>
            </div>

            <RiskScoreCard
              riskLevel={result.riskLevel}
              score={result.score}
              docketId={docketId}
            />

            {/* Neural Model Telemetry Box */}
            <div className="border border-rule-dark bg-paper p-4 font-docket text-xs flex flex-wrap items-center justify-between gap-3 shadow-inner">
              <div className="flex items-center gap-2">
                <span className="font-bold text-ink">NEURAL CONFIDENCE:</span>
                <span>{result.modelConfidence}% confidence in {result.label?.toUpperCase() || 'SYNTHETIC'} classification</span>
              </div>
              <span className={`px-2 py-0.5 text-[10px] font-bold border ${
                result.riskLevel === 'high'
                  ? 'bg-danger-bg text-danger border-danger'
                  : result.riskLevel === 'medium'
                  ? 'bg-caution-bg text-caution border-caution'
                  : 'bg-verified-bg text-verified border-verified'
              }`}>
                {result.riskLevel === 'high' ? 'CRITICAL: SYNTHETIC CLONE' : result.riskLevel === 'medium' ? 'ELEVATED: AMBIGUOUS' : 'ORGANIC: HUMAN VOICE'}
              </span>
            </div>

            <ReasonList reasons={result.reasons} />
          </div>
        )}

        {/* Dedicated Voice Deepfake Statutory Advisory */}
        <aside className="mt-10 border border-rule-dark bg-paper-dark/30 p-4 sm:p-5 font-docket text-xs text-ink-muted leading-relaxed">
          <div className="flex items-center gap-2 mb-2 text-ink font-bold uppercase tracking-wider text-[11px]">
            <span className="inline-block px-1.5 py-0.5 bg-ink text-paper-light text-[9px] font-mono">
              AI MODEL ADVISORY
            </span>
            <span>VOICE CLASSIFIER TECHNICAL NOTICE</span>
          </div>
          <p className="text-ink text-xs sm:text-sm font-medium leading-normal">
            <strong>Notice:</strong> This uses a pretrained AI model to estimate the likelihood a voice clip is synthetic. It is a strong signal, not a certified result, and can be wrong. Verify by calling the person back on a known number before acting.
          </p>
          <div className="mt-3 pt-2 border-t border-rule text-[10px] text-ink-muted flex flex-wrap justify-between gap-1">
            <span>MODEL: WAV2VEC2 AUDIO CLASSIFICATION</span>
            <span>DATASETS: ASVSPOOF2021 / WAVEFAKE / MULTILINGUAL</span>
          </div>
        </aside>
      </div>
    </div>
  );
}
