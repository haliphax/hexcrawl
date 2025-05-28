import path from "path";
import { defineConfig } from "vite";
import { createHtmlPlugin } from "vite-plugin-html";
import { viteSingleFile } from "vite-plugin-singlefile";

export default defineConfig({
	build: {
		emptyOutDir: true,
		outDir: path.resolve(__dirname, "..", "dist"),
		target: "esnext",
	},
	plugins: [
		createHtmlPlugin({ minify: true }),
		viteSingleFile({ removeViteModuleLoader: true }),
	],
});
