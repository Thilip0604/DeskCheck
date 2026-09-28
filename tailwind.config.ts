import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#6366f1",
        onsite: "#10b981",
        remote: "#539e0b",
        leave: "#f43f5e"
      },
      boxShadow: {
        glow: "0 0 0 1px rgb(99 102 241 / 0.25), 0 20px 80px rgb(99 102 241 / 0.16)"
      }
    }
  },
  plugins: []
};

export default config;
