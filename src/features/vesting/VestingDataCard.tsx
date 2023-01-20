import { Card, Typography, Stack } from "@mui/material";
import { FC } from "react";
import Amount from "../token/Amount";
import TokenIcon from "../token/TokenIcon";
import FiatAmount from "../tokenPrice/FiatAmount";

interface VestingDataCardProps {
  title: string;
  tokenSymbol: string;
  amount?: string;
  price?: number;
}

export const VestingDataCardContent: FC<VestingDataCardProps> = ({
  title,
  tokenSymbol,
  amount,
  price,
}) => (
  <Stack>
    <Typography variant="h5">{title}</Typography>
    <Stack direction="row" alignItems="center" gap={1.5}>
      <TokenIcon isSuper tokenSymbol={tokenSymbol} />
      <Stack direction="row" alignItems="flex-end" gap={0.5}>
        {amount && (
          <Typography variant="h3mono" sx={{ lineHeight: "36px" }}>
            <Amount wei={amount} />
          </Typography>
        )}{" "}
        <Typography variant="h6" color="text.secondary">
          {tokenSymbol}
        </Typography>
      </Stack>
    </Stack>
    {amount && price && (
      <Typography variant="h6" color="text.secondary" sx={{ ml: 6 }}>
        <FiatAmount wei={amount} price={price} />
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
