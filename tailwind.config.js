/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Tactical palette
        void:    "#06060e",
        deep:    "#0a0a14",
        surface: "#0e0e1a",
        panel:   "#12121f",
        ridge:   "#1a1a2e",
        amber: {
          DEFAULT: "#f59e0b",
          dim:     "#92600a",
          glow:    "rgba(245,158,11,0.15)",
        },
        teal: {
          DEFAULT: "#2dd4bf",
        },
        emerald: {
          live: "#10b981",
        },
      },
      fontFamily: {
        mono:    ["'JetBrains Mono'", "Consolas", "monospace"],
        display: ["'Inter'", "system-ui", "sans-serif"],
      },
      animation: {
        "scan":       "scan 3s linear infinite",
        "pulse-slow": "pulse 3s ease-in-out infinite",
        "blink":      "blink 1.2s step-end infinite",
        "sweep":      "sweep 4s linear infinite",
        "float":      "float 6s ease-in-out infinite",
      },
      keyframes: {
        scan: {
          "0%":   { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100vh)" },
        },
        blink: {
          "0%, 100%": { opacity: 1 },
          "50%":      { opacity: 0 },
        },
        sweep: {
          "0%":   { backgroundPosition: "200% center" },
          "100%": { backgroundPosition: "-200% center" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":      { transform: "translateY(-12px)" },
        },
      },
      backgroundImage: {
        "grid-tactical":
          "linear-gradient(rgba(245,158,11,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(245,158,11,0.05) 1px, transparent 1px)",
        "grid-fine":
          "linear-gradient(rgba(245,158,11,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(245,158,11,0.03) 1px, transparent 1px)",
      },
      backgroundSize: {
        "grid-60": "60px 60px",
        "grid-20": "20px 20px",
      },
      boxShadow: {
        "amber-glow":  "0 0 20px rgba(245,158,11,0.25), 0 0 60px rgba(245,158,11,0.08)",
        "amber-inner": "inset 0 0 30px rgba(245,158,11,0.05)",
        "teal-glow":   "0 0 20px rgba(45,212,191,0.2)",
      },
    },
  },
  plugins: [],
};
