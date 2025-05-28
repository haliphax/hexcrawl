import path from "path";
import { defineConfig } from "vite";

export default defineConfig({
	build: {
		emptyOutDir: true,
		outDir: path.join(__dirname, "..", "dist"),
		target: "esnext",
	},
});
