import { useState, useRef } from 'react';

export default function UploadScreenshot({ onUpload, isLoading }) {
  const [preview, setPreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef(null);

  function handleFile(file) {
    if (file && file.type.startsWith('image/')) {
      setPreview(URL.createObjectURL(file));
      setFileName(file.name);
      onUpload(file);
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  }

  function handleChange(e) {
    const file = e.target.files[0];
    handleFile(file);
  }

  return (
    <div className="mt-6 border border-dashed border-rule-dark bg-paper/40 p-4 sm:p-5 font-docket relative">
      <div className="flex items-center justify-between mb-3 text-xs text-ink-muted">
        <span className="font-bold text-ink uppercase tracking-wider">
          [ ALTERNATIVE INTAKE: EVIDENCE ATTACHMENT ]
        </span>
        <span className="text-[10px]">TESSERACT OCR SCANNER</span>
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed p-6 sm:p-8 text-center cursor-pointer transition-all duration-150 ${
          dragActive
            ? 'border-ink bg-paper-dark'
            : 'border-rule-dark bg-paper-light hover:border-ink hover:bg-paper'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleChange}
          className="hidden"
          disabled={isLoading}
        />
        
        {preview ? (
          <div className="space-y-3">
            <div className="relative inline-block border-2 border-ink p-1 bg-paper-dark">
              <img src={preview} alt="Attached Evidence" className="max-h-48 max-w-full mx-auto" />
            </div>
            <div className="text-xs text-ink font-semibold">
              EXHIBIT ATTACHED: <span className="font-mono underline">{fileName}</span>
            </div>
            <p className="text-[11px] text-ink-muted">Click to replace evidence image</p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="font-slab font-bold text-lg text-ink">
              Drag & Drop Screenshot Exhibit
            </div>
            <p className="text-xs text-ink-muted">
              or <span className="underline font-bold text-ink">click to attach file from directory</span>
            </p>
            <div className="inline-block mt-2 px-2 py-0.5 border border-rule text-[10px] text-ink-muted bg-paper-dark/50">
              SUPPORTS: PNG, JPG, WEBP // MAX 10MB
            </div>
          </div>
        )}

        {isLoading && (
          <div className="absolute inset-0 bg-paper-light/95 flex flex-col items-center justify-center gap-3">
            <div className="spinner"></div>
            <div className="font-docket text-xs text-ink font-bold animate-pulse">
              [ EXECUTING OPTICAL OCR CHARACTER EXTRACTION... ]
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
