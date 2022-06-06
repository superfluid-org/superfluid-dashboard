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

  const indexSubscriptionsQuery = subgraphApi.useIndexSubscriptionsQuery({
    chainId: network.id,
    filter: {
      subscriber: visibleAddress.toLowerCase(),
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

  const indexSubscriptions = useMemo(
    () =>
      (indexSubscriptionsQuery.data?.items || []).filter(
        (subscription) => subscription.token === tokenAddress
      ),
    [indexSubscriptionsQuery.data, tokenAddress]
  );

  const filteredIndexSubscriptions = useMemo(
    () =>
      indexSubscriptions.filter((subscription) =>
        approvedFilter === null
          ? true
          : subscription.approved === approvedFilter
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [indexSubscriptions, approvedFilter]
  );

  const { approvedCount, unapprovedCount } = useMemo(() => {
    return {
      approvedCount: indexSubscriptions.filter((s) => s.approved).length,
      unapprovedCount: indexSubscriptions.filter((s) => !s.approved).length,
    };
  }, [indexSubscriptions]);

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
    indexSubscriptions.length === 0 &&
    (indexSubscriptionsQuery.isLoading || indexSubscriptionsQuery.isFetching);

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
                  All {!isLoading && ` (${indexSubscriptions.length})`}
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
            {/* <TableCell width="100"></TableCell> */}
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <SubscriptionLoadingRow />
          ) : filteredIndexSubscriptions.length === 0 ? (
            <EmptyRow span={5} />
          ) : (
            filteredIndexSubscriptions.map((subscription) => (
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
        count={indexSubscriptions.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        sx={{
          "> *": {
            visibility: indexSubscriptions.length <= 5 ? "hidden" : "visible",
          },
        }}
      />
    </TableContainer>
  );
};

export default SubscriptionsTable;
