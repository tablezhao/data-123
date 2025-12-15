import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { AppWrapper } from "./components/common/PageMeta.tsx";
import { initializeAuth } from "./stores/authStore";
import { useSettingsStore } from "./stores/settingsStore";

// 初始化应用
const initApp = async () => {
  await Promise.all([
    initializeAuth(),
    useSettingsStore.getState().loadSettings()
  ]);
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppWrapper>
      <App />
    </AppWrapper>
  </StrictMode>
);

// 初始化认证状态和网站设置
initApp().catch((error) => {
  console.error("初始化应用失败:", error);
});
