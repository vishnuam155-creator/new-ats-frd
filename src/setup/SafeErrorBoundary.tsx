import { Component, ErrorInfo, ReactNode } from "react";

interface SafeErrorBoundaryProps {
  children: ReactNode;
}

interface SafeErrorBoundaryState {
  hasError: boolean;
}

export class SafeErrorBoundary extends Component<SafeErrorBoundaryProps, SafeErrorBoundaryState> {
  state: SafeErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): SafeErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error("SafeErrorBoundary caught", error, info);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background text-center p-6">
          <div>
            <h1 className="text-2xl font-semibold mb-2">Something went wrong.</h1>
            <p className="text-muted-foreground">Please refresh the page or try again shortly.</p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}