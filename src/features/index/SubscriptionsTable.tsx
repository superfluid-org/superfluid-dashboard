import {
  Button,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
} from "@mui/material";
import { Address } from "@superfluid-finance/sdk-core";
import { FC, useMemo, useState } from "react";
import { EmptyRow } from "../common/EmptyRow";
import { Network } from "../network/networks";
import { subgraphApi } from "../redux/store";
import { useVisibleAddress } from "../wallet/VisibleAddressContext";
import SubscriptionRow, { SubscriptionLoadingRow } from "./SubscriptionRow";

interface SubscriptionsTableProps {
  tokenAddress: Address;
  network: Network;
}

const SubscriptionsTable: FC<SubscriptionsTableProps> = ({
  tokenAddress,
  network,
}) => {
  const { visibleAddress = "" } = useVisibleAddress();

  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [page, setPage] = useState(0);
  const [approvedFilter, setApprovedFilter] = useState<boolean | null>(null);

  const subscriptionsQuery = subgraphApi.useIndexSubscriptionsQuery({
    chainId: network.id,
    filter: {
      subscriber: visibleAddress.toLowerCase(), //"0x808B74C4f37F664010F1182de87bD5b65772788e".toLowerCase(),
    },
    pagination: {
      take: Infinity,
      skip: 0,
    },
    order: {
      orderBy: "updatedAtTimestamp",
      orderDirection: "desc",
    },
  });

  const tokenSubscriptions = useMemo(
    () =>
      (subscriptionsQuery.data?.items || []).filter((subscription) =>
        approvedFilter === null
          ? true
          : subscription.approved === approvedFilter
      ), //   .filter((subscription) => subscription.token === tokenAddress);

    [subscriptionsQuery.data, approvedFilter, tokenAddress]
  );

  const { approvedCount, unapprovedCount } = useMemo(() => {
    const subscriptions = subscriptionsQuery.data?.items || [];
    return {
      approvedCount: subscriptions.filter((s) => s.approved).length,
      unapprovedCount: subscriptions.filter((s) => !s.approved).length,
    };
  }, [subscriptionsQuery.data]);

  const handleChangePage = (_e: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const changeApprovedFilter = (approved: boolean | null) => () =>
    setApprovedFilter(approved);

  const getFilterBtnColor = (approved: boolean | null) =>
    approvedFilter === approved ? "primary" : "secondary";

  const isLoading =
    (tokenSubscriptions.length === 0 && subscriptionsQuery.isLoading) ||
    subscriptionsQuery.isFetching;

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell colSpan={5}>
              <Stack direction="row" alignItems="center" gap={1}>
                <Button
                  variant="textContained"
                  color={getFilterBtnColor(null)}
                  onClick={changeApprovedFilter(null)}
                >
                  All {!isLoading && ` (${approvedCount + unapprovedCount})`}
                </Button>
                <Button
                  variant="textContained"
                  color={getFilterBtnColor(true)}
                  onClick={changeApprovedFilter(true)}
                >
                  Approved {!isLoading && ` (${approvedCount})`}
                </Button>
                <Button
                  variant="textContained"
                  color={getFilterBtnColor(false)}
                  onClick={changeApprovedFilter(false)}
                >
                  Unapproved {!isLoading && ` (${unapprovedCount})`}
                </Button>

                <Stack flex={1} direction="row" justifyContent="flex-end">
                  {/* <Button
                      variant="contained"
                      color={selectActive ? "error" : "secondary"}
                      onClick={toggleSelectActive}
                    >
                      {`${selectActive ? "Cancel" : "Select"} Multiple`}
                    </Button> */}
                </Stack>
              </Stack>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>From</TableCell>
            <TableCell>Total Amount Received</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Updated At</TableCell>
            <TableCell width="100"></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <SubscriptionLoadingRow />
          ) : tokenSubscriptions.length === 0 ? (
            <EmptyRow span={5} />
          ) : (
            tokenSubscriptions.map((subscription) => (
              <SubscriptionRow
                key={subscription.id}
                subscription={subscription}
              />
            ))
          )}
        </TableBody>
      </Table>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={tokenSubscriptions.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        sx={{
          "> *": {
            visibility: tokenSubscriptions.length <= 5 ? "hidden" : "visible",
          },
        }}
      />
    </TableContainer>
  );
};

export default SubscriptionsTable;
