import { defineConfig } from "vite";
import react from "@vitejs/plugin-react"; // Correct React plugin for Vite
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "tailwindcss"; // Tailwind is configured via postcss.config.js

export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
  ],
});
