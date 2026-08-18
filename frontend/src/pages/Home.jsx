import { Link } from 'react-router-dom';

const intakeForms = [
  {
    to: '/check-message',
    code: 'FORM-01',
    category: 'TRANSCRIPT AUDIT',
    title: 'Verify Offer or Message',
    description: 'Paste suspected internship letter, WhatsApp job offer, HR email, or task compensation text to evaluate deceptive patterns.',
    actionText: 'OPEN INTAKE DOCKET',
    tag: 'OCR SUPPORTED',
  },
  {
    to: '/check-link',
    code: 'FORM-02',
    category: 'DOMAIN FORENSICS',
    title: 'Audit Suspicious Link',
    description: 'Submit an unfamiliar URL to verify domain registration age (WHOIS), corporate typosquatting signatures, and malicious TLDs.',
    actionText: 'EXECUTE DOMAIN AUDIT',
    tag: 'WHOIS + TYPOSQUAT',
  },
  {
    to: '/check-upi',
    code: 'FORM-03',
    category: 'PAYMENT PROTOCOL',
    title: 'Check UPI / Pay Handle',
    description: 'Query payment handles against crowdsourced cyber-fraud records prior to authorizing money transfers or deposits.',
    actionText: 'QUERY REGISTRY',
    tag: 'COMMUNITY LEDGER',
  },
  {
    to: '/check-voice',
    code: 'FORM-04',
    category: 'AUDIO FORENSICS',
    title: 'Voice Deepfake Audit',
    description: 'Upload audio notes or recorded calls to detect synthetic AI voice cloning using pretrained neural acoustic models.',
    actionText: 'AUDIT VOICE CLIP',
    tag: 'WAV2VEC2 AI',
  },
];

export default function Home() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Main Official Document Sheet */}
      <div className="document-sheet border-2 border-ink p-6 sm:p-10 mb-8 relative">
        {/* Header Ribbon */}
        <div className="border-b-2 border-ink pb-6 mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 font-docket text-xs text-ink-muted uppercase tracking-widest mb-1.5">
              <span className="px-1.5 py-0.5 bg-ink text-paper-light text-[10px] font-bold">
                DOCUMENT NO.
              </span>
              <span>RS-VERIFY-2026 // PUBLIC EDITION</span>
            </div>
            <h1 className="font-slab font-black text-3xl sm:text-5xl text-ink tracking-tight leading-none uppercase">
              Check Before You Trust.
            </h1>
            <p className="font-docket text-xs sm:text-sm text-ink-muted mt-2 max-w-xl">
              Official fraud-pattern verification desk for Indian students and families. Analyze offers, links, payment IDs, and voice notes before trusting or transferring funds.
            </p>
          </div>
          
          <div className="border-2 border-dashed border-rule-dark p-3 bg-paper-dark/30 font-docket text-[11px] text-ink-muted text-right shrink-0">
            <div>CLEARANCE: <span className="font-bold text-ink">PUBLIC OPEN</span></div>
            <div>SERVICE: <span className="font-bold text-verified">ONLINE / ACTIVE</span></div>
            <div>DISPATCH: <span className="font-bold text-ink">INSTANT</span></div>
          </div>
        </div>

        {/* Section 01: Intake Portals */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-rule-dark">
            <h2 className="font-docket text-xs font-bold uppercase tracking-wider text-ink">
              [ SECTION 01: SELECT VERIFICATION INTAKE DOCKET ]
            </h2>
            <span className="font-docket text-[11px] text-ink-muted hidden sm:inline">SELECT PROTOCOL BELOW</span>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {intakeForms.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="group border-2 border-rule-dark bg-paper hover:border-ink hover:bg-paper-light p-5 sm:p-6 transition-all duration-150 flex flex-col justify-between shadow-[2px_2px_0px_rgba(201,191,165,1)] hover:shadow-[4px_4px_0px_rgba(28,27,24,1)] hover:-translate-y-0.5"
              >
                <div>
                  <div className="flex items-center justify-between font-docket text-[11px] text-ink-muted mb-3 pb-2 border-b border-rule">
                    <span className="font-bold text-ink">{item.code}</span>
                    <span className="px-1 py-0.5 bg-paper-dark border border-rule-dark text-[9px] font-semibold text-ink">
                      {item.tag}
                    </span>
                  </div>

                  <div className="font-docket text-[10px] uppercase font-bold text-ink-muted tracking-wider">
                    {item.category}
                  </div>
                  <h3 className="font-slab font-bold text-xl text-ink mt-1 mb-2 group-hover:text-ink transition-colors leading-snug">
                    {item.title}
                  </h3>
                  <p className="font-docket text-xs text-ink-muted leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-6 pt-3 border-t border-rule font-docket text-xs font-bold text-ink uppercase tracking-wide group-hover:underline">
                  {item.actionText}
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Section 02: Community Reporting Banner */}
        <div className="border-2 border-dashed border-danger/40 bg-danger-bg p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 font-docket text-xs font-bold text-danger uppercase tracking-wider">
              <span>⚠️ COMMUNITY DEFENSE DISPATCH</span>
              <span className="text-[10px] px-1 py-0.2 bg-danger text-paper-light">URGENT</span>
            </div>
            <h3 className="font-slab font-bold text-lg text-ink mt-1">
              Encountered an active scammer or fraudulent handle?
            </h3>
            <p className="font-docket text-xs text-ink-muted mt-1 max-w-xl">
              File an incident dispatch to add the suspicious UPI ID, malicious domain, or phone number to the collective protection ledger.
            </p>
          </div>

          <Link
            to="/report"
            className="px-5 py-2.5 bg-danger text-paper-light font-docket text-xs font-bold uppercase tracking-wider border border-ink hover:bg-ink hover:text-paper-light transition-colors shrink-0 shadow-[2px_2px_0px_rgba(28,27,24,1)]"
          >
            🚩 File Scam Report
          </Link>
        </div>

        {/* Document Footer Notice */}
        <div className="mt-8 pt-4 border-t border-rule font-docket text-[11px] text-ink-muted flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <span>RAKSHASHIELD // DEFENSIVE FRAUD INTELLIGENCE</span>
          <span>FREE & ANONYMOUS PUBLIC ACCESS</span>
        </div>
      </div>
    </div>
  );
}
