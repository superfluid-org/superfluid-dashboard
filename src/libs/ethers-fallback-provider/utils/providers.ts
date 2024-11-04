import { BaseProvider } from "@ethersproject/providers";

import { wait } from "./promises";

export abstract class ProviderModifiers {
  static failing<T extends BaseProvider>(provider: T, probability = 1) {
    provider.perform = async (method: string, params: any): Promise<any> => {
      if (Math.random() <= probability)
        throw new Error(`Failing provider used for method \`${method}\``);
      return provider.perform(method, params);
    };
    return provider;
  }

  static delayed<T extends BaseProvider>(provider: T, timeout: number) {
    provider.perform = async (method: string, params: any): Promise<any> => {
      await wait(timeout);
      return provider.perform(method, params);
    };
    return provider;
  }
}
