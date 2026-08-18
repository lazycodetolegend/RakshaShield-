const riskConfig = {
  low: {
    label: 'VERIFIED // LOW RISK',
    sublabel: 'No standard fraudulent signatures detected.',
    stampClass: 'stamp-verified',
    color: 'text-verified',
    badge: 'CLEARANCE ISSUED',
    stampBorder: 'border-verified',
    code: 'SEC-01-PASS',
  },
  medium: {
    label: 'CAUTION // ELEVATED RISK',
    sublabel: 'Suspicious traits detected. Independent verification required.',
    stampClass: 'stamp-caution',
    color: 'text-caution',
    badge: 'PROCEED WITH CAUTION',
    stampBorder: 'border-caution',
    code: 'SEC-02-WARN',
  },
  high: {
    label: 'DANGER // HIGH RISK DETECTED',
    sublabel: 'Strong known scam patterns identified. Do not pay or proceed.',
    stampClass: 'stamp-danger',
    color: 'text-danger',
    badge: 'KNOWN SCAM PATTERN',
    stampBorder: 'border-danger',
    code: 'SEC-03-CRITICAL',
  },
};

export default function RiskScoreCard({ riskLevel, score, docketId }) {
  const config = riskConfig[riskLevel] || riskConfig.low;
  const displayScore = score !== undefined ? score : 0;
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';

  return (
    <div className="document-sheet border-2 border-ink p-6 sm:p-8 animate-fade-in relative overflow-hidden">
      {/* Background Seal Watermark */}
      <div className="absolute right-4 -bottom-6 font-slab font-black text-7xl sm:text-9xl text-ink/[0.03] select-none pointer-events-none tracking-tighter">
        RAKSHA
      </div>

      {/* Header Docket Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-rule-dark text-xs font-docket text-ink-muted">
        <div className="flex items-center gap-2">
          <span className="font-bold text-ink tracking-wider">[ FORENSIC RISK AUDIT ]</span>
          {docketId && <span>DOCKET: {docketId}</span>}
        </div>
        <div className="text-right">
          <span>EVALUATED: {timestamp}</span>
        </div>
      </div>

      {/* Body: Rubber Stamp & Score Breakdown */}
      <div className="pt-6 pb-2 flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
        {/* Rubber Stamp Badge */}
        <div className={`p-4 sm:p-5 border-4 border-dashed rounded-sm ${config.stampClass} transition-transform`}>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-docket tracking-widest font-black uppercase underline decoration-2">
              OFFICIAL VERDICT:
            </span>
            <span className="text-[10px] font-docket px-1.5 py-0.5 border border-current font-bold">
              {config.code}
            </span>
          </div>
          <h3 className="font-slab font-black text-2xl sm:text-3xl tracking-tight uppercase leading-none mt-1">
            {config.label}
          </h3>
          <p className="font-docket text-xs mt-2 font-medium opacity-90 max-w-sm">
            {config.sublabel}
          </p>
        </div>

        {/* Numeric Index Box */}
        <div className="bg-paper-dark/40 border border-rule-dark p-4 rounded-none text-center min-w-[160px] font-docket shadow-inner">
          <div className="text-[10px] text-ink-muted uppercase tracking-widest font-bold">
            Risk Factor Index
          </div>
          <div className="flex items-baseline justify-center gap-1 my-1">
            <span className={`font-slab font-black text-4xl sm:text-5xl ${config.color}`}>
              {displayScore}
            </span>
            <span className="text-sm text-ink-muted font-bold">/100</span>
          </div>
          <div className="w-full bg-rule h-1.5 rounded-none overflow-hidden mt-2">
            <div
              className={`h-full ${
                riskLevel === 'high'
                  ? 'bg-danger'
                  : riskLevel === 'medium'
                  ? 'bg-caution'
                  : 'bg-verified'
              }`}
              style={{ width: `${Math.max(displayScore, 5)}%` }}
            />
          </div>
          <div className="text-[10px] text-ink-muted mt-2 font-semibold uppercase tracking-wider">
            {config.badge}
          </div>
        </div>
      </div>
    </div>
  );
}
