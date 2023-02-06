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
            data-cy={`${tokenSymbol}-current-allowance`}
            primary="Current"
            secondary={
              <>
                <Amount wei={tokenAllowance} /> {tokenSymbol}
              </>
            }
          />
          <ListItemText
            data-cy={`${tokenSymbol}-recommended-allowance`}
            primary="Required"
            secondary={
              <>
                <Amount wei={recommendedTokenAllowance} /> {tokenSymbol}
              </>
            }
          />
        </TableCell>
        <TableCell width="260px">
          <ListItemText
              primary="Current"
              data-cy={`${tokenSymbol}-current-permissions`}
              secondary={permissionsString}
          />
          <ListItemText
            data-cy={`${tokenSymbol}-recommended-permissions`}
            primary="Required"
            secondary={requiredPermissionsString}
          />
        </TableCell>
        <TableCell width="350px">
          <ListItemText
            data-cy={`${tokenSymbol}-current-flow-allowance`}
            primary="Current"
            secondary={
              <>
                <Amount wei={flowOperatorAllowance} /> {tokenSymbol}
                /sec
              </>
            }
          />
          <ListItemText
            data-cy={`${tokenSymbol}-recommended-flow-allowance`}
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
