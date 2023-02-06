import { Card, Stack, Typography } from "@mui/material";
import { FC } from "react";
import TokenIcon from "../token/TokenIcon";

interface VestingDataCardProps {
  title: string;
  tokenSymbol: string;
  tokenAmount: any;
  fiatAmount?: any;
  dataCy?: string;
}

export const VestingDataCardContent: FC<VestingDataCardProps> = ({
  title,
  tokenSymbol,
  tokenAmount,
  fiatAmount,
  dataCy,
}) => (
  <Stack>
    <Typography variant="h5">{title}</Typography>
    <Stack direction="row" alignItems="center" gap={1.5}>
      <TokenIcon isSuper tokenSymbol={tokenSymbol} size={32} />
      <Stack data-cy={dataCy} direction="row" alignItems="flex-end" gap={0.5}>
        {tokenAmount && (
          <Typography variant="h3mono" sx={{ lineHeight: "36px" }}>
            {tokenAmount}
          </Typography>
        )}{" "}
        <Typography variant="h6" color="text.secondary">
          {tokenSymbol}
        </Typography>
      </Stack>
    </Stack>
    {fiatAmount && (
      <Typography data-cy={`${dataCy}-fiat`} variant="h6" color="text.secondary" sx={{ ml: 6 }}>
        {fiatAmount}
      </Typography>
    )}
  </Stack>
);

const VestingDataCard: FC<VestingDataCardProps> = ({ ...props }) => (
  <Card sx={{ p: 3.5, flex: 1 }}>
    <VestingDataCardContent {...props} />
  </Card>
);

export default VestingDataCard;
