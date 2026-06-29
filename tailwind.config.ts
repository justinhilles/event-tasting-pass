import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1f1f1f",
        paper: "#fbfaf7",
        ember: "#b83b2d",
        leaf: "#3f6f50",
        corn: "#f0b84d"
      }
    }
  },
  plugins: []
};

export default config;

