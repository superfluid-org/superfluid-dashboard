import { Box, Card, FormLabel, Stack, useTheme } from "@mui/material";
import { DataGrid, GridColDef, GridValueGetterParams } from "@mui/x-data-grid";
import { skipToken } from "@reduxjs/toolkit/dist/query";
import { fromUnixTime, getUnixTime, sub } from "date-fns";
import { formatEther } from "ethers/lib/utils";
import { NextPage } from "next";
import { useMemo } from "react";
import AddressName from "../components/AddressName/AddressName";
import accountingApi, {
  AccountingStreamPeriod,
  VirtualStreamPeriod,
} from "../features/accounting/accountingApi.slice";
import AccountingExportForm from "../features/accounting/AccountingExportForm";
import AccountingExportFormProvider from "../features/accounting/AccountingExportFormProvider";
import TooltipIcon from "../features/common/TooltipIcon";
import { useExpectedNetwork } from "../features/network/ExpectedNetworkContext";
import { mainNetworkIDs } from "../features/network/networks";
import { useVisibleAddress } from "../features/wallet/VisibleAddressContext";

const columns: GridColDef[] = [
  {
    field: "date",
    headerName: "Date",
    type: "date",
    width: 130,
    valueGetter: (params: GridValueGetterParams) => {
      return fromUnixTime(params.row.startTime);
    },
  },
  {
    field: "amount",
    headerName: "Amount",
    width: 200,
    valueGetter: (params: GridValueGetterParams) =>
      `${formatEther(params.row.amount)}`,
  },
  {
    field: "payee",
    headerName: "Payee",
    width: 130,
    renderCell: (params) => <AddressName address={params.row.receiver.id} />,
  },
  {
    field: "transaction",
    headerName: "Transaction URL",
    width: 90,
    valueGetter: (params: GridValueGetterParams) =>
      `${params.row.firstName || ""} ${params.row.lastName || ""}`,
  },
  {
    field: "tokenSymbol",
    headerName: "Token Symbol",
    width: 90,
    valueGetter: (params: GridValueGetterParams) =>
      `${params.row.token.symbol}`,
  },
];

type MappedVirtualStreamPeriod = VirtualStreamPeriod &
  Omit<AccountingStreamPeriod, "virtualPeriods">;

const Accounting: NextPage = () => {
  const theme = useTheme();
  const { visibleAddress } = useVisibleAddress();

  const streamPeriodsRequest = accountingApi.useStreamPeriodsQuery(
    visibleAddress
      ? {
          address: visibleAddress,
          chains: mainNetworkIDs,
          start: getUnixTime(
            sub(new Date(), {
              months: 2,
            })
          ),
          end: getUnixTime(new Date()),
        }
      : skipToken
  );

  const mapVirtualizationPeriods = (
    streamPeriod: AccountingStreamPeriod
  ): MappedVirtualStreamPeriod[] => {
    const { virtualPeriods, ...streamPeriodData } = streamPeriod;

    return virtualPeriods.map((virtualPeriod) => ({
      ...streamPeriodData,
      ...virtualPeriod,
      id: `${streamPeriodData.id}-${virtualPeriod.startTime}`,
    }));
  };

  const virtualStreamPeriods = useMemo(() => {
    const streamPeriods = streamPeriodsRequest.data || [];

    return streamPeriods.reduce(
      (
        allPeriods: MappedVirtualStreamPeriod[],
        period: AccountingStreamPeriod
      ) => [...allPeriods, ...mapVirtualizationPeriods(period)],
      []
    );
  }, [streamPeriodsRequest.data]);

  return (
    <Stack gap={4}>
      <AccountingExportFormProvider initialFormValues={{}}>
        <AccountingExportForm />
      </AccountingExportFormProvider>
      <DataGrid
        autoHeight
        rows={virtualStreamPeriods}
        columns={columns}
        pageSize={10}
        rowsPerPageOptions={[10, 25, 50]}
        checkboxSelection
      />
    </Stack>
  );
};

export default Accounting;
