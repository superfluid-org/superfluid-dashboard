import { Box, Container, useTheme } from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridCsvExportMenuItem,
  GridRenderCellParams,
  GridToolbarContainer,
  GridToolbarExport,
  GridToolbarExportContainer,
  GridValueGetterParams,
} from "@mui/x-data-grid";
import { format, fromUnixTime } from "date-fns";
import { formatEther } from "ethers/lib/utils";
import { NextPage } from "next";
import { useMemo } from "react";
import AddressName from "../components/AddressName/AddressName";
import accountingApi, {
  AccountingStreamPeriod,
  VirtualStreamPeriod,
} from "../features/accounting/accountingApi.slice";
import AccountingExportForm from "../features/accounting/AccountingExportForm";
import AccountingExportFormProvider, {
  ValidAccountingExportForm,
} from "../features/accounting/AccountingExportFormProvider";
import { mainNetworkIDs } from "../features/network/networks";
import Amount from "../features/token/Amount";
import { useVisibleAddress } from "../features/wallet/VisibleAddressContext";

const columns: GridColDef[] = [
  {
    field: "startDate",
    headerName: "Start Date",
    type: "date",
    width: 120,
    valueGetter: (params: GridValueGetterParams) => {
      return fromUnixTime(params.row.startTime);
    },
  },
  {
    field: "endDate",
    headerName: "End Date",
    type: "date",
    width: 120,
    valueGetter: (params: GridValueGetterParams) => {
      return fromUnixTime(params.row.endTime);
    },
  },
  {
    field: "amount",
    headerName: "Amount",
    width: 120,
    renderCell: (params) => <Amount wei={params.row.amount} />,
  },
  {
    field: "counterparty",
    headerName: "Counterparty",
    width: 150,
    renderCell: (params) => <AddressName address={params.row.receiver.id} />,
  },
  {
    field: "transaction",
    headerName: "Transaction URL",
    width: 90,
    renderCell: (params) => {
      return params.row.startedAtEvent.transactionHash;
    },
  },
  {
    field: "tokenSymbol",
    headerName: "Token Symbol",
    width: 90,
    valueGetter: (params: GridValueGetterParams) =>
      `${params.row.token.symbol}`,
  },
  {
    field: "network",
    headerName: "Network",
    width: 90,
    renderCell: (params) => {
      return "";
    },
  },
  {
    field: "sender",
    headerName: "Sender",
    width: 90,
    renderCell: (params) => {
      return <AddressName address={params.row.sender.id} />;
    },
  },
  {
    field: "receiver",
    headerName: "Receiver",
    width: 90,
    renderCell: (params) => {
      return <AddressName address={params.row.receiver.id} />;
    },
  },
  {
    field: "transactionHash",
    headerName: "Tx Hash",
    width: 90,
    valueGetter: (params) => params.row.startedAtEvent.transactionHash,
  },
  {
    field: "tokenAddress",
    headerName: "Token",
    width: 90,
    valueGetter: (params) => params.row.token.id,
  },
  {
    field: "tokenName",
    headerName: "Token Name",
    width: 90,
    valueGetter: (params) => params.row.token.name,
  },
  {
    field: "underlyingTokenAddress",
    headerName: "Underlying token",
    width: 90,
    valueGetter: (params) => params.row.token.underlyingAddress,
  },
  {
    field: "tokensAmount",
    headerName: "Token amount",
    width: 90,
    renderCell: (params) => <Amount wei={params.row.amount} />,
  },
];

const CustomToolbar = () => (
  <GridCsvExportMenuItem options={{ fileName: "asd" }} />
);

type MappedVirtualStreamPeriod = VirtualStreamPeriod &
  Omit<AccountingStreamPeriod, "virtualPeriods">;

const Accounting: NextPage = () => {
  const theme = useTheme();
  const { visibleAddress } = useVisibleAddress();

  const [streamPeriodsTrigger, streamPeriodsResponse] =
    accountingApi.useLazyStreamPeriodsQuery({});

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

  const virtualStreamPeriods = useMemo(
    () =>
      (streamPeriodsResponse.data || []).reduce(
        (
          allPeriods: MappedVirtualStreamPeriod[],
          period: AccountingStreamPeriod
        ) => [...allPeriods, ...mapVirtualizationPeriods(period)],
        []
      ),
    [streamPeriodsResponse.data]
  );

  const onSubmitForm = (data: ValidAccountingExportForm["data"]) => {
    if (visibleAddress) {
      streamPeriodsTrigger({
        address: visibleAddress,
        chains: mainNetworkIDs,
        start: data.startTimestamp,
        end: data.endTimestamp,
        priceGranularity: data.priceGranularity,
        virtualization: data.virtualizationPeriod,
        currency: data.currencyCode,
        receivers: data.receiverAddresses,
      });
    }
  };

  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          [theme.breakpoints.up("md")]: {
            my: 4,
          },
        }}
      >
        <AccountingExportFormProvider initialFormValues={{}}>
          <AccountingExportForm onSubmit={onSubmitForm} />
        </AccountingExportFormProvider>
      </Box>

      <DataGrid
        autoHeight
        rows={virtualStreamPeriods}
        columns={columns}
        pageSize={10}
        rowsPerPageOptions={[10, 25, 50]}
        components={{ Toolbar: CustomToolbar }}
      />
    </Container>
  );
};

export default Accounting;
