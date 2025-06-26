import eslint from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import pluginVue from "eslint-plugin-vue";
import tslint from "typescript-eslint";

export default tslint.config(
	{
		ignores: [".commitlintrc.js", ".husky/*", "eslint.config.mjs", "dist/*"],
	},
	eslint.configs.recommended,
	...tslint.configs.recommended,
	...pluginVue.configs["flat/recommended"],
	{
		plugins: {
			"typescript-eslint": tslint.plugin,
		},
		languageOptions: {
			globals: {
				console: true,
				document: true,
				localStorage: true,
			},
			parserOptions: {
				parser: tslint.parser,
				project: "./tsconfig.json",
				sourceType: "module",
			},
		},
	},
	eslintConfigPrettier,
);
