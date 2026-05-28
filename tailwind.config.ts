import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#050816",
        night: "#0B1224",
        steel: "#667085",
        mist: "#F3F6FA",
        line: "#E5EAF1",
        cyan: "#35D0FF",
        mint: "#31D6A0"
      },
      boxShadow: {
        premium: "0 24px 70px rgba(5, 8, 22, 0.18)"
      }
    }
  },
  plugins: []
};

export default config;
