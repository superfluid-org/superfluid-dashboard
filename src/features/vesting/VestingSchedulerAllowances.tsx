import { Card } from "@mui/material";
import { skipToken } from "@reduxjs/toolkit/dist/query";
import { BigNumber } from "ethers";
import { groupBy, uniq } from "lodash";
import { FC } from "react";
import { useGetVestingSchedulesQuery } from "../../vesting-subgraph/getVestingSchedules.generated";
import { useExpectedNetwork } from "../network/ExpectedNetworkContext";
import { Network } from "../network/networks";
import {
  ACL_CREATE_PERMISSION,
  ACL_DELETE_PERMISSION,
} from "../redux/endpoints/flowSchedulerEndpoints";
import { rpcApi } from "../redux/store";
import { useVisibleAddress } from "../wallet/VisibleAddressContext";

export const VestingSchedulerAllowances: FC = () => {
  const { network } = useExpectedNetwork();
  const { visibleAddress: senderAddress } = useVisibleAddress();

  const { data: vestingSchedulerConstants } =
    rpcApi.useGetVestingSchedulerConstantsQuery({
      chainId: network.id,
    });

  const vestingSchedulesQuery = useGetVestingSchedulesQuery(
    senderAddress
      ? {
          where: { sender: senderAddress?.toLowerCase(), deletedAt: null }, // TODO(KK): Should show allowance for tokens with finished vesting?
        }
      : skipToken,
    {
      selectFromResult: (result) => ({
        ...result,
        data: uniq(result.data?.vestingSchedules ?? []),
      }),
    }
  );

  const vestingSchedulesGroupedByToken = groupBy(
    vestingSchedulesQuery.data,
    (x) => x.superToken
  );

  if (!vestingSchedulerConstants) {
    return <>Loading...</>;
  }

  const tokenSummaries = Object.entries(vestingSchedulesGroupedByToken).map(
    (entry) => {
      const [tokenAddress, group] = entry;

      const recommendedTokenAllowance = group.reduce(
        (previousValue, vestingSchedule) => {
          const startDateValidAfterAllowance = BigNumber.from(
            vestingSchedule.flowRate
          ).mul(vestingSchedulerConstants.START_DATE_VALID_AFTER_IN_SECONDS);
          const endDateValidBeforeAllowance = BigNumber.from(
            vestingSchedule.flowRate
          ).mul(vestingSchedulerConstants.END_DATE_VALID_BEFORE_IN_SECONDS);

          if (vestingSchedule.cliffAndFlowExecutedAt) {
            return previousValue.add(endDateValidBeforeAllowance);
          } else {
            return previousValue
              .add(vestingSchedule.cliffAmount)
              .add(startDateValidAfterAllowance)
              .add(endDateValidBeforeAllowance);
          }
        },
        BigNumber.from("0")
      );

      const requiredFlowOperatorAllowance = group
        .filter((x) => !x.cliffAndFlowExecutedAt)
        .reduce(
          (previousValue, vestingSchedule) =>
            previousValue.add(vestingSchedule.flowRate),
          BigNumber.from("0")
        );

      return {
        tokenAddress,
        recommendedTokenAllowance,
        requiredFlowOperatorPermissions: 5, // Create not needed after cliffAndFlows are executed
        requiredFlowOperatorAllowance,
      };
    }
  );

  return (
    <Card>
      <ul></ul>
      Vesting Contract: {network.vestingSchedulerContractAddress}
      {senderAddress &&
        tokenSummaries.map(
          ({
            tokenAddress,
            recommendedTokenAllowance,
            requiredFlowOperatorPermissions,
            requiredFlowOperatorAllowance,
          }) => (
            <li key={tokenAddress}>
              <VestingSchedulerAllowanceRow
                network={network}
                tokenAddress={tokenAddress}
                senderAddress={senderAddress}
                recommendedTokenAllowance={recommendedTokenAllowance}
                requiredFlowOperatorPermissions={
                  requiredFlowOperatorPermissions
                }
                requiredFlowOperatorAllowance={requiredFlowOperatorAllowance}
              />
            </li>
          )
        )}
    </Card>
  );
};

export const VestingSchedulerAllowanceRow: FC<{
  network: Network;
  tokenAddress: string;
  senderAddress: string;
  recommendedTokenAllowance: BigNumber;
  requiredFlowOperatorPermissions: number; // 5 (Create or Delete) https://docs.superfluid.finance/superfluid/developers/constant-flow-agreement-cfa/cfa-access-control-list-acl/acl-features
  requiredFlowOperatorAllowance: BigNumber;
}> = ({
  network,
  tokenAddress,
  senderAddress,
  recommendedTokenAllowance,
  requiredFlowOperatorPermissions,
  requiredFlowOperatorAllowance,
}) => {
  const vestingSchedulerAllowancesQuery =
    rpcApi.useGetVestingSchedulerAllowancesQuery({
      chainId: network.id,
      tokenAddress: tokenAddress,
      senderAddress: senderAddress,
    });

  if (!vestingSchedulerAllowancesQuery.data) return <>Loading...</>;

  const { tokenAllowance, flowOperatorPermissions, flowOperatorAllowance } =
    vestingSchedulerAllowancesQuery.data;

  const isEnoughTokenAllowance = recommendedTokenAllowance.lte(tokenAllowance);
  const isEnoughFlowOperatorAllowance = requiredFlowOperatorAllowance.lte(
    flowOperatorAllowance
  );

  const existingPermissions = Number(flowOperatorPermissions);
  const hasDeletePermission = existingPermissions & ACL_DELETE_PERMISSION;
  const hasCreatePermission = existingPermissions & ACL_CREATE_PERMISSION;

  return (
    <pre>
      tokenAddress: {tokenAddress}
      <br />
      <br />
      recommendedTokenAllowance: {recommendedTokenAllowance.toString()}
      <br />
      tokenAllowance: {tokenAllowance.toString()}
      <br />
      isEnoughTokenAllowance: {isEnoughTokenAllowance.toString()}
      <br />
      <br />
      requiredFlowOperatorPermissions:{" "}
      {requiredFlowOperatorPermissions.toString()}
      <br />
      isEnoughFlowOperatorPermissions:{" "}
      {(!!(hasDeletePermission && hasCreatePermission)).toString()}
      <br />
      <br />
      requiredFlowOperatorAllowance: {requiredFlowOperatorAllowance.toString()}
      <br />
      flowOperatorAllowance: {flowOperatorAllowance.toString()}
      <br />
      isEnoughFlowOperatorAllowance: {isEnoughFlowOperatorAllowance.toString()}
      <br />
    </pre>
  );
};
