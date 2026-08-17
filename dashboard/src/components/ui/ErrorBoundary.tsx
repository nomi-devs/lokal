import { Component } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import type { ReactNode, ErrorInfo } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info.componentStack);
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    if (this.props.fallback) {
      return this.props.fallback;
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="max-w-md w-full bg-card border rounded-xl p-8 flex flex-col items-center gap-5 text-center shadow-sm">
          <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="w-7 h-7 text-destructive" />
          </div>

          <div className="flex flex-col gap-1.5">
            <h1 className="text-xl font-bold">Something went wrong</h1>
            <p className="text-sm text-muted-foreground">
              An unexpected error occurred. You can try refreshing the page or go back to the
              dashboard.
            </p>
          </div>

          {import.meta.env.DEV && this.state.error && (
            <pre className="w-full text-left text-xs bg-muted rounded-lg p-3 overflow-auto max-h-36 text-destructive">
              {this.state.error.message}
            </pre>
          )}

          <div className="flex gap-3 w-full">
            <button
              onClick={this.reset}
              className="flex-1 flex items-center justify-center gap-2 h-9 rounded-md border bg-background text-sm font-medium hover:bg-muted transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Try again
            </button>
            <a
              href="/overview"
              className="flex-1 flex items-center justify-center gap-2 h-9 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <Home className="w-4 h-4" />
              Dashboard
            </a>
          </div>
        </div>
      </div>
    );
  }
}
