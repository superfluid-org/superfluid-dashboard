import {
  Box,
  IconButton,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Token } from "@superfluid-finance/sdk-core";
import { FC, PropsWithChildren, useState } from "react";
import { useFormContext } from "react-hook-form";
import Link from "../common/Link";
import { useExpectedNetwork } from "../network/ExpectedNetworkContext";
import NetworkBadge from "../network/NetworkBadge";
import NetworkSwitchLink from "../network/NetworkSwitchLink";
import { networkDefinition } from "../network/networks";
import { SuperTokenMinimal } from "../redux/endpoints/tokenTypes";
import { PartialVestingForm } from "./CreateVestingFormProvider";
import CreateVestingPreview from "./CreateVestingPreview";
import CreateVestingForm from "./CreateVestingForm";
import { useRouter } from "next/router";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useVestingToken } from "./useVestingToken";

export type VestingToken = Token & SuperTokenMinimal;

const VestingWhitelistOverlay = () => {
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Stack
      sx={{
        position: "absolute",
        width: `calc(100% + ${theme.spacing(2)})`,
        height: `calc(100% + ${theme.spacing(2)})`,
        top: theme.spacing(-1),
        left: theme.spacing(-1),
        alignItems: "center",
        justifyContent: isBelowMd ? "start" : "center",
        backdropFilter: "blur(5px)",
        backfaceVisibility: "hidden",
      }}
    >
      <Box sx={{ px: 4, pb: 4, textAlign: "center" }}>
        <Typography data-cy="allowlist-message" variant="h5">
          You are not on the allow list.
        </Typography>
        <Typography
          data-cy="allowlist-message"
          sx={{ maxWidth: "410px" }}
          variant="body1"
        >
          If you want to create vesting schedules,{" "}
          <Link
            data-cy={"allowlist-link"}
            href="https://use.superfluid.finance/vesting"
            target="_blank"
          >
            Apply for access
          </Link>{" "}
          or try it out on{" "}
          <NetworkSwitchLink
            title="Polygon Mumbai"
            network={networkDefinition.polygonMumbai}
          />
          .
        </Typography>
      </Box>
    </Stack>
  );
};

export enum CreateVestingCardView {
  Form = 0,
  Preview = 1,
  Approving = 2,
  Success = 3,
}

interface CreateVestingSectionProps extends PropsWithChildren {
  whitelisted: boolean;
}

export const CreateVestingSection: FC<CreateVestingSectionProps> = ({
  whitelisted,
}) => {
  const theme = useTheme();
  const { watch } = useFormContext<PartialVestingForm>();
  const [superTokenAddress] = watch(["data.superTokenAddress"]);

  const { network } = useExpectedNetwork();
  const { token } = useVestingToken(network, superTokenAddress);

  const [view, setView] = useState<CreateVestingCardView>(
    CreateVestingCardView.Form
  );

  const router = useRouter();
  const BackButton = (
    <Box>
      <IconButton
        data-cy={"close-button"}
        color="inherit"
        onClick={() => {
          if (view === CreateVestingCardView.Form) {
            router.push("/vesting");
          } else if (view === CreateVestingCardView.Success) {
            router.push("/vesting");
          } else {
            setView(view - 1);
          }
        }}
      >
        <ArrowBackIcon />
      </IconButton>
    </Box>
  );

  return (
    <Box>
      <Stack
        direction="row"
        justifyContent="start"
        alignItems="center"
        gap={2}
        sx={{ mb: 3 }}
      >
        {BackButton}
        <Typography component="h2" variant="h5" flex={1}>
          Create a Vesting Schedule
        </Typography>

        <NetworkBadge
          network={network}
          sx={{
            [theme.breakpoints.up("md")]: {
              position: "absolute",
              top: 0,
              right: theme.spacing(3.5),
            },
          }}
          NetworkIconProps={{
            size: 32,
            fontSize: 18,
            sx: { [theme.breakpoints.down("md")]: { borderRadius: 1 } },
          }}
        />
      </Stack>

      <Box sx={{ position: "relative", mx: -1, px: 1 }}>
        {view === CreateVestingCardView.Form && (
          <CreateVestingForm token={token} setView={setView} />
        )}

        {(view === CreateVestingCardView.Preview ||
          view === CreateVestingCardView.Approving ||
          view === CreateVestingCardView.Success) &&
          token && (
            <CreateVestingPreview
              token={token}
              network={network}
              setView={setView} 
            />
          )}

        {!whitelisted && <VestingWhitelistOverlay />}
      </Box>
    </Box>
  );
};
