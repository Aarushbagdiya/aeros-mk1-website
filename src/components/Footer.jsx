/* ─────────────────────────────────────────────────────────────
   Footer — Tactical minimal footer with grid overlay
   ───────────────────────────────────────────────────────────── */
export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative bg-[#04040a] border-t border-amber-500/10 overflow-hidden">
      {/* Subtle grid */}
      <div className="absolute inset-0 bg-grid-fine opacity-30 pointer-events-none" />
      {/* Top amber line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <img
                src="/logo.svg"
                alt="Trishul Dynamics"
                className="h-11 w-auto"
                draggable="false"
              />
              <div>
                <div className="text-white font-bold tracking-[0.22em] text-sm font-mono">TRISHUL</div>
                <div className="text-amber-400 font-bold tracking-[0.35em] text-[10px] font-mono">DYNAMICS</div>
              </div>
            </div>
            <p className="text-slate-500 text-xs leading-relaxed max-w-xs mb-6">
              Designing the next generation of morphing, multi-domain autonomous systems
              for the Indian Armed Forces and critical infrastructure protection.
            </p>
            {/* Compliance badges */}
            <div className="flex flex-wrap gap-2">
              {["PIL ELIGIBLE", "iDEX", "MAKE-II", "MSME"].map((tag) => (
                <span
                  key={tag}
                  className="text-[8px] px-2 py-1 border border-slate-800 text-slate-600 font-mono tracking-widest"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <div className="font-mono text-[9px] tracking-widest text-amber-500/50 mb-4">NAVIGATION</div>
            <div className="space-y-2.5">
              {[
                ["The Morph",    "#morph"      ],
                ["Edge AI",      "#edge-ai"    ],
                ["Specifications","#specs"     ],
                ["Missions",     "#missions"   ],
                ["Procurement",  "#procurement"],
                ["Contact",      "#contact"    ],
              ].map(([label, href]) => (
                <a
                  key={href}
                  href={href}
                  className="block text-[11px] font-mono text-slate-500 hover:text-amber-400 transition-colors"
                >
                  {label}
                </a>
              ))}
            </div>
          </div>

          {/* Legal / info */}
          <div>
            <div className="font-mono text-[9px] tracking-widest text-amber-500/50 mb-4">INFORMATION</div>
            <div className="space-y-2.5">
              {[
                "Privacy Policy",
                "NDA Template",
                "Terms of Use",
                "Export Control Notice",
                "Responsible Disclosure",
              ].map((item) => (
                <div key={item} className="text-[11px] font-mono text-slate-600 cursor-pointer hover:text-slate-400 transition-colors">
                  {item}
                </div>
              ))}
            </div>
            <div className="mt-6 border border-slate-800 p-3">
              <div className="font-mono text-[8px] text-slate-700 tracking-widest mb-1">OPERATIONAL HQ</div>
              <div className="text-[10px] text-slate-500">Pune, Maharashtra, India</div>
              <div className="text-[10px] text-slate-600 font-mono mt-0.5">trishul.dynamics@gmail.com</div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-mono text-[9px] text-slate-700 tracking-widest">
            © {year} TRISHUL DYNAMICS PVT. LTD. · ALL RIGHTS RESERVED
          </p>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500/40" />
            <span className="font-mono text-[9px] text-slate-700 tracking-widest">
              AEROS MK-1 REV-3.2 · PROTOTYPE PHASE · FOR AUTHORISED EYES ONLY
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
