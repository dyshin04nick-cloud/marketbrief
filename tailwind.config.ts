import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0d1117",
        panel: "#131a23",
        panel2: "#0f151d",
        line: "#1e2936",
        txt: "#e6edf3",
        muted: "#8b98a9",
        dim: "#5c6873",
        up: "#26a69a",
        down: "#ef5350",
        accent: "#2962ff",
        accent2: "#4f8cff",
        chip: "#1c2634",
        hover2: "#1a2330",
      },
    },
  },
  plugins: [],
};
export default config;

