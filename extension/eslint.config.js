import js from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";
import reactHooks from "eslint-plugin-react-hooks";

export default [
  js.configs.recommended,
  {
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsparser,
      parserOptions: { ecmaVersion: "latest", sourceType: "module" },
      globals: {
        chrome: "readonly",
        crypto: "readonly",
        indexedDB: "readonly",
        navigator: "readonly",
        document: "readonly",
        window: "readonly",
        btoa: "readonly",
        atob: "readonly",
        MutationObserver: "readonly",
        HTMLFormElement: "readonly",
        HTMLInputElement: "readonly",
        HTMLElement: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
      "react-hooks": reactHooks,
    },
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "react-hooks/rules-of-hooks": "error",
    },
  },
];
