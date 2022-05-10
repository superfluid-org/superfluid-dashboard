import { FC } from "react";
import { SendStreamRestoration } from "../transactionRestoration/transactionRestorations";
import { Card, List, ListItem, ListItemText, Typography } from "@mui/material";
import { ethers } from "ethers";
import { calculateTotalAmountWei, timeUnitWordMap } from "./FlowRateInput";

export const SendStreamPreview: FC<{ restoration: SendStreamRestoration }> = ({
  restoration,
}) => {
  return (
    <Card>
      <List>
        <ListItem>
          <ListItemText
            primary="Receiver"
            secondary={restoration.receiver.hash}
          />
        </ListItem>
        <ListItem>
          <ListItemText
            primary="Flow rate"
            secondary={
              <>
                <Typography component="span">{`${ethers.utils.formatEther(
                  restoration.flowRate.amountWei
                )}${
                  timeUnitWordMap[restoration.flowRate.unitOfTime]
                }`}</Typography>
                <br />
                <Typography component="span">{`${ethers.utils.formatEther(
                  calculateTotalAmountWei(restoration.flowRate)
                )}${timeUnitWordMap[1]}`}</Typography>
              </>
            }
          />
        </ListItem>
        <ListItem>
          <ListItemText primary="Ends on" secondary={"Never"} />
        </ListItem>
      </List>
    </Card>
  );
};