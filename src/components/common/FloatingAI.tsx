import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Bot, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSettingsStore } from '@/stores/settingsStore';

interface FloatingAIProps {
  /**
   * Dify Chatbot URL
   * 请在 Dify 后台 -> "嵌入网站" -> "iframe 嵌入" 中获取此 URL
   */
  chatUrl?: string;
}

declare global {
  interface Window {
    CozeWebSDK?: {
      WebChatClient: new (options: any) => any;
    };
  }
}

let cozeSdkLoadPromise: Promise<void> | null = null;
const COZE_SDK_SRC =
  'https://lf-cdn.coze.cn/obj/unpkg/flow-platform/chat-app-sdk/1.2.0-beta.19/libs/cn/index.js';

function loadCozeSdk(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.CozeWebSDK?.WebChatClient) return Promise.resolve();
  if (cozeSdkLoadPromise) return cozeSdkLoadPromise;

  cozeSdkLoadPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-coze-websdk="true"]');
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Coze SDK 加载失败')));
      return;
    }

    const script = document.createElement('script');
    script.src = COZE_SDK_SRC;
    script.async = true;
    script.defer = true;
    script.dataset.cozeWebsdk = 'true';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Coze SDK 加载失败'));
    document.head.appendChild(script);
  });

  return cozeSdkLoadPromise;
}

export const FloatingAI: React.FC<FloatingAIProps> = ({ 
  // 使用用户提供的 URL，优先使用环境变量
  chatUrl = import.meta.env.VITE_DIFY_CHAT_URL || "https://udify.app/chatbot/nqOzNPC7ONM2yD8g" 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const difyChatbotEnabled = useSettingsStore((state) => state.difyChatbotEnabled);
  const chatbotProvider = useSettingsStore((state) => state.chatbotProvider);
  const cozeBotId = useSettingsStore((state) => state.cozeBotId);
  const cozeTitle = useSettingsStore((state) => state.cozeTitle);
  const cozeToken = useMemo(() => import.meta.env.VITE_COZE_TOKEN as string | undefined, []);
  const cozeContainerRef = useRef<HTMLDivElement | null>(null);
  const cozeClientRef = useRef<any>(null);
  const cozeClientConfigRef = useRef<{ botId: string; title: string; layout: 'pc' | 'mobile' } | null>(null);

  // 延迟显示 Tooltip
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (isHovered && !isOpen) {
      timer = setTimeout(() => setShowTooltip(true), 200);
    } else {
      setShowTooltip(false);
    }
    return () => clearTimeout(timer);
  }, [isHovered, isOpen]);

  useEffect(() => {
    setIsOpen(false);
  }, [chatbotProvider]);

  useEffect(() => {
    if (!difyChatbotEnabled || chatbotProvider !== 'coze') return;
    if (!cozeToken) return;

    let cancelled = false;

    const ensureCoze = async () => {
      try {
        await loadCozeSdk();
        if (cancelled) return;

        const container = cozeContainerRef.current;
        if (!container) return;

        const layout: 'pc' | 'mobile' =
          typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches
            ? 'mobile'
            : 'pc';

        const nextConfig = { botId: cozeBotId, title: cozeTitle, layout };
        const prevConfig = cozeClientConfigRef.current;
        const shouldRecreate =
          !cozeClientRef.current ||
          !prevConfig ||
          prevConfig.botId !== nextConfig.botId ||
          prevConfig.title !== nextConfig.title ||
          prevConfig.layout !== nextConfig.layout;

        if (shouldRecreate) {
          try {
            cozeClientRef.current?.destroy?.();
          } catch {
          }
          container.replaceChildren();
          cozeClientRef.current = new window.CozeWebSDK!.WebChatClient({
            config: {
              type: 'bot',
              bot_id: cozeBotId,
              isIframe: false,
            },
            componentProps: {
              title: cozeTitle,
            },
            auth: {
              type: 'token',
              token: cozeToken,
              onRefreshToken: async () => cozeToken,
            },
            ui: {
              base: {
                lang: 'zh-CN',
                layout: nextConfig.layout,
                zIndex: 1000,
              },
              asstBtn: {
                isNeed: false,
              },
              chatBot: {
                el: container,
              },
            },
          });
          cozeClientConfigRef.current = nextConfig;
        }

        if (isOpen) {
          cozeClientRef.current?.showChatBot?.();
        } else {
          cozeClientRef.current?.hideChatBot?.();
        }
      } catch {
      }
    };

    ensureCoze();

    return () => {
      cancelled = true;
    };
  }, [chatbotProvider, difyChatbotEnabled, cozeBotId, cozeTitle, cozeToken, isOpen]);

  if (!difyChatbotEnabled) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-[1000] flex flex-col items-end gap-4 pointer-events-none print:hidden">
      {/* 聊天窗口容器 */}
      <div
        className={cn(
          "origin-bottom-right transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
          isOpen 
            ? "opacity-100 scale-100 translate-y-0 pointer-events-auto" 
            : "opacity-0 scale-90 translate-y-4 pointer-events-none"
        )}
      >
        <div className="w-[calc(100vw-32px)] md:w-[500px] lg:w-[600px] h-[calc(100vh-100px)] md:h-[700px] max-h-[calc(100vh-100px)] rounded-2xl overflow-hidden shadow-2xl border border-border/50 bg-background/95 backdrop-blur-xl flex flex-col relative">
          {/* 关闭按钮 - 悬浮在右上角 */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-2 right-2 z-10 h-8 w-8 bg-background/50 hover:bg-destructive/10 hover:text-destructive rounded-full backdrop-blur-sm shadow-sm transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <X className="w-4 h-4" />
          </Button>
          
          <div className="flex-1 min-h-0 bg-background relative">
            {chatbotProvider === 'dify' ? (
              <iframe
                src={chatUrl}
                className="w-full h-full border-0"
                allow="microphone"
                title="Dify Chatbot"
              />
            ) : (
              <div className="w-full h-full min-h-0">
                {!cozeToken ? (
                  <div className="h-full w-full flex items-center justify-center text-sm text-muted-foreground">
                    缺少 VITE_COZE_TOKEN
                  </div>
                ) : (
                  <div className="h-full w-full overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch]">
                    <div ref={cozeContainerRef} className="min-h-full w-full" />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 提示语 */}
      <div 
        className={cn(
          "absolute bottom-20 right-0 mr-16 bg-foreground text-background text-sm px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap transition-all duration-200",
          showTooltip ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
        )}
      >
        有关于数据合规的问题吗？
        <div className="absolute top-1/2 -right-1 w-2 h-2 bg-foreground rotate-45 -translate-y-1/2" />
      </div>

      {/* 悬浮按钮 - 使用 pointer-events-auto 恢复交互 */}
      <Button
        size="icon"
        className={cn(
          "h-14 w-14 rounded-full shadow-lg transition-all duration-500 relative group pointer-events-auto",
          "bg-gradient-to-br from-primary to-primary/90 hover:brightness-110",
          "border border-white/20",
          isOpen ? "rotate-90" : "hover:-translate-y-1"
        )}
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* 光晕效果 */}
        <div className="absolute inset-0 rounded-full bg-primary/30 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
        
        {isOpen ? (
          <X className="h-6 w-6 text-primary-foreground" />
        ) : (
          <Bot className="h-7 w-7 text-primary-foreground" />
        )}
      </Button>
    </div>
  );
};
