import {FC} from "react";
import {TokenUpgradeDowngradePair} from "../../redux/endpoints/adHocSubgraphEndpoints";
import {BigNumber, ethers} from "ethers";
import {
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Stack,
    Typography,
    useMediaQuery,
    useTheme
} from "@mui/material";
import {rpcApi, useAppDispatch} from "../../redux/store";
import CloseIcon from "@mui/icons-material/Close";
import {addTransactionRecovery} from "../../redux/transactionRecoverySlice";

export const DowngradeConfirmationDialog: FC<{
    open: boolean;
    chainId: number;
    tokenUpgrade: TokenUpgradeDowngradePair;
    amount: BigNumber;
    onClose: () => void;
}> = ({open, chainId, tokenUpgrade, amount, onClose}) => {
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
    const dispatch = useAppDispatch();

    const [downgradeTrigger, downgradeResult] =
        rpcApi.useSuperTokenDowngradeMutation();

    return (
        <Dialog
            open={open}
            fullWidth={true}
            maxWidth={"sm"}
            fullScreen={fullScreen}
            onClose={onClose}
        >
            <DialogTitle>
                <Typography variant="subtitle1">Confirm token downgrade</Typography>
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={{
                        position: "absolute",
                        right: 8,
                        top: 8,
                        color: (t) => t.palette.grey[500],
                    }}
                >
                    <CloseIcon/>
                </IconButton>
            </DialogTitle>
            <DialogContent dividers>
                <Stack spacing={1}>
                    <Stack direction="row" spacing={2}>
                        <Typography variant="subtitle1">Super Token: </Typography>
                        <Typography variant="body1">
                            {tokenUpgrade.superToken.symbol}
                        </Typography>
                    </Stack>
                    <Stack direction="row" spacing={2}>
                        <Typography variant="subtitle1">Underlying Token: </Typography>
                        <Typography variant="body1">
                            {tokenUpgrade.underlyingToken.symbol}
                        </Typography>
                    </Stack>

                    <Stack direction="row" spacing={2}>
                        <Typography variant="subtitle1">Amount to Downgrade: </Typography>
                        <Typography variant="body1">
                            {ethers.utils.formatEther(amount)}
                        </Typography>
                    </Stack>
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button
                    key="downgrade"
                    color="primary"
                    variant="contained"
                    fullWidth={true}
                    onClick={async () => {
                        const transactionInfo = await downgradeTrigger({
                            chainId: chainId,
                            amountWei: amount.toString(),
                            superTokenAddress: tokenUpgrade.superToken.address,
                            waitForConfirmation: true,
                        }).unwrap();

                        dispatch(
                            addTransactionRecovery({
                                key: "SUPER_TOKEN_DOWNGRADE",
                                transactionInfo: transactionInfo,
                                data: {
                                    tokenUpgrade: tokenUpgrade,
                                    amountWei: amount.toString(),
                                },
                            })
                        );

                        onClose();
                    }}
                >
                    {downgradeResult.isLoading ? (
                        <CircularProgress/>
                    ) : (
                        "Downgrade to underlying token"
                    )}
                </Button>
            </DialogActions>
        </Dialog>
    );
};