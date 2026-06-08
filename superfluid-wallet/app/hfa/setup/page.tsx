import { Suspense } from 'react';
import { HfaSetupErrorBoundary } from '@/components/hfa-setup-error-boundary';
import HfaSetupPage from './setup-page';

export default function Page() {
  return (
    <HfaSetupErrorBoundary>
      <Suspense
        fallback={
          <main className="flex min-h-screen items-center justify-center p-4 text-sm text-muted-foreground">
            Loading setup…
          </main>
        }
      >
        <HfaSetupPage />
      </Suspense>
    </HfaSetupErrorBoundary>
  );
}
