import { defineConfig } from "vitest/config";
import tailwindcss from '@tailwindcss/vite'
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => ({
  base: mode === "production" ? "/squat-tracker/" : "/",
  plugins: [react(), tailwindcss(),],
  test: {
    environment: "jsdom",
    globals: true,
  },
}));
