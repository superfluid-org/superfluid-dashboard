import {
  Alert,
  alpha,
  Stack,
  Tooltip,
  Typography,
  TypographyProps,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { skipToken } from "@reduxjs/toolkit/dist/query";
import { differenceInDays, format } from "date-fns";
import { formatEther } from "ethers/lib/utils";
import {
  FC,
  isValidElement,
  PropsWithChildren,
  ReactNode,
  useMemo,
} from "react";
import shortenHex from "../../utils/shortenHex";
import { parseEtherOrZero } from "../../utils/tokenUtils";
import TooltipIcon from "../common/TooltipIcon";
import { useExpectedNetwork } from "../network/ExpectedNetworkContext";
import { SuperTokenMinimal } from "../redux/endpoints/tokenTypes";
import { rpcApi } from "../redux/store";
import Amount from "../token/Amount";
import FlowingBalance from "../token/FlowingBalance";
import { useVisibleAddress } from "../wallet/VisibleAddressContext";
import {
  FlowRateEther,
  flowRateEtherToString,
  flowRateWeiToString,
  UnitOfTime,
} from "./FlowRateInput";
import useCalculateBufferInfo from "./useCalculateBufferInfo";
import AllInclusiveIcon from "@mui/icons-material/AllInclusive";
import TimerOutlined from "@mui/icons-material/TimerOutlined";

interface PreviewItemProps {
  label: string | ReactNode;
  isError?: boolean;
  oldValue?: ReactNode;
  dataCy?: string;
  TypographyProps?: Partial<TypographyProps>;
}

const PreviewItem: FC<PropsWithChildren<PreviewItemProps>> = ({
  label,
  children,
  oldValue,
  isError,
  dataCy,
  TypographyProps = {},
}) => {
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));

  const valueTypography = (
    <Typography
      data-cy={dataCy}
      variant="body2"
      fontWeight="500"
      sx={{
        color: isError ? "red" : theme.palette.primary.main, // TODO(KK): handle colors better?
      }}
      {...TypographyProps}
    >
      {children}
    </Typography>
  );

  return (
    <Stack
      direction={isBelowMd ? "column" : "row"}
      alignItems={isBelowMd ? "start" : "center"}
      justifyContent="space-between"
    >
      {isValidElement(label) ? (
        label
      ) : (
        <Typography variant="body2" translate="yes">
          {label}
        </Typography>
      )}
      {oldValue ? (
        <Tooltip
          title={
            <>
              <span translate="yes">Current:</span> {oldValue}
            </>
          }
          arrow
          placement="top"
        >
          {valueTypography}
        </Tooltip>
      ) : (
        valueTypography
      )}
    </Stack>
  );
};

export const StreamingPreview: FC<{
  receiver: string;
  token: SuperTokenMinimal;
  flowRateEther: FlowRateEther;
  existingStream: {
    flowRateWei: string;
  } | null;
  newEndDate: Date | null;
  oldEndDate: Date | null;
}> = ({
  receiver,
  token,
  flowRateEther,
  existingStream,
  newEndDate,
  oldEndDate,
}) => {
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));

  const { network } = useExpectedNetwork();
  const { visibleAddress } = useVisibleAddress();

  const {
    data: _discard,
    currentData: realtimeBalance,
    ...realtimeBalanceQuery
  } = rpcApi.useRealtimeBalanceQuery(
    visibleAddress
      ? {
          chainId: network.id,
          tokenAddress: token.address,
          accountAddress: visibleAddress,
        }
      : skipToken
  );

  const {
    data: _discard2,
    currentData: existingFlow,
    ...activeFlowQuery
  } = rpcApi.useGetActiveFlowQuery(
    visibleAddress
      ? {
          chainId: network.id,
          tokenAddress: token.address,
          senderAddress: visibleAddress,
          receiverAddress: receiver,
        }
      : skipToken
  );

  const newAmountPerSecond = useMemo<string>(
    () =>
      formatEther(
        parseEtherOrZero(flowRateEther.amountEther).div(
          flowRateEther.unitOfTime
        )
      ),
    [flowRateEther.amountEther, flowRateEther.unitOfTime]
  );

  const oldAmountPerSecond = useMemo<string | undefined>(
    () => (existingFlow ? formatEther(existingFlow.flowRateWei) : undefined),
    [existingFlow]
  );

  const calculateBufferInfo = useCalculateBufferInfo();

  const newEndDateString = useMemo(() => {
    return newEndDate ? (
      <Stack direction="row" alignItems="center" gap={0.5}>
        <TimerOutlined />
        {format(newEndDate, "P")} at {format(newEndDate, "p")}
      </Stack>
    ) : (
      <Stack direction="row" alignItems="center" gap={0.5}>
        <AllInclusiveIcon />
        Never
      </Stack>
    );
  }, [newEndDate]);

  const oldEndDateString = useMemo(() => {
    return oldEndDate ? (
      <>
        {format(oldEndDate, "P")} at {format(oldEndDate, "p")}
      </>
    ) : (
      "Never"
    );
  }, [oldEndDate]);

  const {
    balanceAfterBuffer,
    oldBufferAmount,
    newBufferAmount,
    newTotalFlowRate,
    oldDateWhenBalanceCritical,
    newDateWhenBalanceCritical,
  } = useMemo(() => {
    if (
      !realtimeBalance ||
      !realtimeBalanceQuery.isSuccess ||
      !activeFlowQuery.isSuccess
    ) {
      return {} as Record<string, any>;
    }
    const { newDateWhenBalanceCritical, ...bufferInfo } = calculateBufferInfo(
      network,
      realtimeBalance,
      existingFlow ?? null,
      {
        amountWei: parseEtherOrZero(flowRateEther.amountEther).toString(),
        unitOfTime: flowRateEther.unitOfTime,
      }
    );

    const currentDate = new Date();

    return {
      ...bufferInfo,
      newDateWhenBalanceCritical:
        newDateWhenBalanceCritical && newDateWhenBalanceCritical < currentDate
          ? currentDate
          : newDateWhenBalanceCritical,
    };
  }, [
    network,
    realtimeBalanceQuery,
    activeFlowQuery,
    flowRateEther,
    calculateBufferInfo,
    existingFlow,
    realtimeBalance,
  ]);

  const isBufferLossCritical = useMemo(
    () =>
      newDateWhenBalanceCritical &&
      differenceInDays(newDateWhenBalanceCritical, new Date()) < 7,
    [newDateWhenBalanceCritical]
  );

  return (
    <Alert
      icon={false}
      variant="outlined"
      severity="success"
      sx={{
        py: 1,
        px: 2.5,
        borderColor: theme.palette.primary.main,
        backgroundColor: alpha(theme.palette.primary.main, 0.04),
        //TODO: This alert message rule should be looked deeper into. This should not be needed
        ".MuiAlert-message": {
          flex: 1,
        },
      }}
      translate="no"
    >
      <Stack
        gap={0.5}
        sx={{
          [theme.breakpoints.down("md")]: {
            flexDirection: "row",
            flexWrap: "wrap",
            columnGap: 1,
            "> *": {
              minWidth: `calc(50% - ${theme.spacing(1)})`,
            },
          },
        }}
      >
        <PreviewItem dataCy="preview-receiver" label="Receiver">
          {isBelowMd ? shortenHex(receiver, 14) : receiver}
        </PreviewItem>

        <PreviewItem
          dataCy="preview-flow-rate"
          label="Flow rate"
          oldValue={
            existingStream &&
            flowRateWeiToString(
              {
                amountWei: existingStream.flowRateWei,
                unitOfTime: UnitOfTime.Second,
              },
              token.symbol
            )
          }
        >
          {flowRateEtherToString(flowRateEther, token.symbol)}
        </PreviewItem>

        <PreviewItem
          dataCy="preview-per-second"
          label="Amount per second"
          oldValue={
            existingFlow &&
            oldAmountPerSecond != newAmountPerSecond && (
              <>
                {oldAmountPerSecond} {token.symbol}
              </>
            )
          }
        >
          {newAmountPerSecond} {token.symbol}
        </PreviewItem>

        <PreviewItem
          dataCy="preview-ends-on"
          label="Ends date"
          oldValue={
            existingFlow && oldEndDate != newEndDate && oldEndDateString
          }
        >
          {newEndDateString}
        </PreviewItem>

        {newBufferAmount && (
          <PreviewItem
            dataCy="preview-upfront-buffer"
            label={
              <Typography variant="body2" translate="yes">
                Upfront buffer{` `}
                <TooltipIcon
                  title={`A ${
                    network.bufferTimeInMinutes / 60
                  } hour buffer of the flow rate is taken when starting a stream and returned when you manually cancel it.`}
                />
              </Typography>
            }
            oldValue={
              existingFlow &&
              oldBufferAmount && (
                <Amount wei={oldBufferAmount}> {token.symbol}</Amount>
              )
            }
          >
            <Amount wei={newBufferAmount}> {token.symbol}</Amount>
          </PreviewItem>
        )}

        {visibleAddress && balanceAfterBuffer && (
          <PreviewItem
            dataCy="preview-balance-after-buffer"
            label="Balance after buffer"
            isError={balanceAfterBuffer.isNegative()}
            TypographyProps={{ variant: "body2mono" }}
          >
            {realtimeBalance && (
              <FlowingBalance
                balance={balanceAfterBuffer.toString()}
                balanceTimestamp={realtimeBalance.balanceTimestamp}
                flowRate={realtimeBalance.flowRate}
                tokenSymbol={token.symbol}
              />
            )}
          </PreviewItem>
        )}

        {newTotalFlowRate?.isNegative() && !balanceAfterBuffer.isNegative() && (
          <PreviewItem
            dataCy={"buffer-loss"}
            label="Predicted buffer loss date"
            isError={isBufferLossCritical}
            oldValue={
              existingFlow &&
              oldDateWhenBalanceCritical &&
              `${format(oldDateWhenBalanceCritical, "P")} at ${format(
                oldDateWhenBalanceCritical,
                "p"
              )}`
            }
          >
            {newDateWhenBalanceCritical &&
              `${format(newDateWhenBalanceCritical, "P")} at ${format(
                newDateWhenBalanceCritical,
                "p"
              )}`}
          </PreviewItem>
        )}
      </Stack>
    </Alert>
  );
};
