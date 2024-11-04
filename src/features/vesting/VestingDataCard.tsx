import {
  Card,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { FC } from "react";
import TokenIcon from "../token/TokenIcon";

interface VestingDataCardProps {
  title: string;
  chainId: number;
  tokenAddress: string;
  tokenSymbol: string;
  tokenAmount: any; // TODO: why any?
  fiatAmount?: any;
  dataCy?: string;
}

export const VestingDataCardContent: FC<VestingDataCardProps> = ({
  title,
  chainId,
  tokenAddress,
  tokenSymbol,
  tokenAmount,
  fiatAmount,
  dataCy,
}) => {
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Stack>
      <Typography
        variant={isBelowMd ? "h6" : "h5"}
        sx={{ mb: isBelowMd ? 0.5 : 1 }}
      >
        {title}
      </Typography>
      <Stack direction="row" alignItems="center" gap={1.5}>
        <TokenIcon chainId={chainId} tokenAddress={tokenAddress} isSuper />
        <Stack
          data-cy={dataCy}
          direction={isBelowMd ? "column" : "row"}
          alignItems={isBelowMd ? "start" : "flex-end"}
          gap={isBelowMd ? 0 : 0.5}
        >
          {tokenAmount && (
            <Typography
              variant={isBelowMd ? "h5mono" : "h4mono"}
              sx={{ lineHeight: isBelowMd ? "20px" : "25px" }}
            >
              {tokenAmount}
            </Typography>
          )}
          <Typography
            variant={isBelowMd ? "h7" : "h6"}
            color="text.secondary"
            sx={{ lineHeight: "20px" }}
          >
            {tokenSymbol}
          </Typography>
        </Stack>
      </Stack>
      {fiatAmount && (
        <Typography
          data-cy={`${dataCy}-fiat`}
          variant="h6"
          color="text.secondary"
          sx={{ ml: 6, [theme.breakpoints.down("md")]: { ml: 5.5 } }}
        >
          {fiatAmount}
        </Typography>
      )}
    </Stack>
  );
};

const VestingDataCard: FC<VestingDataCardProps> = ({ ...props }) => {
  const theme = useTheme();

  return (
    <Card
      sx={{
        p: 3.5,
        flex: 1,
        [theme.breakpoints.down("md")]: {
          py: 2,
        },
      }}
    >
      <VestingDataCardContent {...props} />
    </Card>
  );
};

export default VestingDataCard;
