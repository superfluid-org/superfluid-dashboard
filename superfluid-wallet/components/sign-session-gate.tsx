'use client';

import { AuthButton } from '@/components/auth';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTurnkeySigningReady } from '@/lib/use-turnkey-signing-ready';
import { Loader2 } from 'lucide-react';

interface SignSessionGateProps {
  onCancel: () => void;
  children: React.ReactNode;
}

export function SignSessionGate({
  onCancel,
  children,
}: SignSessionGateProps) {
  const { status, error } = useTurnkeySigningReady();

  if (status === 'loading') {
    return (
      <Card className="w-full border-none shadow-xl">
        <CardContent className="flex flex-col items-center gap-3 py-10">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Restoring wallet session…</p>
        </CardContent>
      </Card>
    );
  }

  if (status === 'needs_auth') {
    return (
      <Card className="w-full border-none shadow-xl">
        <CardHeader className="space-y-1">
          <h4 className="font-semibold">Sign in to continue</h4>
          <p className="text-sm text-muted-foreground">
            Your wallet session expired. Sign in to approve this request — you
            do not need to disconnect on the dashboard.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <AuthButton variant="unlock" />
          <Button onClick={onCancel} variant="secondary" className="w-full">
            Cancel
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (status === 'error') {
    return (
      <Card className="w-full border-none shadow-xl">
        <CardHeader className="space-y-1">
          <h4 className="font-semibold text-red-500">Wallet unavailable</h4>
          <p className="text-sm text-muted-foreground">{error}</p>
        </CardHeader>
        <CardContent>
          <Button onClick={onCancel} variant="secondary" className="w-full">
            Cancel
          </Button>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
}
