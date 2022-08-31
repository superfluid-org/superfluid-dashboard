import { Route } from "@lifi/sdk";
import {
  Box,
  Card,
  Chip,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import { FC } from "react";
import { formatDuration, getDurationLabel } from "../../utils/dateUtils";
import { Network } from "../network/networks";
import {
  isSuper,
  isUnderlying,
  TokenMinimal,
  TokenWithIcon,
} from "../redux/endpoints/tokenTypes";
import Amount from "../token/Amount";
import TokenIcon from "../token/TokenIcon";

interface RouteCardProps {
  route: Route;
  toToken: TokenMinimal & TokenWithIcon;
  toNetwork: Network;
  onClick: () => void;
}

const RouteCard: FC<RouteCardProps> = ({
  route,
  toToken,
  toNetwork,
  onClick,
}) => {
  const executionDuration = route.steps.reduce(
    (duration, step) => duration + step.estimate.executionDuration,
    0
  );
  const duration = formatDuration(executionDuration);

  console.log({ duration, executionDuration });

  const isListed = isUnderlying(toToken) || !toToken.isListed;

  return (
    <Card onClick={onClick}>
      <Stack direction="row" gap={1} alignItems="center">
        {(route.tags || ["ALTERNATIVE"]).map((tag) => (
          <Chip key={tag} label={tag} color="primary" size="small" />
        ))}
      </Stack>

      <ListItem disablePadding>
        <ListItemIcon>
          <TokenIcon
            isUnlisted={!isListed}
            isSuper={isSuper(toToken)}
            iconUrl={toToken.iconUrl}
          />
        </ListItemIcon>
        <ListItemText
          primary={<Amount wei={route.toAmount} />}
          secondary={
            <>
              {toToken?.symbol} on {toNetwork?.name}
            </>
          }
        />
      </ListItem>

      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="h5mono">{route.gasCostUSD}$</Typography>
        <Typography variant="h5mono">
          ~{Math.round(duration.duration)}
        </Typography>
      </Stack>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="h7" color="text.secondary">
          gas fee
        </Typography>
        <Typography variant="h7" color="text.secondary">
          {getDurationLabel(duration)}
        </Typography>
      </Stack>
    </Card>
  );
};

export default RouteCard;
