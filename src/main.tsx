import { type ComponentType, StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { AppWrapper } from "./components/common/PageMeta.tsx";

function AnalyticsLoader() {
  const [enabled, setEnabled] = useState(false);
  const [AnalyticsComponent, setAnalyticsComponent] = useState<ComponentType | null>(null);

  useEffect(() => {
    if (!import.meta.env.PROD) return;

    // 使用 requestIdleCallback 在浏览器空闲时加载 Analytics
    // 如果不支持 requestIdleCallback，则降级使用 setTimeout (延迟 3s)
    const loadAnalytics = () => setEnabled(true);
    let cleanup: () => void;

    if ('requestIdleCallback' in window) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const handle = (window as any).requestIdleCallback(loadAnalytics);
      cleanup = () => (window as any).cancelIdleCallback(handle);
    } else {
      const id = window.setTimeout(loadAnalytics, 3000);
      cleanup = () => window.clearTimeout(id);
    }

    return cleanup;
  }, []);

  useEffect(() => {
    if (!enabled) return;
    let active = true;
    void import("@vercel/analytics/react").then((mod) => {
      if (!active) return;
      setAnalyticsComponent(() => mod.Analytics);
    });
    return () => {
      active = false;
    };
  }, [enabled]);

  if (!enabled || !AnalyticsComponent) return null;
  return <AnalyticsComponent />;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppWrapper>
      <App />
      {import.meta.env.PROD && <AnalyticsLoader />}
    </AppWrapper>
  </StrictMode>
);
