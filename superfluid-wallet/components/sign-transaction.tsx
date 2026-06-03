'use client';

import { useTurnkey } from '@turnkey/react-wallet-kit';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  type Address,
  hexToBigInt,
  ProviderRpcError,
  UserRejectedRequestError,
  serializeTransaction,
} from 'viem';
import { messenger } from '@/lib/window-messenger';
import {
  estimateMaxNetworkFeeGwei,
  normalizeEip1559Transaction,
  type RpcTransactionInput,
} from '@/lib/normalize-rpc-transaction';
import {
  resolveTurnkeyOrganizationId,
  resolveTurnkeySignWith,
} from '@/lib/resolve-turnkey-sign-with';
import { SignSessionGate } from '@/components/sign-session-gate';
import { useTurnkeySigningReady } from '@/lib/use-turnkey-signing-ready';

interface SignTransactionProps {
  transaction: RpcTransactionInput;
  organizationId: string;
  fallbackChainId?: number;
}

const truncateAddress = (address: Address) => {
  return `${address.slice(0, 6)}•••${address.slice(-4)}`;
};

export function SignTransaction({
  transaction,
  organizationId,
  fallbackChainId,
}: SignTransactionProps) {
  const { httpClient, session, wallets } = useTurnkey();
  const signingReady = useTurnkeySigningReady();

  const valueInEth =
    Number(hexToBigInt(transaction.value ?? '0x0')) / 1e18;
  const maxGasFeeGwei = estimateMaxNetworkFeeGwei(transaction);

  const handleConfirm = async () => {
    if (!httpClient) {
      messenger.send('eth_signTransaction', {
        error: new ProviderRpcError(new Error('No active Turnkey session'), {
          shortMessage: 'No active Turnkey session',
          code: -32603,
        }),
      });
      return;
    }

    if (signingReady.status !== 'ready') {
      return;
    }

    try {
      const signingOrgId = resolveTurnkeyOrganizationId(
        session?.organizationId,
        organizationId
      );
      if (!signingOrgId) {
        throw new Error('No Turnkey organization available for signing');
      }

      const normalized = await normalizeEip1559Transaction(transaction, {
        fallbackChainId,
      });
      const signWith = resolveTurnkeySignWith(normalized.from, wallets);
      if (!signWith) {
        throw new Error('No Turnkey wallet account matches this transaction');
      }

      const serializedTx = serializeTransaction({
        type: 'eip1559',
        to: normalized.to,
        from: signWith,
        chainId: normalized.chainId,
        gas: normalized.gas,
        maxFeePerGas: normalized.maxFeePerGas,
        maxPriorityFeePerGas: normalized.maxPriorityFeePerGas,
        nonce: normalized.nonce,
        value: normalized.value,
        data: normalized.data,
      });

      const { signedTransaction } = await httpClient.signTransaction({
        signWith,
        unsignedTransaction: serializedTx.slice(2),
        type: 'TRANSACTION_TYPE_ETHEREUM',
        organizationId: signingOrgId,
      });

      messenger.send('eth_signTransaction', { result: `0x${signedTransaction}` });
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Transaction signing failed';
      messenger.send('eth_signTransaction', {
        error: new ProviderRpcError(
          e instanceof Error ? e : new Error(message),
          { shortMessage: message, code: -32603 }
        ),
      });
    }
  };

  const handleDeny = () => {
    messenger.send('eth_signTransaction', {
      error: new UserRejectedRequestError(new Error('User denied transaction')),
    });
  };

  const nonceDisplay =
    transaction.nonce === undefined
      ? '—'
      : typeof transaction.nonce === 'number'
        ? transaction.nonce
        : parseInt(transaction.nonce, 16);

  return (
    <SignSessionGate onCancel={handleDeny}>
    <Card className="w-full border-none shadow-xl">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <h4 className="font-semibold">Review</h4>
          <p className="text-sm text-muted-foreground">Review Transaction</p>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Signing with</span>
          <span>{truncateAddress(transaction.from)}</span>
        </div>

        {transaction.to && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Send to</span>
            <span>{truncateAddress(transaction.to)}</span>
          </div>
        )}

        <div className="flex justify-between">
          <span className="text-muted-foreground">Amount</span>
          <span className="flex flex-row items-baseline gap-1">
            <span>{valueInEth}</span>
            <span className="text-muted-foreground text-xs">ETH</span>
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-muted-foreground">Network fee (max)</span>
          <span className="flex flex-row items-baseline gap-1">
            <span>
              {maxGasFeeGwei === null ? '—' : maxGasFeeGwei.toFixed(2)}
            </span>
            <span className="text-muted-foreground text-xs">GWEI</span>
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-muted-foreground">Nonce</span>
          <span>{nonceDisplay}</span>
        </div>

        <div className="flex gap-2 pt-4">
          <Button onClick={handleDeny} variant="secondary" className="flex-1">
            Deny
          </Button>
          <Button onClick={handleConfirm} className="flex-1">
            Confirm
          </Button>
        </div>
      </CardContent>
    </Card>
    </SignSessionGate>
  );
}
