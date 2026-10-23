import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    preprocessorOptions: {
      scss: {
        loadPaths: [fileURLToPath(new URL(".", import.meta.url))],
        additionalData: ` 
          @import "./src/styles/_variables.scss";      
        `,
      },
    },
  },
});
