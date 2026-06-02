'use client';

import { useTurnkey } from '@turnkey/react-wallet-kit';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { type Hex, type Address, ProviderRpcError, UserRejectedRequestError, pad } from 'viem';
import { messenger } from '@/lib/window-messenger';
import { SupportedMethod } from '@/lib/types';

interface SignMessageProps {
  method: SupportedMethod;
  message: Hex;
  signWith: Address;
  organizationId: string;
}

const truncateAddress = (address: Address) => {
  return `${address.slice(0, 6)}•••${address.slice(-4)}`;
};

export function SignMessage({
  method,
  message,
  signWith,
  organizationId,
}: SignMessageProps) {
  const { httpClient } = useTurnkey();

  const readableMessage = new TextDecoder().decode(
    Buffer.from(message.slice(2), 'hex')
  );

  const handleConfirm = async () => {
    if (!httpClient) {
      messenger.send(method, {
        error: new ProviderRpcError(new Error('No active Turnkey session'), {
          shortMessage: 'No active Turnkey session',
          code: -32603,
        }),
      });
      return;
    }

    try {
      const { r, s, v } = await httpClient.signRawPayload({
        signWith,
        payload: pad(message),
        organizationId,
        encoding: 'PAYLOAD_ENCODING_HEXADECIMAL',
        hashFunction: 'HASH_FUNCTION_NO_OP',
      });

      messenger.send(method, { result: `0x${r}${s}${v}` });
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Message signing failed';
      messenger.send(method, {
        error: new ProviderRpcError(
          e instanceof Error ? e : new Error(message),
          { shortMessage: message, code: -32603 }
        ),
      });
    }
  };

  const handleDeny = () => {
    messenger.send(method, {
      error: new UserRejectedRequestError(new Error('User denied message signing')),
    });
  };

  return (
    <Card className="w-full border-none shadow-xl">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <h4 className="font-semibold">Review</h4>
          <p className="text-sm text-muted-foreground">Sign Message</p>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Signing with</span>
          <span>{truncateAddress(signWith)}</span>
        </div>

        <div className="space-y-2">
          <span className="text-muted-foreground">Message</span>
          <div className="rounded-lg bg-muted p-4 break-words">{readableMessage}</div>
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
  );
}
