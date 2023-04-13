import {
  Box,
  Typography,
  Stack,
  Button,
  Divider,
  Collapse,
} from "@mui/material";
import { FC, PropsWithChildren, useCallback, useState } from "react";

interface VestingManualActionProps extends PropsWithChildren {
  title: string;
  description: string;
}

const VestingManualAction: FC<VestingManualActionProps> = ({
  title,
  description,
  children,
}) => (
  <Box sx={{ maxWidth: "240px" }}>
    <Typography variant="h6">{title}</Typography>
    <Typography sx={{ mt: 1, mb: 2 }}>{description}</Typography>
    {children}
  </Box>
);

interface VestingManualOverridesBlockProps {}

const VestingManualOverridesBlock: FC<
  VestingManualOverridesBlockProps
> = ({}) => {
  const [expanded, setExpanded] = useState(true);

  const toggleExpanded = useCallback(() => {
    setExpanded(!expanded);
  }, [expanded, setExpanded]);

  return (
    <>
      <Stack direction="row" alignItems="center">
        <Typography
          variant="h6"
          color="text.secondary"
          onClick={toggleExpanded}
        >
          Show manual overrides
        </Typography>
      </Stack>

      <Collapse in={expanded}>
        <Stack direction="row" alignItems="stretch" gap={2}>
          <VestingManualAction
            title="Send Cliff and Start Stream"
            description="Use in case you want to lorem ipsum dolor sit amet."
          >
            <Button fullWidth variant="contained" color="primary">
              Send
            </Button>
          </VestingManualAction>

          <Divider orientation="vertical" sx={{ height: "auto" }} />

          <VestingManualAction
            title="End Vesting"
            description="Use in case you want to lorem ipsum dolor sit amet."
          >
            <Button fullWidth variant="contained" color="primary">
              End
            </Button>
          </VestingManualAction>
        </Stack>
      </Collapse>
    </>
  );
};

export default VestingManualOverridesBlock;
