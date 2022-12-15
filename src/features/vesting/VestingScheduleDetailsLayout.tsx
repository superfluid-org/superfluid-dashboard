import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
  Box,
  Card,
  IconButton,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { useRouter } from "next/router";
import { FC, PropsWithChildren } from "react";
import { VestingLayout } from "./VestingLayout";

export const VestingScheduleDetailsLayout: FC<PropsWithChildren> = ({
  children,
}) => {
  const router = useRouter();
  const theme = useTheme();

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
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          [theme.breakpoints.up("md")]: {
            my: 4,
          },
        }}
      >
        <Card
          elevation={1}
          sx={{
            maxWidth: "600px",
            width: "100%",
            position: "relative",
            [theme.breakpoints.down("md")]: {
              boxShadow: "none",
              backgroundImage: "none",
              borderRadius: 0,
              border: 0,
              p: 0,
            },
          }}
        >
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
      </Box>
    </VestingLayout>
  );
};
