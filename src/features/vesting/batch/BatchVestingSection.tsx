import {
    Box,
    Stack,
    Typography,
    useTheme,
} from "@mui/material";
import { FC, PropsWithChildren, useState } from "react";
import { useFormContext } from "react-hook-form";
import { useExpectedNetwork } from "../../network/ExpectedNetworkContext";
import NetworkBadge from "../../network/NetworkBadge";
import { SuperTokenMinimal } from "../../redux/endpoints/tokenTypes";
import { BackButton } from "../BackButton";
import CreateVestingPreview from "../CreateVestingPreview";
import { WhitelistVestingOverlay } from "../WhitelistVestingOverlay";
import { useTokenQuery } from "../../../hooks/useTokenQuery";
import { skipToken } from "@reduxjs/toolkit/dist/query/react";
import { BatchVestingForm } from "./BatchVestingForm";
import BatchVestingPreview from "./BatchVestingPreview";

export enum CreateVestingCardView {
    Form = 0,
    Preview = 1,
    Approving = 2,
    Success = 3,
}

interface BatchVestingSectionProps extends PropsWithChildren {
    whitelisted: boolean;
}

export const BatchVestingSection: FC<BatchVestingSectionProps> = ({
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
                        Create Batch of Vesting Schedules
                    </Typography>
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
                    <BatchVestingForm token={token} setView={setView} />
                )}

                {(view === CreateVestingCardView.Preview ||
                    view === CreateVestingCardView.Approving ||
                    view === CreateVestingCardView.Success) &&
                    token && (
                        <BatchVestingPreview
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