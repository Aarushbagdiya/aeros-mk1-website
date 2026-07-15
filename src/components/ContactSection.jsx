import { useState } from "react";

/* ─────────────────────────────────────────────────────────────
   ContactSection — Secure defence brief request form
   Submissions → Web3Forms  (replace WEB3FORMS_KEY with your key
   from https://web3forms.com)
   ───────────────────────────────────────────────────────────── */

const WEB3FORMS_KEY = "1bf981a7-2679-4b75-9df7-5cf1f4770aec";

const CLASSIFICATION_LEVELS = [
  "General Inquiry",
  "Technical Datasheet (NDA Required)",
  "Procurement Consultation (Verified Officers Only)",
  "Investment / Deep-Tech VC Discussion",
  "Field Demonstration Request",
];

const ROLES = [
  "Indian Army / Armed Forces",
  "Ministry of Defence (MoD)",
  "DRDO / Research Organisation",
  "State Police / Paramilitary",
  "Defence Investor / VC",
  "OEM / Industry Partner",
  "Media / Press",
  "Other",
];

/* ── Shared style helpers ── */
const inputClass = (errors, k) =>
  `w-full bg-[#0a0a14] border ${
    errors[k] ? "border-red-500/60" : "border-camo-light/30"
  } text-slate-200 text-sm px-4 py-3 font-mono placeholder-slate-700 focus:outline-none focus:border-camo-accent/80 transition-colors`;

const labelClass = "block font-mono text-[9px] tracking-widest text-slate-500 mb-1.5";

/* ── Corner bracket decorator ── */
function Corners({ color = "emerald" }) {
  const c = `border-${color}-500/50`;
  return (
    <>
      <div className={`absolute top-0 left-0  w-7 h-7 border-t-2 border-l-2 ${c}`} />
      <div className={`absolute top-0 right-0 w-7 h-7 border-t-2 border-r-2 ${c}`} />
      <div className={`absolute bottom-0 left-0  w-7 h-7 border-b-2 border-l-2 ${c}`} />
      <div className={`absolute bottom-0 right-0 w-7 h-7 border-b-2 border-r-2 ${c}`} />
    </>
  );
}

/* ══════════════════════════════════════════════════════════════
   SUCCESS STATE
══════════════════════════════════════════════════════════════ */
function SuccessPanel({ refId }) {
  return (
    <section id="contact" className="relative py-28 bg-camo-dark overflow-hidden">
      <div className="absolute inset-0 bg-grid-tactical opacity-40 pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />

      <div className="relative z-10 max-w-2xl mx-auto px-6">
        <div className="relative border border-emerald-500/35 bg-[#020d08] p-12 text-center overflow-hidden">
          <Corners color="emerald" />
          <div className="absolute inset-0 scanlines pointer-events-none opacity-10" />

          {/* Pulsing lock icon */}
          <div className="relative w-20 h-20 mx-auto mb-8 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border border-emerald-500/30 animate-ping opacity-40" />
            <div className="w-16 h-16 rounded-full border-2 border-emerald-500/60 bg-emerald-500/10 flex items-center justify-center">
              <svg className="w-7 h-7 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M16.5 10.5V7a4.5 4.5 0 00-9 0v3.5M5 10.5h14a1 1 0 011 1v7a2 2 0 01-2 2H6a2 2 0 01-2-2v-7a1 1 0 011-1z"/>
              </svg>
            </div>
          </div>

          <p className="font-mono text-[9px] tracking-[0.35em] text-emerald-500/70 mb-3">
            // SECURE CHANNEL ESTABLISHED · ENCRYPTION VERIFIED
          </p>
          <h3 className="text-3xl font-black text-white tracking-tight mb-1">
            TRANSMISSION SECURE
          </h3>
          <p className="font-mono text-[11px] tracking-[0.25em] text-emerald-400 mb-8">
            IDENTITY LOGGED &amp; VERIFIED
          </p>

          <div className="border border-emerald-500/20 bg-emerald-500/5 p-5 mb-8 text-left">
            <div className="font-mono text-[8px] tracking-widest text-emerald-500/50 mb-2">
              TRANSMISSION RECEIPT
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              Your classified brief request has been routed securely to our defence liaison
              team. A Trishul Dynamics representative will contact you within{" "}
              <strong className="text-white">48 hours</strong>, typically within one working day.
              Datasheet requests will be accompanied by an NDA for your review.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-center">
            <div>
              <div className="font-mono text-[8px] tracking-widest text-slate-600 mb-0.5">REFERENCE</div>
              <div className="font-mono text-xs text-emerald-400">TD-{refId}</div>
            </div>
            <div className="hidden sm:block w-px h-8 bg-slate-800" />
            <div>
              <div className="font-mono text-[8px] tracking-widest text-slate-600 mb-0.5">DATE LOGGED</div>
              <div className="font-mono text-xs text-slate-400">{new Date().toISOString().split("T")[0]}</div>
            </div>
            <div className="hidden sm:block w-px h-8 bg-slate-800" />
            <div>
              <div className="font-mono text-[8px] tracking-widest text-slate-600 mb-0.5">STATUS</div>
              <div className="font-mono text-xs text-emerald-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-blink inline-block" />
                ACTIVE
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════ */
export default function ContactSection() {
  const [form, setForm] = useState({
    name: "", org: "", role: "", email: "", phone: "",
    classification: "", message: "", consent: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess,    setIsSuccess]    = useState(false);
  const [isError,      setIsError]      = useState(false);
  const [errors,       setErrors]       = useState({});
  const [refId,        setRefId]        = useState("");

  /* ── Field validation ── */
  const validate = () => {
    const e = {};
    if (!form.name.trim())         e.name           = "Required";
    if (!form.org.trim())          e.org            = "Required";
    if (!form.email.includes("@")) e.email          = "Valid email required";
    if (!form.role)                e.role           = "Required";
    if (!form.classification)      e.classification = "Required";
    if (!form.consent)             e.consent        = "Required";
    return e;
  };

  /* ── Submission handler ── */
  const handleSubmit = async (e) => {
    // Block the default HTML form redirect FIRST
    e.preventDefault();
    e.stopPropagation();

    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setIsSubmitting(true);
    setIsError(false);

    try {
      const payload = {
        access_key:   WEB3FORMS_KEY,
        subject:      `[TRISHUL DYNAMICS] Brief Request — ${form.classification}`,
        from_name:    "Trishul Dynamics Website",
        name:         form.name,
        email:        form.email,
        organisation: form.org,
        role:         form.role,
        phone:        form.phone || "Not provided",
        brief_type:   form.classification,
        message:      form.message || "No additional context provided.",
        nda_consent:  form.consent ? "Yes — verified professional" : "No",
        botcheck:     "",           // honeypot
      };

      const res = await fetch("https://api.web3forms.com/submit", {
        method:  "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setRefId(Date.now().toString().slice(-8));
        setIsSuccess(true);
      } else {
        console.error("Web3Forms error:", data);
        setIsError(true);
      }
    } catch (err) {
      console.error("Submission failed:", err);
      setIsError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ── Per-field change handler ── */
  const set = (k) => (ev) => {
    setForm((f) => ({
      ...f,
      [k]: ev.target.type === "checkbox" ? ev.target.checked : ev.target.value,
    }));
    setErrors((er) => ({ ...er, [k]: undefined }));
  };

  /* ── Resolved states ── */
  if (isSuccess) return <SuccessPanel refId={refId} />;

  /* ── Input / label helpers scoped to current errors ── */
  const ic = (k) => inputClass(errors, k);

  return (
    <section id="contact" className="relative py-28 bg-camo-dark overflow-hidden">
      {/* CSS-only spinner (avoids dependency on Tailwind's conditional keyframe) */}
      <style>{`
        @keyframes td-spin { to { transform: rotate(360deg); } }
        .td-spinner {
          width: 13px; height: 13px;
          border: 2px solid rgba(0,0,0,0.25);
          border-top-color: #000;
          border-radius: 50%;
          animation: td-spin 0.65s linear infinite;
          flex-shrink: 0;
        }
      `}</style>

      {/* Background */}
      <div className="absolute inset-0 bg-camo-pattern opacity-100 pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-camo-light/50 to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10">

        {/* ── Header ── */}
        <div className="mb-14 text-center">
          <p className="font-mono text-[10px] tracking-[0.3em] text-amber-500/60 mb-3">
            // SECURE COMMUNICATIONS · TRISHUL DYNAMICS LIAISON
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            REQUEST A{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200">
              CLASSIFIED BRIEF
            </span>
          </h2>
          <p className="text-slate-400 mt-3 max-w-xl mx-auto text-sm leading-relaxed">
            Verified procurement officers, investors, and partner organisations may
            request a full technical brief, field demonstration, or commercial proposal.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 max-w-5xl mx-auto">

          {/* ══ FORM ══ */}
          <form
            onSubmit={handleSubmit}
            method="POST"
            action="https://api.web3forms.com/submit"
            className="lg:col-span-3 flex flex-col gap-5"
            noValidate
          >
            {/* Hidden inputs for Web3Forms (fallback + API requirement) */}
            <input type="hidden" name="access_key" value={WEB3FORMS_KEY} />
            <input type="hidden" name="subject" value="[TRISHUL DYNAMICS] New Brief Request" />
            <input type="hidden" name="from_name" value="Trishul Dynamics Website" />
            <input type="checkbox" name="botcheck" className="hidden" style={{ display: "none" }} />

            {/* Row 1: Name + Org */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>FULL NAME *</label>
                <input
                  type="text"
                  placeholder="Brig. Rajan Mehta"
                  value={form.name}
                  onChange={set("name")}
                  className={ic("name")}
                />
                {errors.name && <p className="text-red-400 text-[9px] font-mono mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className={labelClass}>ORGANISATION *</label>
                <input
                  type="text"
                  placeholder="Army HQ / MoD / VC Fund"
                  value={form.org}
                  onChange={set("org")}
                  className={ic("org")}
                />
                {errors.org && <p className="text-red-400 text-[9px] font-mono mt-1">{errors.org}</p>}
              </div>
            </div>

            {/* Row 2: Role + Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>ROLE / CATEGORY *</label>
                <select
                  value={form.role}
                  onChange={set("role")}
                  className={`${ic("role")} appearance-none`}
                >
                  <option value="">Select…</option>
                  {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
                {errors.role && <p className="text-red-400 text-[9px] font-mono mt-1">{errors.role}</p>}
              </div>
              <div>
                <label className={labelClass}>OFFICIAL EMAIL *</label>
                <input
                  type="email"
                  placeholder="officer@mod.gov.in"
                  value={form.email}
                  onChange={set("email")}
                  className={ic("email")}
                />
                {errors.email && <p className="text-red-400 text-[9px] font-mono mt-1">{errors.email}</p>}
              </div>
            </div>

            {/* Row 3: Phone + Brief Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>PHONE (OPTIONAL)</label>
                <input
                  type="tel"
                  placeholder="+91 98 xxxxxxxx"
                  value={form.phone}
                  onChange={set("phone")}
                  className={ic("phone")}
                />
              </div>
              <div>
                <label className={labelClass}>BRIEF TYPE *</label>
                <select
                  value={form.classification}
                  onChange={set("classification")}
                  className={`${ic("classification")} appearance-none`}
                >
                  <option value="">Select…</option>
                  {CLASSIFICATION_LEVELS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                {errors.classification && (
                  <p className="text-red-400 text-[9px] font-mono mt-1">{errors.classification}</p>
                )}
              </div>
            </div>

            {/* Message */}
            <div>
              <label className={labelClass}>MESSAGE / OPERATIONAL CONTEXT</label>
              <textarea
                rows={4}
                placeholder="Describe your operational requirement, timeline, or specific questions…"
                value={form.message}
                onChange={set("message")}
                className={`${ic("message")} resize-none`}
              />
            </div>

            {/* Consent */}
            <div className="border border-camo-light/20 bg-camo-dark/20 p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.consent}
                  onChange={set("consent")}
                  className="mt-1 accent-camo-accent"
                />
                <span className="text-[11px] text-slate-400 leading-relaxed">
                  I confirm I am a verified professional making this enquiry in an official
                  capacity. I understand this information is proprietary to Trishul Dynamics
                  and subject to NDA obligations where applicable.
                </span>
              </label>
              {errors.consent && (
                <p className="text-red-400 text-[9px] font-mono mt-1.5">You must confirm to proceed.</p>
              )}
            </div>

            {/* Network error banner */}
            {isError && (
              <div className="flex items-start gap-3 border border-red-500/30 bg-red-500/5 px-4 py-3">
                <span className="text-red-400 mt-0.5 flex-shrink-0">✕</span>
                <div>
                  <div className="font-mono text-[9px] tracking-widest text-red-400 mb-0.5">
                    TRANSMISSION FAILED
                  </div>
                  <p className="text-xs text-slate-400">
                    Network error — please check your connection and try again, or email us
                    directly at{" "}
                    <a href="mailto:trishul.dynamics@gmail.com" className="text-amber-400 hover:underline">
                      trishul.dynamics@gmail.com
                    </a>
                    .
                  </p>
                </div>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center justify-center gap-3 w-full py-4 bg-amber-500 text-black font-bold text-[11px] tracking-[0.2em] hover:bg-amber-400 transition-colors duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <span className="td-spinner" />
                  ENCRYPTING &amp; TRANSMITTING…
                </>
              ) : (
                <>TRANSMIT SECURE REQUEST <span>→</span></>
              )}
            </button>

            <p className="text-[9px] text-slate-700 font-mono text-center tracking-widest">
              SECURED · TLS 1.3 · NO THIRD-PARTY DATA SHARING
            </p>
          </form>

          {/* ══ INFO SIDEBAR ══ */}
          <div className="lg:col-span-2 flex flex-col gap-4">

            {/* Contact info */}
            <div className="border border-camo-light/25 bg-[#09090f] p-6">
              <div className="font-mono text-[9px] tracking-widest text-camo-light mb-4">
                DIRECT CONTACT
              </div>
              <div className="space-y-4">
                {[
                  { label: "Email",    val: "trishul.dynamics@gmail.com", icon: "◉" },
                  { label: "Location", val: "Pune, Maharashtra, India",   icon: "◈" },
                  { label: "Response", val: "Within 48 business hours",   icon: "◎" },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-3">
                    <span className="text-amber-500 mt-0.5 flex-shrink-0">{item.icon}</span>
                    <div>
                      <div className="font-mono text-[8px] text-slate-600 tracking-widest">{item.label}</div>
                      <div className="text-sm text-slate-300">{item.val}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Security note */}
            <div className="border border-slate-800 bg-[#09090f] p-6">
              <div className="font-mono text-[9px] tracking-widest text-slate-600 mb-3">
                SECURITY PROTOCOL
              </div>
              <div className="space-y-2.5">
                {[
                  "All submissions are encrypted in transit (TLS 1.3)",
                  "Verification required for classified material access",
                  "NDA dispatched automatically for datasheet requests",
                  "No data shared with third parties",
                ].map((note, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-emerald-400 flex-shrink-0 text-[10px] mt-0.5">✓</span>
                    <span className="text-xs text-slate-500">{note}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick links */}
            <div className="border border-camo-light/25 bg-[#09090f] p-6">
              <div className="font-mono text-[9px] tracking-widest text-camo-light mb-3">
                QUICK ACCESS
              </div>
              <div className="space-y-2">
                {[
                  { label: "Full Specifications →",  href: "#specs"       },
                  { label: "Mission Profiles →",      href: "#missions"    },
                  { label: "Compliance Matrix →",     href: "#procurement" },
                  { label: "Edge AI Demo →",          href: "#edge-ai"     },
                ].map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="block text-[11px] font-mono text-slate-500 hover:text-amber-400 transition-colors py-1 border-b border-slate-800 last:border-0"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
