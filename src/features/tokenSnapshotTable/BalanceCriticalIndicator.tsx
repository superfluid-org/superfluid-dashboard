import ErrorRoundedIcon from "@mui/icons-material/ErrorRounded";
import { Button, Stack, Tooltip, Typography } from "@mui/material";
import { Address } from "@superfluid-finance/sdk-core";
import { format } from "date-fns";
import Link from "next/link";
import { FC, MouseEvent, useMemo } from "react";
import { Network } from "../network/networks";

interface BalanceCriticalIndicatorProps {
  tokenAddress: Address;
  tokenSymbol: string;
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
            Your {tokenSymbol} balance is running low and will run out on{" "}
            <Typography variant="tooltip" color="error">
              {`${format(criticalDate, "MM/dd/yy")} at ${format(
                criticalDate,
                "mm:HH"
              )}`}
            </Typography>
          </Typography>

          <Link href={href} passHref>
            <Button
              href={href}
              fullWidth
              size="medium"
              variant="contained"
              onClick={onClick}
            >
              Wrap Tokens
            </Button>
          </Link>
        </Stack>
      }
    >
      <ErrorRoundedIcon color="error" fontSize="medium" />
    </Tooltip>
  );
};

export default BalanceCriticalIndicator;
