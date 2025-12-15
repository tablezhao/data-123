import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { AppWrapper } from "./components/common/PageMeta.tsx";
import { initializeAuth } from "./stores/authStore";

// 初始化应用
const initApp = async () => {
  await initializeAuth();
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppWrapper>
      <App />
    </AppWrapper>
  </StrictMode>
);

// 初始化认证状态
initApp().catch((error) => {
  console.error("初始化认证状态失败:", error);
});
