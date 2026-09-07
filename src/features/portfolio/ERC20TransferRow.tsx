import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import {
  ListItemText,
  Stack,
  TableCell,
  TableRow,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { format } from "date-fns";
import { FC } from "react";
import AddressName from "../../components/AddressName/AddressName";
import AddressAvatar from "../../components/Avatar/AddressAvatar";
import AddressCopyTooltip from "../common/AddressCopyTooltip";
import Amount from "../token/Amount";
import { ERC20TransferHistoryItem } from "./erc20TransferHistory";

const ERC20TransferRow: FC<{
  transfer: ERC20TransferHistoryItem;
  accountAddress: string;
  tokenDecimals: number;
}> = ({ transfer, accountAddress, tokenDecimals }) => {
  const isOutgoing = transfer.from === accountAddress.toLowerCase();
  const counterparty = isOutgoing ? transfer.to : transfer.from;
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));
  const formattedDate = format(new Date(transfer.timestamp), "d MMM. yyyy");

  return (
    <TableRow hover data-cy="erc20-transfer-row">
      <TableCell data-cy="sender-receiver-address">
        <Stack
          direction="row"
          sx={{ alignItems: "center", gap: 1.5, minWidth: 0 }}
        >
          {isOutgoing ? (
            <ArrowForwardIcon data-cy="transfer-outgoing-icon" />
          ) : (
            <ArrowBackIcon data-cy="transfer-incoming-icon" />
          )}
          <AddressAvatar
            address={counterparty}
            AvatarProps={{
              sx: { width: 24, height: 24, borderRadius: "5px" },
            }}
            BlockiesProps={{ size: 8, scale: 3 }}
          />
          <AddressCopyTooltip address={counterparty}>
            <Typography variant="h7" noWrap>
              <AddressName address={counterparty} />
            </Typography>
          </AddressCopyTooltip>
        </Stack>
      </TableCell>
      <TableCell data-cy="transfer-amount" align="right">
        <ListItemText
          primary={
            <Amount
              wei={transfer.rawValue}
              decimals={transfer.decimals ?? tokenDecimals}
            />
          }
          secondary={isBelowMd ? formattedDate : undefined}
          slotProps={{
            primary: { variant: "h7mono" },
            secondary: {
              variant: "body2mono",
              color: "text.secondary",
            },
          }}
        />
      </TableCell>
      {!isBelowMd ? (
        <TableCell data-cy="transfer-date">{formattedDate}</TableCell>
      ) : null}
    </TableRow>
  );
};

export default ERC20TransferRow;
