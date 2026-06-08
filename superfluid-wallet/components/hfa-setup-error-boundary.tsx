'use client';

import { Component, type ReactNode } from 'react';

type Props = { children: ReactNode };
type State = { error: Error | null };

export class HfaSetupErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
          <div className="w-full max-w-lg space-y-3 rounded-lg border border-red-900/60 bg-zinc-900/40 p-6">
            <h1 className="text-lg font-semibold text-red-400">HFA setup failed to load</h1>
            <p className="text-sm text-muted-foreground">
              The setup page hit a client error before it could finish loading. Restart the
              wallet dev server and try again.
            </p>
            <pre className="overflow-x-auto rounded bg-black/40 p-3 text-xs text-red-300">
              {this.state.error.message}
            </pre>
            <p className="text-xs text-muted-foreground">
              If this persists: <code>rm -rf .next &amp;&amp; pnpm dev</code>
            </p>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}
