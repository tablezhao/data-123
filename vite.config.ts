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
  // 配置优化选项，提高构建和加载性能
  optimizeDeps: {
    include: [],
    exclude: [],
    esbuildOptions: {
      // 优化依赖构建
      target: 'es2020',
    },
  },
  // 配置构建选项，优化生产构建
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    minify: 'esbuild',
    sourcemap: false,
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks: {
          // 合理分割代码，提高初始加载速度
          react: ['react', 'react-dom', 'react-router-dom'],
        },
        // 优化静态资源路径
        assetFileNames: 'assets/[name].[hash:8].[ext]',
        chunkFileNames: 'assets/[name].[hash:8].js',
        entryFileNames: 'assets/[name].[hash:8].js',
      },
    },
  },
  // 配置服务器选项
  server: {
    // 开发环境不设置复杂的缓存头，避免浏览器缓存问题
    headers: {
      'Cache-Control': 'no-cache',
    },
  },
});
