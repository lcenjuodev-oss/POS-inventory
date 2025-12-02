import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1A73E8",
        "kpi-blue": "#E8F0FE",
        "kpi-green": "#E8F8EF",
        "kpi-yellow": "#FFF8E1",
        "kpi-purple": "#F3E8FF",
        pastel: {
          yellow: "#FFE9A9",
          purple: "#E1D5FF",
          blue: "#CDEBFF",
          green: "#CFF8D4",
          pink: "#FFD6E8"
        },
        background: "#F4F5FB",
        card: "#FFFFFF"
      },
      boxShadow: {
        soft: "0 18px 45px rgba(15, 23, 42, 0.08)"
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem"
      }
    }
  },
  plugins: []
};

export default config;


