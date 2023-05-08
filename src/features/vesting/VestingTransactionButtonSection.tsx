import { useFormContext } from "react-hook-form";
import { rpcApi } from "../redux/store";
import { useVisibleAddress } from "../wallet/VisibleAddressContext";
import AutoWrapAllowanceTransactionButton from "./AutoWrapAllowanceTransactionButton";
import AutoWrapStrategyTransactionButton from "./AutoWrapStrategyTransactionButton";
import { CreateVestingTransactionButton } from "./CreateVestingTransactionButton";
import { ValidVestingForm } from "./CreateVestingFormProvider";
import { CreateVestingCardView, VestingToken } from "./CreateVestingSection";
import { Network } from "../network/networks";
import { skipToken } from "@reduxjs/toolkit/dist/query";

export interface VestingTransactionSectionProps {
  network: Network;
  token: VestingToken;
  setView: (value: CreateVestingCardView) => void;
}

export function VestingTransactionButtonSection({
  token,
  network,
  setView
}: VestingTransactionSectionProps) {
  const { watch } = useFormContext<ValidVestingForm>();

  const [setupAutoWrap] = watch(["data.setupAutoWrap"]);

  const { visibleAddress } = useVisibleAddress();

  const {
    data: isAutoWrapAllowanceConfigured,
    isLoading: isAutoWrapAllowanceLoading,
  } = rpcApi.useIsAutoWrapAllowanceConfiguredQuery(
    setupAutoWrap && visibleAddress
      ? {
          chainId: network.id,
          accountAddress: visibleAddress,
          superTokenAddress: token.address,
          underlyingTokenAddress: token.underlyingAddress,
        }
      : skipToken
  );

  const isAutoWrapAllowanceOK = Boolean(
    !setupAutoWrap ||
      (!isAutoWrapAllowanceLoading && isAutoWrapAllowanceConfigured)
  );

  const {
    data: isAutoWrapStrategyConfigured,
    isLoading: isAutoWrapStrategyConfiguredLoading,
  } = rpcApi.useIsAutoWrapStrategyConfiguredQuery(
    setupAutoWrap && visibleAddress
      ? {
          chainId: network.id,
          accountAddress: visibleAddress,
          superTokenAddress: token.address,
          underlyingTokenAddress: token.underlyingAddress,
        }
      : skipToken
  );

  const isAutoWrapStrategyOK = Boolean(
    !setupAutoWrap ||
      (!isAutoWrapStrategyConfiguredLoading && isAutoWrapStrategyConfigured)
  );

  return (
    <>
      {setupAutoWrap && (
        <>
          <AutoWrapAllowanceTransactionButton
            token={token}
            isVisible={!isAutoWrapAllowanceOK}
          />
          <AutoWrapStrategyTransactionButton
            token={token}
            isVisible={isAutoWrapAllowanceOK && !isAutoWrapStrategyOK}
          />
        </>
      )}
      {isAutoWrapAllowanceOK && isAutoWrapStrategyOK && (
        <CreateVestingTransactionButton setView={setView} />
      )}
    </>
  );
}
