import { ListItemText, Table, TableCell } from "@mui/material";
import TableBody from "@mui/material/TableBody";
import { BigNumber } from "ethers";
import { FC, memo } from "react";
import { flowOperatorPermissionsToString } from "../../../utils/flowOperatorPermissionsToString";
import Amount from "../../token/Amount";

interface VestingSchedulerAllowanceDetailsTableProps {
  tokenSymbol: string;
  tokenAllowance: string;
  flowOperatorAllowance: string;
  recommendedTokenAllowance: BigNumber;
  requiredFlowOperatorAllowance: BigNumber;
  existingPermissions: number;
  requiredFlowOperatorPermissions: number; // 5 (Create or Delete) https://docs.superfluid.finance/superfluid/developers/constant-flow-agreement-cfa/cfa-access-control-list-acl/acl-features
}

const VestingSchedulerAllowanceDetailsTable: FC<
  VestingSchedulerAllowanceDetailsTableProps
> = ({
  tokenSymbol,
  tokenAllowance,
  flowOperatorAllowance,
  recommendedTokenAllowance,
  requiredFlowOperatorAllowance,
  existingPermissions,
  requiredFlowOperatorPermissions,
}) => {
  const permissionsString =
    flowOperatorPermissionsToString(existingPermissions);
  const requiredPermissionsString = flowOperatorPermissionsToString(
    requiredFlowOperatorPermissions
  );

  return (
    <Table sx={{ width: "100%" }}>
      <TableBody>
        <TableCell></TableCell>
        <TableCell width="220px">
          <ListItemText
            primary="Current"
            secondary={
              <>
                <Amount wei={tokenAllowance} /> {tokenSymbol}
              </>
            }
          />
          <ListItemText
            primary="Required"
            secondary={
              <>
                <Amount wei={recommendedTokenAllowance} /> {tokenSymbol}
              </>
            }
          />
        </TableCell>
        <TableCell width="260px">
          <ListItemText primary="Current" secondary={permissionsString} />
          <ListItemText
            primary="Required"
            secondary={requiredPermissionsString}
          />
        </TableCell>
        <TableCell width="350px">
          <ListItemText
            primary="Current"
            secondary={
              <>
                <Amount wei={flowOperatorAllowance} /> {tokenSymbol}
                /sec
              </>
            }
          />
          <ListItemText
            primary="Required"
            secondary={
              <>
                <Amount wei={requiredFlowOperatorAllowance} /> {tokenSymbol}/sec
              </>
            }
          />
        </TableCell>
      </TableBody>
    </Table>
  );
};

export default memo(VestingSchedulerAllowanceDetailsTable);
