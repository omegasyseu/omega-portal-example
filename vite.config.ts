import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { runtimeEnv } from 'vite-plugin-runtime';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		tanstackRouter({ target: "react", autoCodeSplitting: true }),
		react(),
		runtimeEnv()
	],
	resolve: {
		alias: {
			"@": "/src",
		},
	},

	// strapi/ is its own project. Without these, its generated .strapi/ files reload the
	// portal, and its admin HTML joins the dependency scan.
	optimizeDeps: {
		entries: ["index.html"],
	},
	server: {
		watch: {
			ignored: ["**/strapi/**"],
		},
		// host: true,
		// 	port: 3000,
		// 	strictPort: true,
		// 	hmr: {
		// 		host: "0.0.0.0",
		// 		port: 3000,
		// 	},
	},
});
