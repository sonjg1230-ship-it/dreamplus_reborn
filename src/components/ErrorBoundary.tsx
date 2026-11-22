import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  onReset?: () => void;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    let message = '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.';
    if (error instanceof Error) {
      try {
        const parsed = JSON.parse(error.message) as { error?: string; operationType?: string };
        if (parsed.error && parsed.error.toLowerCase().includes('permission')) {
          message = '접근 권한이 없거나 관리자 인증이 필요합니다.';
        } else if (parsed.error) {
          message = parsed.error;
        }
      } catch {
        message = error.message || message;
      }
    }
    return { hasError: true, message };
  }

  componentDidCatch(error: unknown): void {
    console.error('Application ErrorBoundary caught error:', error);
  }

  handleRecover = (): void => {
    this.setState({ hasError: false, message: '' });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-[260px] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-2xl border border-red-200 shadow-lg p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-[#131b2e]">요청을 처리할 수 없습니다</h3>
              <p className="text-xs text-slate-600 leading-relaxed break-words">
                {this.state.message}
              </p>
            </div>
            <button
              type="button"
              onClick={this.handleRecover}
              className="inline-flex items-center justify-center gap-1.5 bg-[#00288e] hover:bg-[#1e40af] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>다시 시도하기</span>
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
