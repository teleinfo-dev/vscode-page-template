import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import { createStyleImportPlugin } from "vite-plugin-style-import";

const path = require("path");

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: path.resolve(__dirname, "../dist-web"),
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name].js`,
        chunkFileNames: `assets/[name].js`,
        assetFileNames: `assets/[name].[ext]`,
      },
    },
  },
  plugins: [
    vue(),
    vueJsx(),
    createStyleImportPlugin({
      libs: [
        {
          libraryName: "@arco-design/web-vue",
          esModule: true,
          resolveStyle: (name) => {
            // css
            return `@arco-design/web-vue/es/${name}/style/css.js`;
          },
        },
      ],
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
