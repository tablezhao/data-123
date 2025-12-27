import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Bot, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FloatingAIProps {
  /**
   * Dify Chatbot URL
   * 请在 Dify 后台 -> "嵌入网站" -> "iframe 嵌入" 中获取此 URL
   */
  chatUrl?: string;
}

export const FloatingAI: React.FC<FloatingAIProps> = ({ 
  // 使用用户提供的 URL
  chatUrl = "https://udify.app/chatbot/nqOzNPC7ONM2yD8g" 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

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
        <div className="w-[380px] h-[600px] max-w-[calc(100vw-48px)] max-h-[calc(100vh-120px)] rounded-2xl overflow-hidden shadow-2xl border border-border/50 bg-background/95 backdrop-blur-xl flex flex-col relative">
          {/* 关闭按钮 - 悬浮在右上角 */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-2 right-2 z-10 h-8 w-8 bg-background/50 hover:bg-destructive/10 hover:text-destructive rounded-full backdrop-blur-sm shadow-sm transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <X className="w-4 h-4" />
          </Button>
          
          {/* iframe 容器 */}
          <div className="flex-1 bg-background relative">
             <iframe
               src={chatUrl}
               className="w-full h-full border-0"
               allow="microphone" // 允许语音输入
               title="Dify Chatbot"
             />
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
