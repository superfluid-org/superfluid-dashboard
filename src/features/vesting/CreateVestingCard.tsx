import { Card } from "@mui/material";
import { skipToken } from "@reduxjs/toolkit/dist/query";
import { Token } from "@superfluid-finance/sdk-core";
import { FC, PropsWithChildren, useState } from "react";
import { useFormContext } from "react-hook-form";
import { useExpectedNetwork } from "../network/ExpectedNetworkContext";
import { getSuperTokenType } from "../redux/endpoints/adHocSubgraphEndpoints";
import { SuperTokenMinimal } from "../redux/endpoints/tokenTypes";
import { subgraphApi } from "../redux/store";
import { PartialVestingForm } from "./CreateVestingFormProvider";
import { CreateVestingPreview } from "./CreateVestingPreview";
import { CreateVestingForm } from "./CreateVestingForm";

export type VestingToken = Token & SuperTokenMinimal;

export enum CreateVestingCardView {
  Form,
  Preview,
}

export const CreateVestingCard: FC<PropsWithChildren> = () => {
  const { watch } = useFormContext<PartialVestingForm>();
  const [superTokenAddress] = watch(["data.superTokenAddress"]);

  const { network } = useExpectedNetwork();
  const { token } = subgraphApi.useTokenQuery(
    superTokenAddress
      ? {
          chainId: network.id,
          id: superTokenAddress,
        }
      : skipToken,
    {
      selectFromResult: (result) => ({
        token: result.currentData
          ? ({
              ...result.currentData,
              address: result.currentData.id,
              type: getSuperTokenType({
                network,
                address: result.currentData.id,
                underlyingAddress: result.currentData.underlyingAddress,
              }),
            } as VestingToken)
          : undefined,
      }),
    }
  );

  const [view, setView] = useState<CreateVestingCardView>(
    CreateVestingCardView.Form
  );

  return (
    <Card>
      {view === CreateVestingCardView.Form && (
        <CreateVestingForm token={token} setView={setView} />
      )}
      {view === CreateVestingCardView.Preview && (
        <CreateVestingPreview token={token} setView={setView} />
      )}
    </Card>
  );
};

export enum VestingLabels {
  Receiver = "Receiver",
  CliffPeriod = "Cliff Period",
  CliffAmount = "Cliff Amount",
  VestingStartDate = "Vesting Start Date",
  Token = "Token",
  TotalVestingPeriod = "Total Vesting Period",
  TotalVestedAmount = "Total Vested Amount",
}
