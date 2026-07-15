import { useState, useEffect } from "react";

/* ─────────────────────────────────────────────────────────────
   NavBar — Tactical sticky navigation
   ───────────────────────────────────────────────────────────── */
export default function NavBar() {
  const [scrolled, setScrolled]     = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("");

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 60);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { label: "THE MORPH",    href: "#morph"       },
    { label: "EDGE AI",      href: "#edge-ai"     },
    { label: "SPECS",        href: "#specs"        },
    { label: "MISSIONS",     href: "#missions"     },
    { label: "PROCUREMENT",  href: "#procurement"  },
  ];

  const handleLink = (href) => {
    setActiveLink(href);
    setMobileOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-[#06060e]/95 backdrop-blur-lg border-b border-amber-500/20 shadow-[0_2px_40px_rgba(245,158,11,0.06)]"
          : "bg-transparent"
      }`}
    >
      {/* top accent line */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-4 flex items-center justify-between">

        {/* ── Logo mark ── */}
        <a href="#hero" className="flex items-center gap-3 group select-none">
          <img
            src="/logo.svg"
            alt="Trishul Dynamics"
            className="h-11 w-auto transition-opacity duration-300 group-hover:opacity-80"
            draggable="false"
          />
          <div className="leading-none">
            <div className="text-white font-bold tracking-[0.22em] text-sm font-mono">
              TRISHUL
            </div>
            <div className="text-amber-400 font-bold tracking-[0.35em] text-[10px] font-mono">
              DYNAMICS
            </div>
          </div>
        </a>

        {/* ── Desktop nav links ── */}
        <div className="hidden md:flex items-center gap-7">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => handleLink(link.href)}
              className={`relative text-[11px] tracking-[0.18em] font-mono transition-colors duration-200 ${
                activeLink === link.href
                  ? "text-amber-400"
                  : "text-slate-400 hover:text-amber-300"
              }`}
            >
              {link.label}
              {/* active underline */}
              {activeLink === link.href && (
                <span className="absolute -bottom-1 left-0 right-0 h-[1px] bg-amber-500" />
              )}
            </a>
          ))}
        </div>

        {/* ── CTA button ── */}
        <div className="hidden md:flex items-center gap-4">
          {/* live status chip */}
          <div className="flex items-center gap-2 px-3 py-1 border border-emerald-500/30 bg-emerald-500/5 rounded-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-blink" />
            <span className="text-[10px] text-emerald-400 font-mono tracking-widest">SYS LIVE</span>
          </div>
          <a
            href="#contact"
            className="flex items-center gap-2 px-5 py-2.5 border border-amber-500/70 text-amber-400 text-[11px] tracking-[0.18em] font-mono hover:bg-amber-500/10 hover:border-amber-400 transition-all duration-300 group"
          >
            REQUEST BRIEF
            <svg
              className="w-3 h-3 group-hover:translate-x-1 transition-transform duration-200"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>

        {/* ── Mobile hamburger ── */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2 group"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <span className={`block h-[1px] bg-amber-400 transition-all duration-300 ${mobileOpen ? "w-6 rotate-45 translate-y-[7px]" : "w-6"}`} />
          <span className={`block h-[1px] bg-amber-400 transition-all duration-300 ${mobileOpen ? "w-0 opacity-0" : "w-4"}`} />
          <span className={`block h-[1px] bg-amber-400 transition-all duration-300 ${mobileOpen ? "w-6 -rotate-45 -translate-y-[7px]" : "w-6"}`} />
        </button>
      </div>

      {/* ── Mobile menu ── */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          mobileOpen ? "max-h-80 border-t border-amber-500/20" : "max-h-0"
        }`}
      >
        <div className="bg-[#06060e]/98 backdrop-blur-lg px-6 py-5 flex flex-col gap-5">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => handleLink(link.href)}
              className="text-[11px] tracking-[0.18em] font-mono text-slate-400 hover:text-amber-400 transition-colors"
            >
              <span className="text-amber-500/50 mr-2">//</span> {link.label}
            </a>
          ))}
          <a
            href="#contact"
            onClick={() => setMobileOpen(false)}
            className="mt-2 text-center py-3 border border-amber-500/60 text-amber-400 text-[11px] tracking-[0.18em] font-mono hover:bg-amber-500/10 transition-colors"
          >
            REQUEST BRIEF →
          </a>
        </div>
      </div>
    </nav>
  );
}
