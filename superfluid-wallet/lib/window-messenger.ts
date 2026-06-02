import { ProviderRpcError, ProviderRpcErrorCode } from 'viem';
import {
  MessengerConfig,
  SupportedMethod,
  MethodResult,
  Message,
} from './types';

const DAPP_ORIGIN =
  process.env.NEXT_PUBLIC_DAPP_ORIGIN?.trim() || 'http://localhost:3000';

/**
 * Creates a messenger instance for cross-window communication, typically used in popup windows
 * to communicate with their parent/opener window.
 */
const createMessenger = (config: MessengerConfig = {}) => {
  const targetOrigin = config.targetOrigin || DAPP_ORIGIN;

  const sendMessage = <M extends SupportedMethod>(
    method: M,
    result?: MethodResult[M],
    error?: ProviderRpcError
  ) => {
    const message: Message<M> = {
      method,
      ...(error
        ? {
            error: {
              code: error.code as ProviderRpcErrorCode,
              message: error.message,
              data: error.data,
            },
          }
        : {
            result,
          }),
    };

    if (window.opener) {
      window.opener.postMessage(message, targetOrigin);
    }
  };

  const closePopup = () => window.close();

  const send = <M extends SupportedMethod>(
    method: M,
    {
      result,
      error,
    }: {
      result?: MethodResult[M];
      error?: ProviderRpcError;
    }
  ) => {
    sendMessage(method, result, error);
    closePopup();
  };

  return {
    sendMessage,
    closePopup,
    send,
  };
};

export const messenger = createMessenger();
