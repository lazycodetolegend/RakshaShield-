import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const navLinks = [
  { to: '/', code: '00', label: 'Overview' },
  { to: '/check-message', code: '01', label: 'Verify Message' },
  { to: '/check-link', code: '02', label: 'Audit Link' },
  { to: '/check-upi', code: '03', label: 'Check UPI' },
  { to: '/check-voice', code: '04', label: 'Voice Deepfake' },
  { to: '/report', code: '05', label: 'File Report' },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="bg-paper-light border-b border-rule-dark ruled-double-bottom sticky top-0 z-50">
      {/* Top Metadata Bar */}
      <div className="bg-paper-dark/60 border-b border-rule px-4 sm:px-6 py-1 text-[11px] font-docket text-ink-muted flex items-center justify-between">
        <div>
          <span>SYSTEM PROTOCOL: RAKSHA-DEFENSE</span>
        </div>
        <div className="hidden sm:flex items-center gap-4">
          <span>PUBLIC INTAKE DESK</span>
          <span>JURISDICTION: IN-CYBER</span>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Brand Identity */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 border-2 border-ink bg-paper-dark flex items-center justify-center font-slab font-black text-lg text-ink shadow-[2px_2px_0px_rgba(28,27,24,1)] group-hover:bg-ink group-hover:text-paper-light transition-all">
              RS
            </div>
            <div>
              <div className="font-slab font-black text-xl tracking-tight text-ink flex items-center gap-2">
                <span>RAKSHASHIELD</span>
                <span className="text-[10px] font-docket font-normal bg-ink/10 text-ink px-1.5 py-0.5 rounded border border-rule-dark">
                  DOCKET DESK
                </span>
              </div>
              <p className="text-[11px] font-docket text-ink-muted -mt-0.5 tracking-wider uppercase">
                Forensic Scam Risk Verification
              </p>
            </div>
          </Link>

          {/* Desktop Document Tabs */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-3 py-1.5 font-docket text-xs font-semibold uppercase tracking-wide border transition-all duration-150 flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-ink text-paper-light border-ink shadow-[2px_2px_0px_rgba(201,191,165,1)]'
                      : 'bg-paper-light text-ink hover:bg-paper hover:border-ink-muted border-rule'
                  }`}
                >
                  <span className={isActive ? 'text-paper/70' : 'text-ink-light'}>{link.code}:</span>
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden p-2 border border-rule-dark bg-paper text-ink hover:bg-ink hover:text-paper transition-colors"
            aria-label="Toggle menu"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden border-t border-rule-dark bg-paper-light p-4 space-y-2 animate-fade-in font-docket">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className={`block px-3 py-2 text-xs font-semibold uppercase tracking-wide border ${
                  isActive
                    ? 'bg-ink text-paper-light border-ink'
                    : 'bg-paper text-ink border-rule hover:border-ink-muted'
                }`}
              >
                <span className="text-ink-light mr-2">[{link.code}]</span>
                {link.label}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
