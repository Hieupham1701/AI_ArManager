import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        carolina: {
          50: "#f0f8fc",
          100: "#dceef7",
          200: "#b9ddef",
          300: "#8fc7e4",
          400: "#66b0da",
          500: "#4b9cd3",
          600: "#3a86c0",
          700: "#2f6d9c",
          800: "#265776",
          900: "#1d4258",
        },
      },
    },
  },
  plugins: [],
};

export default config;
