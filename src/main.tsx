import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { AppWrapper } from "./components/common/PageMeta.tsx";
import { Analytics } from "@vercel/analytics/react";

// 直接渲染应用，初始化逻辑移到 App 组件内部
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppWrapper>
      <App />
      <Analytics />
    </AppWrapper>
  </StrictMode>
);
