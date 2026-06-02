import { AuthButton } from '@/components/auth';
import { TurnkeyIcon } from '@/components/icons';
import { SignTransaction } from '@/components/sign-transaction';
import { SignMessage } from '@/components/sign-message';
import { type SupportedMethod } from '@/lib/types';

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ request?: string; organizationId?: string; chainId?: string }>;
}) {
  const { request, organizationId, chainId: chainIdParam } = await searchParams;
  const rpcRequest = request ? JSON.parse(decodeURIComponent(request)) : null;
  const fallbackChainId = chainIdParam?.startsWith('0x')
    ? Number.parseInt(chainIdParam, 16)
    : chainIdParam
      ? Number(chainIdParam)
      : undefined;

  const renderMethodComponent = (request: { method?: string; params?: unknown[] }) => {
    switch (request?.method) {
      case 'eth_requestAccounts':
        return (
          <div className="w-full max-w-5xl p-4 text-center space-y-2">
            <h2 className="mb-2 text-md">Connect Superfluid Wallet</h2>
            <AuthButton />
          </div>
        );
      case 'eth_signTransaction':
        return (
          <SignTransaction
            transaction={request.params?.[0] as Parameters<typeof SignTransaction>[0]['transaction']}
            organizationId={organizationId || ''}
            fallbackChainId={fallbackChainId}
          />
        );
      case 'eth_sign':
      case 'personal_sign':
        return (
          <SignMessage
            method={request.method as SupportedMethod}
            message={request.params?.[0] as `0x${string}`}
            signWith={request.params?.[1] as `0x${string}`}
            organizationId={organizationId || ''}
          />
        );
      default:
        return (
          <div className="w-full max-w-5xl p-4 border rounded-xl border-neutral-800 bg-zinc-800/30">
            <h2 className="mb-2 text-lg font-bold text-red-500">
              Method Not Supported
            </h2>
            <p>The requested method &quot;{request?.method}&quot; is not supported.</p>
          </div>
        );
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-2">
      <TurnkeyIcon className="w-1/3 h-auto" />
      <div className="flex flex-row items-center justify-between w-full max-w-5xl p-2">
        {rpcRequest && renderMethodComponent(rpcRequest)}
      </div>
    </main>
  );
}
