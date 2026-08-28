import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { build, defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname);
const outDir = resolve(root, "dist/chrome");

function apiBaseUrlDefine(env: Record<string, string>, mode: string) {
  const url =
    env.VITE_API_BASE_URL ??
    (mode === "production"
      ? "https://vaultsync.manojhankare.in"
      : "http://localhost:5000");
  return {
    "import.meta.env.VITE_API_BASE_URL": JSON.stringify(url),
  };
}

function buildIifeScripts(
  entries: { name: string; entry: string }[],
  define: Record<string, string>
): Plugin {
  return {
    name: "build-iife-scripts",
    async closeBundle() {
      for (const { name, entry } of entries) {
        await build({
          configFile: false,
          define,
          build: {
            write: true,
            outDir,
            emptyOutDir: false,
            minify: process.env.NODE_ENV === "production",
            sourcemap: process.env.NODE_ENV !== "production",
            rollupOptions: {
              input: resolve(root, entry),
              output: {
                entryFileNames: `${name}.js`,
                format: "iife",
                inlineDynamicImports: true,
              },
            },
          },
        });
      }
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, root, "");
  const define = apiBaseUrlDefine(env, mode);

  return {
  root,
  plugins: [
    react(),
    buildIifeScripts(
      [
        { name: "background", entry: "src/background/service-worker.ts" },
        { name: "content-script", entry: "src/content/content-script.ts" },
      ],
      define
    ),
  ],
  define,
  build: {
    outDir,
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: resolve(root, "popup.html"),
        picker: resolve(root, "picker.html"),
        "save-prompt": resolve(root, "save-prompt.html"),
        offscreen: resolve(root, "offscreen.html"),
      },
      output: {
        entryFileNames: "assets/[name].js",
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash][extname]",
      },
    },
  },
};
});
