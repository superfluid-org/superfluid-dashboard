import { Button, Stack, useMediaQuery, useTheme } from "@mui/material";
import { FC, useCallback } from "react";
import { GraphType } from "./TokenBalanceGraph";

interface TokenGraphFilterProps {
  activeType: GraphType;
  onChange: (newGraphType: GraphType) => void;
}

const TokenGraphFilter: FC<TokenGraphFilterProps> = ({
  activeType,
  onChange,
}) => {
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));

  const onGraphTypeChange = (newGraphType: GraphType) => () =>
    onChange(newGraphType);

  const getGraphFilterColor = useCallback(
    (type: GraphType) => (activeType === type ? "primary" : "secondary"),
    [activeType]
  );

  return (
    <Stack direction="row" gap={isBelowMd ? 0.25 : 0.5}>
      {/* <Button
        variant="textContained"
        color={getGraphFilterColor(GraphType.Day)}
        onClick={onGraphTypeChange(GraphType.Day)}
        size="xs"
      >
        1D
      </Button> */}
      <Button
        variant="textContained"
        color={getGraphFilterColor(GraphType.Week)}
        onClick={onGraphTypeChange(GraphType.Week)}
        size="xs"
      >
        7D
      </Button>
      <Button
        variant="textContained"
        color={getGraphFilterColor(GraphType.Month)}
        onClick={onGraphTypeChange(GraphType.Month)}
        size="xs"
      >
        1M
      </Button>
      <Button
        variant="textContained"
        color={getGraphFilterColor(GraphType.Quarter)}
        onClick={onGraphTypeChange(GraphType.Quarter)}
        size="xs"
      >
        3M
      </Button>
      <Button
        variant="textContained"
        color={getGraphFilterColor(GraphType.Year)}
        onClick={onGraphTypeChange(GraphType.Year)}
        size="xs"
      >
        1Y
      </Button>
      <Button
        variant="textContained"
        color={getGraphFilterColor(GraphType.YTD)}
        onClick={onGraphTypeChange(GraphType.YTD)}
        size="xs"
      >
        YTD
      </Button>
      <Button
        variant="textContained"
        color={getGraphFilterColor(GraphType.All)}
        onClick={onGraphTypeChange(GraphType.All)}
        size="xs"
      >
        All
      </Button>
    </Stack>
  );
};

export default TokenGraphFilter;
