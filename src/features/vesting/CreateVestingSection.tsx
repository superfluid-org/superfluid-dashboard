import {
  Box,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { FC, PropsWithChildren, useState } from "react";
import { useFormContext } from "react-hook-form";
import NetworkBadge from "../network/NetworkBadge";
import CreateVestingForm from "./CreateVestingForm";
import { useAccount } from "wagmi";
import { useTokenQuery } from "../../hooks/useTokenQuery";
import { skipToken } from "@reduxjs/toolkit/dist/query";
import { SuperTokenMinimal } from "../redux/endpoints/tokenTypes";
import { WhitelistVestingOverlay } from "./WhitelistVestingOverlay";
import CreateVestingPreview from "./CreateVestingPreview";
import { useExpectedNetwork } from "../network/ExpectedNetworkContext";
import { BackButton } from "./BackButton";
import { VestingVersionToggle } from "./VestingVersionToggle";

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
  const { watch } = useFormContext<{
    data: {
      superTokenAddress: string;
    }
  }>();
  const [superTokenAddress] = watch(["data.superTokenAddress"]);

  const { network } = useExpectedNetwork();
  const tokenQuery = useTokenQuery(superTokenAddress ? { chainId: network.id, id: superTokenAddress } : skipToken);
  const token = tokenQuery.data as SuperTokenMinimal | undefined | null; // TODO: get rid of the cast

  const [view, setView] = useState<CreateVestingCardView>(
    CreateVestingCardView.Form
  );

  const { address: accountAddress } = useAccount();
  const showVestingToggle = view === CreateVestingCardView.Form && !!accountAddress && !!network.vestingContractAddress_v2;

  return (
    <Box>
      <Stack
        direction="row"
        justifyContent="start"
        alignItems="center"
        gap={2}
        sx={{ mb: 3 }}
      >
        <BackButton view={view} setView={setView} />

        <Stack direction="row" alignItems="center" gap={3}>
          <Typography component="h2" variant="h5" flex={1}>
            Create a Vesting Schedule
          </Typography>

          {
            showVestingToggle && (
              <VestingVersionToggle network={network} />
            )
          }

        </Stack>

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

        {!whitelisted && <WhitelistVestingOverlay />}
      </Box>
    </Box>
  );
};