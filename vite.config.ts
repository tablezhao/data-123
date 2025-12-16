import { defineConfig } from "vite";
import { miaodaDevPlugin } from "miaoda-sc-plugin";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    miaodaDevPlugin({
      appId: process.env.VITE_APP_ID || 'app-85w8y6vjhh4x',
    }),
    svgr({
      svgrOptions: {
        icon: true,
        exportType: "named",
        namedExport: "ReactComponent",
      },
    }),
    // 自定义插件，去除 Vite 内置的加载动画
    {
      name: 'remove-vite-loading',
      transformIndexHtml(html) {
        return {
          html,
          tags: [
            {
              tag: 'style',
              injectTo: 'head',
              children: `
                /* 隐藏 Vite 内置的加载动画 */
                #vite-loading {
                  display: none !important;
                }
                /* 隐藏 Vite 开发服务器的错误覆盖层 */
                .vite-error-overlay {
                  display: none !important;
                }
              `
            }
          ]
        };
      }
    }
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // 配置优化选项，减少不必要的预加载
  optimizeDeps: {
    include: [],
  },
  // 配置构建选项
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
});
