import {
  Divider,
  Paper,
  Stack,
  Tooltip,
  Typography,
  TypographyProps,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { skipToken } from "@reduxjs/toolkit/query";
import { differenceInDays, format, fromUnixTime } from "date-fns";
import { formatEther } from "ethers/lib/utils";
import {
  FC,
  isValidElement,
  PropsWithChildren,
  ReactNode,
  useMemo,
} from "react";
import shortenHex from "../../../utils/shortenHex";
import {
  getPrettyEtherFlowRate,
  parseEtherOrZero,
} from "../../../utils/tokenUtils";
import TooltipWithIcon from "../../common/TooltipWithIcon";
import { useExpectedNetwork } from "../../network/ExpectedNetworkContext";
import { SuperTokenMinimal } from "../../redux/endpoints/tokenTypes";
import { rpcApi } from "../../redux/store";
import Amount from "../../token/Amount";
import FlowingBalance from "../../token/FlowingBalance";
import { useVisibleAddress } from "../../wallet/VisibleAddressContext";
import {
  calculateTotalAmountWei,
  flowRateEtherToString,
  ScheduledFlowRate,
  ScheduledFlowRateEther,
} from "../FlowRateInput";
import useCalculateBufferInfo from "../useCalculateBufferInfo";
import {
  ActiveStreamIcon,
  ScheduledStreamIcon,
} from "../../streamsTable/StreamIcons";

interface PreviewItemProps {
  label: string | ReactNode;
  isError?: boolean;
  oldValue?: ReactNode;
  dataCy?: string;
  /** Renders the value with tabular numerals, as the app's tables do. */
  numeric?: boolean;
  TypographyProps?: Partial<TypographyProps>;
}

const PreviewItem: FC<PropsWithChildren<PreviewItemProps>> = ({
  label,
  children,
  oldValue,
  isError,
  dataCy,
  numeric,
  TypographyProps = {},
}) => {
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));

  const valueTypography = (
    <Typography
      data-cy={dataCy}
      component="span"
      variant={numeric ? "body2mono" : "body2"}
      {...TypographyProps}
      sx={[
        {
          fontWeight: "500",
          color: isError
            ? theme.palette.error.main
            : theme.palette.text.primary,
          textAlign: isBelowMd ? "left" : "right",
        },
        ...(Array.isArray(TypographyProps.sx)
          ? TypographyProps.sx
          : [TypographyProps.sx]),
      ]}
    >
      {children}
    </Typography>
  );
  return (
    <Stack
      direction={isBelowMd ? "column" : "row"}
      sx={{
        alignItems: isBelowMd ? "start" : "center",
        justifyContent: "space-between",
        gap: isBelowMd ? 0 : 2,
      }}
    >
      {isValidElement(label) ? (
        label
      ) : (
        <Typography
          variant="body2"
          translate="yes"
          sx={{ color: "text.secondary" }}
        >
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

interface StreamingPreviewProps {
  receiver: string;
  token: SuperTokenMinimal;
  existingFlowRate: ScheduledFlowRate | null;
  flowRateEther: ScheduledFlowRateEther;
  newEndDate: Date | null;
  oldEndDate: Date | null;
}

export const StreamingPreview: FC<StreamingPreviewProps> = ({
  receiver,
  token,
  existingFlowRate,
  flowRateEther,
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

  const calculateBufferInfo = useCalculateBufferInfo();

  const oldEndDateString = useMemo(
    () =>
      oldEndDate ? (
        <>
          {format(oldEndDate, "P")} at {format(oldEndDate, "p")}
        </>
      ) : (
        "Never"
      ),
    [oldEndDate]
  );

  const tokenBufferQuery = rpcApi.useTokenBufferQuery(
    token.address ? { chainId: network.id, token: token.address } : skipToken
  );

  const existingPrettyEtherFlowRate = useMemo(
    () =>
      existingFlowRate
        ? getPrettyEtherFlowRate(existingFlowRate.flowRate)
        : undefined,
    [existingFlowRate]
  );

  const newScheduledFlowRate: ScheduledFlowRate = useMemo(
    () => ({
      flowRate: calculateTotalAmountWei(flowRateEther).toString(),
      startTimestamp: flowRateEther.startTimestamp,
    }),
    [flowRateEther]
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
    () =>
      existingFlowRate ? formatEther(existingFlowRate.flowRate) : undefined,
    [existingFlowRate]
  );

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
      !tokenBufferQuery.data
    ) {
      return {} as Record<string, any>;
    }

    const { newDateWhenBalanceCritical, ...bufferInfo } = calculateBufferInfo(
      network,
      realtimeBalance,
      existingFlowRate,
      newScheduledFlowRate,
      tokenBufferQuery.data
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
    existingFlowRate,
    newScheduledFlowRate,
    calculateBufferInfo,
    realtimeBalance,
    tokenBufferQuery.data,
  ]);

  const isBufferLossCritical = useMemo(
    () =>
      newDateWhenBalanceCritical &&
      differenceInDays(newDateWhenBalanceCritical, new Date()) < 7,
    [newDateWhenBalanceCritical]
  );

  return (
    <Paper
      variant="outlined"
      sx={{
        py: 0.5,
        px: 2.5,
        borderColor: theme.palette.other.outline,
      }}
      translate="no"
    >
      <Stack
        // Row rules only apply to the desktop single-column layout. Below md the
        // rows wrap into two columns, where dividers between flex items render
        // in the wrong places — so the wrap layout keeps its plain gap instead.
        divider={isBelowMd ? undefined : <Divider flexItem />}
        sx={{
          // :not(hr) so the row padding does not also apply to the dividers.
          "> *:not(hr)": { py: 1 },
          [theme.breakpoints.down("md")]: {
            flexDirection: "row",
            flexWrap: "wrap",
            columnGap: 1,
            "> *:not(hr)": {
              py: 0.25,
              minWidth: `calc(50% - ${theme.spacing(1)})`,
            },
          }
        }}>
        <PreviewItem dataCy="preview-receiver" label="Receiver">
          {isBelowMd ? shortenHex(receiver, 14) : receiver}
        </PreviewItem>

        <PreviewItem
          dataCy="preview-flow-rate"
          label="Flow rate"
          numeric
          oldValue={
            existingPrettyEtherFlowRate &&
            flowRateEtherToString(existingPrettyEtherFlowRate, token.symbol)
          }
        >
          {flowRateEtherToString(flowRateEther, token.symbol)}
        </PreviewItem>

        <PreviewItem
          dataCy="preview-per-second"
          label="Amount per second"
          numeric
          oldValue={
            existingFlowRate &&
            oldAmountPerSecond != newAmountPerSecond && (
              <>
                {oldAmountPerSecond} {token.symbol}
              </>
            )
          }
        >
          {newAmountPerSecond} {token.symbol}
        </PreviewItem>

        {/* TODO: Handle start date if modifying stream */}
        {newScheduledFlowRate.startTimestamp && (
          <PreviewItem dataCy="preview-starts-on" label="Start date">
            <Stack
              direction="row"
              sx={{ alignItems: "center", gap: 0.5 }}
            >
              <ScheduledStreamIcon
                scheduledStart
                IconProps={{
                  sx: { display: "block", color: "text.secondary" },
                }}
              />
              {format(
                fromUnixTime(newScheduledFlowRate.startTimestamp),
                "P"
              )}{" "}
              at{" "}
              {format(fromUnixTime(newScheduledFlowRate.startTimestamp), "p")}
            </Stack>
          </PreviewItem>
        )}

        <PreviewItem
          dataCy="preview-ends-on"
          label="End date"
          oldValue={
            existingFlowRate && oldEndDate != newEndDate && oldEndDateString
          }
        >
          <Stack
            direction="row"
            sx={{
              alignItems: "center",
              gap: 0.5
            }}>
            {newEndDate ? (
              <>
                <ScheduledStreamIcon
                  scheduledEnd
                  IconProps={{
                    sx: { display: "block", color: "text.secondary" },
                  }}
                />
                {format(newEndDate, "P")} at {format(newEndDate, "p")}
              </>
            ) : (
              <>
                <ActiveStreamIcon
                  IconProps={{
                    sx: { display: "block", color: "text.secondary" },
                  }}
                />
                Never
              </>
            )}
          </Stack>
        </PreviewItem>

        {newBufferAmount && (
          <PreviewItem
            dataCy="preview-upfront-buffer"
            numeric
            label={
              <Typography
                variant="body2"
                translate="yes"
                sx={{ color: "text.secondary" }}
              >
                Upfront buffer{` `}
                <TooltipWithIcon
                  title={`A minimum buffer or ${
                    network.bufferTimeInMinutes / 60
                  } hour flow rate is taken when starting a stream and returned when you manually cancel it.`}
                />
              </Typography>
            }
            oldValue={
              existingFlowRate &&
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
            numeric
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
            dataCy={"preview-buffer-loss"}
            label="Predicted buffer loss date"
            isError={isBufferLossCritical}
            oldValue={
              existingFlowRate &&
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
    </Paper>
  );
};
