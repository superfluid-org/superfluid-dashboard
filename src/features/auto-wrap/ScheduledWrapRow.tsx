import {
    Skeleton,
    Stack,
    TableCell,
    TableRow,
    Typography,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import { FC, memo, useCallback, useState } from "react";
import { Network } from "../network/networks";
import { WrapSchedule } from "./types";
import { subgraphApi } from "../redux/store";
import TokenIcon from "../token/TokenIcon";
import DisableAutoWrapTransactionButton from "../vesting/transactionButtons/DisableAutoWrapTransactionButton";
import ConnectionBoundary from "../transactionBoundary/ConnectionBoundary";
import { getSuperTokenType } from "../redux/endpoints/adHocSubgraphEndpoints";
import { TokenType } from "../redux/endpoints/tokenTypes";
import useActiveAutoWrap from "../vesting/useActiveAutoWrap";
import EnableAutoWrapButton from "../vesting/transactionButtons/EnableAutoWrapTransactionButton";
import AutoWrapEnableDialogSection from "../vesting/dialogs/AutoWrapEnableDialogSection";

interface SnapshotRowProps {
    lastElement?: boolean;
    open?: boolean;
}

interface ScheduledWrapRowProps {
    network: Network;
    schedule: WrapSchedule;
    lastElement: boolean;
}

const ScheduledWrapRow: FC<ScheduledWrapRowProps> = ({
    network,
    schedule,
    lastElement,
}) => {
    const theme = useTheme();
    const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));

    const [isEnableAutoWrapDialogOpen, setEnableAutoWrapDialogOpen] = useState(false);

    const openEnableAutoWrapDialog = useCallback(() => setEnableAutoWrapDialogOpen(true), [setEnableAutoWrapDialogOpen]);
    const closeEnableAutoWrapDialog = useCallback(() => setEnableAutoWrapDialogOpen(false), [setEnableAutoWrapDialogOpen]);

    const {
        superToken,
        account
    } = schedule;

    const { data: token, isLoading: isTokenLoading } =
        subgraphApi.useTokenQuery({
            id: superToken,
            chainId: network.id,
        });

    const tokenSnapshotQuery = subgraphApi.useAccountTokenSnapshotQuery({
        chainId: network.id,
        id: `${account.toLowerCase()}-${superToken.toLowerCase()}`,
    }, {
        refetchOnFocus: true, // Re-fetch list view more often where there might be something incoming.
    });

    const isAutoWrappable =
        token &&
        getSuperTokenType({
            network,
            address: token.id,
            underlyingAddress: token.underlyingAddress,
        }) === TokenType.WrapperSuperToken;

    const {
        isAutoWrapLoading,
        activeAutoWrapSchedule,
        isAutoWrapAllowanceSufficient,
    } = useActiveAutoWrap(
        isAutoWrappable
            ? {
                chainId: network.id,
                accountAddress: account,
                superTokenAddress: token.id,
                underlyingTokenAddress: token.underlyingAddress,
            }
            : "skip"
    );

    const isAutoWrapOK = Boolean(
        activeAutoWrapSchedule && isAutoWrapAllowanceSufficient && isAutoWrappable
    );

    return (
        <>
            {isBelowMd ? (
                <>Mobile view</>
            ) : (
                <TableRow>
                    <TableCell align="left">
                        <Stack
                            data-cy={"token-header"}
                            direction="row"
                            alignItems="center"
                            gap={2}
                        >
                            <TokenIcon
                                isSuper
                                tokenSymbol={token?.symbol}
                                isLoading={isTokenLoading}
                            />
                            <Typography variant="h6" data-cy={"token-symbol"}>
                                {token?.symbol}
                            </Typography>
                        </Stack>
                    </TableCell>
                    <TableCell>
                        <Typography data-cy={"access-setting-address"} variant="h6">
                            Unlimited
                        </Typography>
                    </TableCell>
                    <TableCell>
                        <Typography variant="h6">
                            1 Weeks
                        </Typography>
                    </TableCell>
                    <TableCell>
                        <Typography variant="h6">
                            2 Weeks
                        </Typography>
                    </TableCell>
                    <TableCell align="center">
                        <ConnectionBoundary >
                            {token && network.autoWrap ? (
                                isAutoWrapLoading ? (
                                    <Skeleton variant="rectangular" width={24} height={24} />
                                ) : isAutoWrapOK ? (
                                    <DisableAutoWrapTransactionButton key={`auto-wrap-revoke-${token?.symbol}`} isDisabled={false} isVisible={true} token={token} ButtonProps={{
                                        size: "small",
                                        variant: "outlined"
                                    }} />
                                ) : isAutoWrappable ? (
                                    <EnableAutoWrapButton openEnableAutoWrapDialog={openEnableAutoWrapDialog} ButtonProps={{
                                        size: "small",
                                        variant: "contained"
                                    }} />
                                ) : null
                            ) : null
                            }
                            {token && <AutoWrapEnableDialogSection
                                key={"auto-wrap-enable-dialog-section"}
                                closeEnableAutoWrapDialog={closeEnableAutoWrapDialog}
                                isEnableAutoWrapDialogOpen={isEnableAutoWrapDialogOpen}
                                isActiveAutoWrapSchedule={!activeAutoWrapSchedule as boolean}
                                isAutoWrapAllowanceSufficient={!isAutoWrapAllowanceSufficient as boolean}
                                isAutoWrapLoading={isAutoWrapLoading}
                                token={token}
                                network={network} />}
                        </ConnectionBoundary>
                    </TableCell>
                </TableRow>
            )}
        </>
    );
};

export default memo(ScheduledWrapRow);
