import {
  DataGrid,
  GridColDef,
  GridCsvExportMenuItem,
  GridValueGetterParams,
} from "@mui/x-data-grid";
import { skipToken } from "@reduxjs/toolkit/dist/query";
import { format, fromUnixTime } from "date-fns";
import Decimal from "decimal.js";
import { FC, useMemo } from "react";
import { useFormContext } from "react-hook-form";
import AddressName from "../../components/AddressName/AddressName";
import { currenciesByCode } from "../../utils/currencyUtils";
import {
  findNetworkByChainId,
  mainNetworkIDs,
  networkDefinition,
} from "../network/networks";
import Amount, { formatAmount } from "../token/Amount";
import { useVisibleAddress } from "../wallet/VisibleAddressContext";
import accountingApi, {
  AccountingStreamPeriod,
  VirtualStreamPeriod,
} from "./accountingApi.slice";
import { ValidAccountingExportForm } from "./AccountingExportFormProvider";

const CustomToolbar = () => (
  <GridCsvExportMenuItem options={{ fileName: "asd" }} />
);

type MappedVirtualStreamPeriod = VirtualStreamPeriod &
  Omit<AccountingStreamPeriod, "virtualPeriods">;

interface AccountingExportPreviewProps {}

const AccountingExportPreview: FC<AccountingExportPreviewProps> = ({}) => {
  const { formState, getValues } = useFormContext<ValidAccountingExportForm>();
  const { visibleAddress } = useVisibleAddress();
  const {
    data: {
      startTimestamp,
      endTimestamp,
      priceGranularity,
      virtualizationPeriod,
      currencyCode,
      receiverAddresses,
    },
  } = getValues();

  const currency = currenciesByCode[currencyCode];

  const streamPeriodsResponse = accountingApi.useStreamPeriodsQuery(
    visibleAddress && formState.isValid
      ? {
          address: visibleAddress,
          chains: mainNetworkIDs,
          start: startTimestamp,
          end: endTimestamp,
          priceGranularity: priceGranularity,
          virtualization: virtualizationPeriod,
          currency: currencyCode,
          receivers: receiverAddresses,
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

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: "startDate",
        headerName: "Start Date",
        type: "date",
        width: 120,
        valueGetter: (params: GridValueGetterParams) => {
          return format(fromUnixTime(params.row.startTime), "yyyy/MM/dd");
        },
      },
      {
        field: "endDate",
        headerName: "End Date",
        type: "date",
        width: 120,
        valueGetter: (params: GridValueGetterParams) => {
          return format(fromUnixTime(params.row.endTime), "yyyy/MM/dd");
        },
      },
      {
        field: "amount",
        headerName: "Amount",
        width: 120,
        valueGetter: (params: GridValueGetterParams) => {
          return currency.format(new Decimal(params.row.amountFiat).toFixed(2));
        },
      },
      {
        field: "counterparty",
        headerName: "Counterparty",
        width: 150,
        renderCell: (params) => (
          <AddressName address={params.row.receiver.id} />
        ),
      },
      {
        field: "transaction",
        headerName: "Transaction URL",
        width: 90,
        renderCell: (params) => {
          const network = findNetworkByChainId(params.row.chainId);
          if (!network) return "";
          return network.getLinkForTransaction(
            params.row.startedAtEvent.transactionHash
          );
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
        renderCell: (params) => findNetworkByChainId(params.row.chainId)?.name,
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
        renderCell: (params) =>
          `${formatAmount(params.row.amount)} ${params.row.token.symbol}`,
      },
    ],
    [currency]
  );
  return (
    <DataGrid
      autoHeight
      rows={virtualStreamPeriods}
      columns={columns}
      pageSize={10}
      loading={
        streamPeriodsResponse.isLoading || streamPeriodsResponse.isFetching
      }
      rowsPerPageOptions={[10, 25, 50]}
      components={{ Toolbar: CustomToolbar }}
    />
  );
};

export default AccountingExportPreview;
