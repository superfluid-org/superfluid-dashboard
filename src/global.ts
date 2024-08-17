import { isUndefined } from "lodash";
import { GlobalGasOverrides } from "./typings/global";
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

export const popGlobalGasOverrides = (): GlobalGasOverrides => {
  const { nextGasOverrides } = window.superfluid_dashboard.advanced;

  // Explicitly pick the properties and not blindly take everything from the user-defined object.
  const { gasLimit, gasPrice, maxFeePerGas, maxPriorityFeePerGas } =
    nextGasOverrides;

  window.superfluid_dashboard.advanced.nextGasOverrides =
    createEmptyGasOverrides();

  // Copy only defined properties.
  const overrides = {
    ...(isUndefined(gasLimit) ? {} : { gasLimit }),
    ...(isUndefined(gasPrice) ? {} : { gasPrice }),
    ...(isUndefined(maxFeePerGas) ? {} : { maxFeePerGas }),
    ...(isUndefined(maxPriorityFeePerGas) ? {} : { maxPriorityFeePerGas }),
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
