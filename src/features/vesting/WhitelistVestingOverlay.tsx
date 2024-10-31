import { useTheme } from "@mui/material";
import { useMediaQuery } from "@mui/material";
import { Stack, Box, Typography, Link } from "@mui/material";
import NetworkSwitchLink from "../network/NetworkSwitchLink";
import { networkDefinition } from "../network/networks";

export function WhitelistVestingOverlay() {
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
                        title={networkDefinition.optimismSepolia.name}
                        network={networkDefinition.optimismSepolia} />
                    .
                </Typography>
            </Box>
        </Stack>
    );
}