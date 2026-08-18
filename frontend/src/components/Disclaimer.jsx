export default function Disclaimer() {
  return (
    <aside className="mt-10 border border-rule-dark bg-paper-dark/30 p-4 sm:p-5 font-docket text-xs text-ink-muted leading-relaxed">
      <div className="flex items-center gap-2 mb-2 text-ink font-bold uppercase tracking-wider text-[11px]">
        <span className="inline-block px-1.5 py-0.5 bg-ink text-paper-light text-[9px] font-mono">
          STATUTORY NOTICE
        </span>
        <span>MANDATORY PUBLIC RISK ADVISORY</span>
      </div>
      <p className="text-ink text-xs sm:text-sm font-medium leading-normal">
        <strong>Disclaimer:</strong> This is a risk indicator based on known scam patterns, not a certified fraud verification. Always verify independently before making a decision.
      </p>
      <div className="mt-3 pt-2 border-t border-rule text-[10px] text-ink-muted flex flex-wrap justify-between gap-1">
        <span>SECURITY PROTOCOL: RAKSHASHIELD OPEN-VERIFY</span>
        <span>NON-AFFILIATED WITH NPCI / BANKING NETWORKS</span>
      </div>
    </aside>
  );
}
