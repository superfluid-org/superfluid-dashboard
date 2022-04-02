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

export const UpgradeConfirmationDialog: FC<{
    open: boolean;
    chainId: number;
    signerAddress: string;
    tokenUpgrade: TokenUpgradeDowngradePair;
    amount: BigNumber;
    onClose: () => void;
}> = ({open, chainId, signerAddress, tokenUpgrade, amount, onClose}) => {
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
    const dispatch = useAppDispatch();

    const allowanceQuery = rpcApi.useSuperTokenUpgradeAllowanceQuery({
        chainId: chainId,
        accountAddress: signerAddress,
        superTokenAddress: tokenUpgrade.superToken.address,
    });

    const currentAllowance = allowanceQuery.data
        ? ethers.BigNumber.from(allowanceQuery.data)
        : null;

    const missingAllowance = currentAllowance
        ? currentAllowance.gt(amount)
            ? ethers.BigNumber.from(0)
            : amount.sub(currentAllowance)
        : null;

    const [approveTrigger, approveResult] = rpcApi.useApproveMutation();
    const [upgradeTrigger, upgradeResult] = rpcApi.useSuperTokenUpgradeMutation();

    return (
        <Dialog
            open={open}
            fullWidth={true}
            maxWidth={"sm"}
            fullScreen={fullScreen}
            onClose={onClose}
        >
            <DialogTitle>
                <Typography variant="subtitle1">Confirm token upgrade</Typography>
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
                        <Typography variant="subtitle1">Underlying Token: </Typography>
                        <Typography variant="body1">
                            {tokenUpgrade.underlyingToken.symbol}
                        </Typography>
                    </Stack>
                    <Stack direction="row" spacing={2}>
                        <Typography variant="subtitle1">Super Token: </Typography>
                        <Typography variant="body1">
                            {tokenUpgrade.superToken.symbol}
                        </Typography>
                    </Stack>
                    <Stack direction="row" spacing={2}>
                        <Typography variant="subtitle1">Amount to Upgrade: </Typography>
                        <Typography variant="body1">
                            {ethers.utils.formatEther(amount)}
                        </Typography>
                    </Stack>
                    <Stack direction="row" spacing={2}>
                        <Typography variant="subtitle1">Available Allowance: </Typography>
                        <Typography variant="body1">
                            {!!currentAllowance && ethers.utils.formatEther(currentAllowance)}
                        </Typography>
                    </Stack>
                    <Stack direction="row" spacing={2}>
                        <Typography variant="subtitle1">Missing allowance: </Typography>
                        <Typography variant="body1">
                            {!!missingAllowance && ethers.utils.formatEther(missingAllowance)}
                        </Typography>
                    </Stack>
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button
                    key="allowance"
                    disabled={!!missingAllowance?.isZero()}
                    color="primary"
                    variant="contained"
                    fullWidth={true}
                    onClick={async () => {
                        if (currentAllowance && missingAllowance) {
                            await approveTrigger({
                                chainId: chainId,
                                amountWei: currentAllowance.add(missingAllowance).toString(),
                                superTokenAddress: tokenUpgrade.superToken.address,
                            });
                        } else {
                            console.log("This return should never happen.");
                        }
                    }}
                >
                    {approveResult.isLoading ? <CircularProgress/> : "Approve allowance"}
                </Button>

                <Button
                    key="upgrade"
                    disabled={!missingAllowance?.isZero()}
                    color="primary"
                    variant="contained"
                    fullWidth={true}
                    onClick={async () => {
                        const transactionInfo = await upgradeTrigger({
                            chainId: chainId,
                            amountWei: amount.toString(),
                            superTokenAddress: tokenUpgrade.superToken.address,
                            waitForConfirmation: true,
                        }).unwrap();

                        dispatch(
                            addTransactionRecovery({
                                key: "SUPER_TOKEN_UPGRADE",
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
                    {upgradeResult.isLoading ? (
                        <CircularProgress/>
                    ) : (
                        "Upgrade to super token"
                    )}
                </Button>
            </DialogActions>
        </Dialog>
    );
};