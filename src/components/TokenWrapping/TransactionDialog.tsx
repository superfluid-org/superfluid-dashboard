import {FC} from "react";
import {
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    IconButton,
    Typography,
    useMediaQuery,
    useTheme
} from "@mui/material";
import {useAppSelector} from "../../redux/store";
import {transactionsAdapter} from "@superfluid-finance/sdk-redux";
import CloseIcon from "@mui/icons-material/Close";
import DoneIcon from "@mui/icons-material/Done";

export const TransactionDialog: FC<{
    open: boolean;
    onClose: () => void;
    transactionHash: string | undefined;
    infoText: string;
}> = ({open, onClose, transactionHash, infoText}) => {
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
    const transaction = useAppSelector((state) =>
        transactionHash
            ? transactionsAdapter
                .getSelectors()
                .selectById(state.superfluid_transactions, transactionHash)
            : undefined
    ); // TODO(KK): "transactionsAdapter" not very good

    return (
        <Dialog
            open={open}
            fullWidth={true}
            maxWidth={"sm"}
            fullScreen={fullScreen}
            onClose={onClose}
        >
            <DialogTitle sx={{m: 0, p: 2}}>
                <Typography>Transaction</Typography>{" "}
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={{
                        position: "absolute",
                        right: 8,
                        top: 8,
                        color: (theme) => theme.palette.grey[500],
                    }}
                >
                    <CloseIcon/>
                </IconButton>
            </DialogTitle>
            <DialogContent dividers sx={{p: 0}}>
                <DialogContentText>{infoText}</DialogContentText>
                {transaction ? (
                    transaction.status === "Pending" ? (
                        <CircularProgress/>
                    ) : transaction.status === "Succeeded" ? (
                        <DoneIcon/>
                    ) : transaction.status === "Failed" ? (
                        <CloseIcon/>
                    ) : null
                ) : (
                    <Typography>Waiting for transaction approval...</Typography>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
};