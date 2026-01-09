import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import flowbiteReact from "flowbite-react/plugin/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), flowbiteReact()],
  server: {
    proxy: {
      "/omdb": {
        target: "https://www.omdbapi.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/omdb/, ""),
      },
    },
  },
})
