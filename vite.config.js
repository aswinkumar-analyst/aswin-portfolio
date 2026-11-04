import process from "node:process";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { visualizer } from "rollup-plugin-visualizer";

// Link previews need absolute URLs. Vercel and Netlify supply the production
// address at build time; set SITE_URL to override it. Empty means root-relative.
const { SITE_URL, VERCEL_PROJECT_PRODUCTION_URL: vercelHost, URL: netlifyUrl } = process.env;
const siteUrl = SITE_URL ?? (vercelHost ? `https://${vercelHost}` : netlifyUrl) ?? "";

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    tailwindcss(),
    react(),
    {
      name: "site-url",
      transformIndexHtml: (html) => html.replaceAll("%SITE_URL%", siteUrl),
    },
    // npm run analyze writes the bundle treemap to dist/stats.html
    mode === "analyze" && visualizer({ filename: "dist/stats.html", gzipSize: true }),
  ],
  build: {
    rolldownOptions: {
      output: {
        // Libraries change far less often than the app, so they get their own
        // long-lived cached chunk across deploys.
        codeSplitting: {
          groups: [{ name: "vendor", test: /node_modules[\\/](react|react-dom|scheduler|gsap|@gsap|lenis)[\\/]/ }],
        },
      },
    },
  },
}));
