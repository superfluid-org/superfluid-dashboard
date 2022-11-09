import { FC, PropsWithChildren } from "react";
import { Box, Card, IconButton, Stack, Typography } from "@mui/material";
import { useRouter } from "next/router";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { VestingLayout } from "./VestingLayout";

export const VestingScheduleDetailsLayout: FC<PropsWithChildren> = ({
  children,
}) => {
  const router = useRouter();
  const BackButton = (
    <Box>
      <IconButton
        data-cy={"close-button"}
        color="inherit"
        onClick={() => router.push("/vesting")}
      >
        <ArrowBackIcon />
      </IconButton>
    </Box>
  );

  return (
    <VestingLayout>
      <Card>
        <Stack
          direction="row"
          justifyContent="start"
          alignItems="center"
          gap={2}
          sx={{ mb: 5 }}
        >
          {BackButton}
          <Typography component="h2" variant="h5">
            Vesting Schedule Details
          </Typography>
        </Stack>
        {children}
      </Card>
    </VestingLayout>
  );
};
