export default function ReasonList({ reasons }) {
  if (!reasons || reasons.length === 0) return null;

  return (
    <div className="document-sheet border border-rule-dark animate-fade-in mt-6">
      {/* Ledger Header */}
      <div className="px-5 py-3 border-b border-rule-dark bg-paper-dark/50 flex items-center justify-between font-docket text-xs text-ink">
        <div className="flex items-center gap-2">
          <span className="font-bold tracking-wider uppercase">[ SECTION 02: FORENSIC RED FLAGS ]</span>
          <span className="text-ink-muted">({reasons.length} findings recorded)</span>
        </div>
        <span className="text-[10px] text-ink-muted uppercase hidden sm:inline">LEGAL AUDIT LOG</span>
      </div>

      {/* Itemized Findings */}
      <div className="divide-y divide-rule font-docket text-xs sm:text-sm">
        {reasons.map((reason, index) => {
          const flagNum = String(index + 1).padStart(2, '0');
          const isWarning = !reason.toLowerCase().includes('no known') && !reason.toLowerCase().includes('no prior');

          return (
            <div key={index} className="p-4 sm:px-6 flex items-start gap-3 sm:gap-4 hover:bg-paper/30 transition-colors">
              <span className={`px-2 py-0.5 text-[11px] font-bold shrink-0 border ${
                isWarning 
                  ? 'bg-danger-bg text-danger border-danger/40' 
                  : 'bg-verified-bg text-verified border-verified/40'
              }`}>
                FLAG-{flagNum}
              </span>
              <div className="flex-1 text-ink leading-relaxed">
                <span className="font-medium">{reason}</span>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Ledger Footer */}
      <div className="px-5 py-2.5 bg-paper-dark/30 border-t border-rule text-[11px] font-docket text-ink-muted flex items-center justify-between">
        <span>AUDIT CODE: PATTERN-MATCH // RULE-ENGINE</span>
        <span>STATUS: VERIFIED BY PROTOCOL</span>
      </div>
    </div>
  );
}
