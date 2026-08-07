import { isUndefined } from "lodash";
import { GlobalGasOverrides } from "./typings/global";
import { ViemFeeOverrides } from "./features/transactions/viemFeeOverrides";
import { SSR } from "./utils/SSRUtils";
import { AppDispatch } from "./features/redux/store";
import { addCustomToken, NetworkCustomToken } from "./features/customTokens/customTokens.slice";

export const initializeSuperfluidDashboardGlobalObject = ({
  appDispatch
}: { appDispatch: AppDispatch }) => {
  if (!SSR && !window.superfluid_dashboard) {
    window.superfluid_dashboard = {
      advanced: {
        nextGasOverrides: createEmptyGasOverrides(),
        addCustomToken: async (token: NetworkCustomToken) => {
          await appDispatch(addCustomToken(token));
        },
      }, 
    };
  }
};

export const popGlobalGasOverrides = (): ViemFeeOverrides => {
  const { nextGasOverrides } = window.superfluid_dashboard.advanced;

  // Explicitly pick the properties and not blindly take everything from the user-defined object.
  const { gasLimit, gasPrice, maxFeePerGas, maxPriorityFeePerGas } =
    nextGasOverrides;

  window.superfluid_dashboard.advanced.nextGasOverrides =
    createEmptyGasOverrides();

  // Copy only defined properties, coerced to viem-style bigints (ethers' `gasLimit` becomes `gas`).
  const overrides: ViemFeeOverrides = {
    ...(isUndefined(gasLimit) ? {} : { gas: BigInt(gasLimit) }),
    ...(isUndefined(gasPrice) ? {} : { gasPrice: BigInt(gasPrice) }),
    ...(isUndefined(maxFeePerGas) ? {} : { maxFeePerGas: BigInt(maxFeePerGas) }),
    ...(isUndefined(maxPriorityFeePerGas)
      ? {}
      : { maxPriorityFeePerGas: BigInt(maxPriorityFeePerGas) }),
  };

  return overrides;
};

const createEmptyGasOverrides = (): GlobalGasOverrides => {
  // Have all the properties visible for discoverability
  return {
    gasLimit: undefined,
    gasPrice: undefined,
    maxFeePerGas: undefined,
    maxPriorityFeePerGas: undefined,
  };
};
