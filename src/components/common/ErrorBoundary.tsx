import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // 更新状态，下次渲染时显示错误页面
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // 可以将错误信息发送到日志服务
    console.error('未捕获的错误:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // 自定义错误页面
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <Card className="max-w-md w-full">
            <CardHeader className="bg-destructive/10 border-b">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-8 h-8 text-destructive" />
                <CardTitle className="text-xl">应用出错了</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-muted-foreground mb-4">
                抱歉，应用遇到了一个未捕获的错误。请尝试刷新页面或联系管理员。
              </p>
              {this.state.error && (
                <div className="mb-4 p-3 bg-muted rounded-md text-sm">
                  <p className="font-semibold mb-1">错误信息:</p>
                  <p>{this.state.error.message}</p>
                </div>
              )}
              {this.state.errorInfo && (
                <div className="mb-6 p-3 bg-muted rounded-md text-xs overflow-auto max-h-40">
                  <p className="font-semibold mb-1">错误栈:</p>
                  <pre>{this.state.errorInfo.componentStack}</pre>
                </div>
              )}
              <div className="flex gap-2">
                <Button onClick={this.handleReset} variant="default">
                  重试
                </Button>
                <Button onClick={() => window.location.reload()} variant="secondary">
                  刷新页面
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
