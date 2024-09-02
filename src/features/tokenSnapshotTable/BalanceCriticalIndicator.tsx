import ErrorRoundedIcon from "@mui/icons-material/ErrorRounded";
import { Button, Stack, Tooltip, Typography } from "@mui/material";
import { Address } from "@superfluid-finance/sdk-core";
import { format } from "date-fns";
import { FC, MouseEvent, useMemo } from "react";
import { Network } from "../network/networks";
import Link from "../common/Link";

interface BalanceCriticalIndicatorProps {
  tokenAddress: Address;
  tokenSymbol: string | undefined;
  network: Network;
  criticalDate: Date;
  onClick: (e: MouseEvent) => void;
}

const BalanceCriticalIndicator: FC<BalanceCriticalIndicatorProps> = ({
  tokenAddress,
  tokenSymbol,
  network,
  criticalDate,
  onClick,
}) => {
  const href = useMemo(
    () => `/wrap?upgrade&token=${tokenAddress}&network=${network.slugName}`,
    [tokenAddress, network]
  );

  return (
    <Tooltip
      arrow
      placement="top"
      componentsProps={{
        tooltip: { sx: { px: 1.5, py: 1, maxWidth: "260px" } },
      }}
      title={
        <Stack gap={1.5}>
          <Typography variant="tooltip" color="text.primary" textAlign="center">
            Your {tokenSymbol ?? "token"} balance is running low and will run out on{" "}
            <Typography variant="tooltip" color="error">
              {`${format(criticalDate, "MM/dd/yy")} at ${format(
                criticalDate,
                "HH:mm"
              )}`}
            </Typography>
          </Typography>

          <Button
            LinkComponent={Link}
            href={href}
            fullWidth
            size="medium"
            variant="contained"
            onClick={onClick}
          >
            Wrap Tokens
          </Button>
        </Stack>
      }
    >
      <ErrorRoundedIcon color="error" fontSize="medium" />
    </Tooltip>
  );
};

export default BalanceCriticalIndicator;
