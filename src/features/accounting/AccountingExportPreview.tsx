import {
  DataGrid,
  GridColDef,
  GridCsvExportMenuItem,
  GridValueGetterParams,
  useGridApiContext,
} from "@mui/x-data-grid";
import { skipToken } from "@reduxjs/toolkit/dist/query";
import { format, fromUnixTime, getUnixTime } from "date-fns";
import Decimal from "decimal.js";
import { FC, useMemo, useState } from "react";
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
import uniq from "lodash/fp/uniq";
import useAddressNames from "../../hooks/useAddressNames";
import { Button, Paper, TablePagination } from "@mui/material";
import Link from "../common/Link";

const CustomToolbar = () => {
  const gridApiContext = useGridApiContext();

  const handleClick = () => {
    // This is a workaround to trigger DataGrid functionality from outside
    if (gridApiContext.current) {
      gridApiContext.current.exportDataAsCsv({
        fileName: "Stream periods export",
      });
    }
  };

  // Invisible button which will be triggered from outside of DataGrid
  return (
    <Button
      id="export-btn"
      sx={{ visibility: "hidden", display: "none" }}
      onClick={handleClick}
    />
  );
};

type MappedVirtualStreamPeriod = VirtualStreamPeriod &
  Omit<AccountingStreamPeriod, "virtualPeriods">;

interface AccountingExportPreviewProps {}

const AccountingExportPreview: FC<AccountingExportPreviewProps> = ({}) => {
  const { formState, getValues } = useFormContext<ValidAccountingExportForm>();
  const { visibleAddress } = useVisibleAddress();
  const {
    data: {
      startDate,
      endDate,
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
          start: getUnixTime(startDate),
          end: getUnixTime(endDate),
          priceGranularity: priceGranularity,
          virtualization: virtualizationPeriod,
          currency: currencyCode,
          ...(receiverAddresses.length > 0
            ? { receivers: receiverAddresses }
            : {}),
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

  const uniqueAddresses = useMemo(
    () =>
      uniq(
        (streamPeriodsResponse.data || []).reduce(
          (allAddresses, streamPeriod) => [
            ...allAddresses,
            streamPeriod.sender.id,
            streamPeriod.receiver.id,
          ],
          [] as string[]
        )
      ),
    [streamPeriodsResponse.data]
  );

  const mappedAddresses = useAddressNames(uniqueAddresses);

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: "date",
        headerName: "Date",
        type: "date",
        minWidth: 120,
        flex: 1,
        valueGetter: (params: GridValueGetterParams) => {
          return format(fromUnixTime(params.row.endTime), "yyyy/MM/dd");
        },
      },
      {
        field: "amount",
        headerName: "Amount",
        minWidth: 100,
        flex: 1,
        valueGetter: (params: GridValueGetterParams) =>
          currency.format(new Decimal(params.row.amountFiat).toFixed(2)),
      },
      {
        field: "counterparty",
        headerName: "Counterparty",
        minWidth: 120,
        flex: 1,
        valueGetter: (params: GridValueGetterParams) => {
          const isOutgoing =
            params.row.sender.id.toLowerCase() ===
            visibleAddress?.toLowerCase();

          const counterparty = isOutgoing
            ? params.row.receiver.id
            : params.row.sender.id;

          const nameData = mappedAddresses[counterparty];

          return nameData.name || nameData.addressChecksummed;
        },
      },
      {
        field: "counterpartyAddress",
        headerName: "Counterparty Address",
        flex: 1,
        minWidth: 200,
        hide: true,
        valueGetter: (params: GridValueGetterParams) => {
          const isOutgoing =
            params.row.sender.id.toLowerCase() ===
            visibleAddress?.toLowerCase();

          return isOutgoing ? params.row.receiver.id : params.row.sender.id;
        },
      },
      {
        field: "transaction",
        headerName: "Transaction URL",
        minWidth: 150,
        flex: 1,
        valueGetter: (params: GridValueGetterParams) => {
          const network = findNetworkByChainId(params.row.chainId);
          if (!network) return "";
          return network.getLinkForTransaction(
            params.row.startedAtEvent.transactionHash
          );
        },
        renderCell: (params: GridValueGetterParams) => {
          const network = findNetworkByChainId(params.row.chainId);
          if (!network) return "";
          const linkUrl = network.getLinkForTransaction(
            params.row.startedAtEvent.transactionHash
          );
          return (
            <Link href={linkUrl} target="_blank">
              {linkUrl}
            </Link>
          );
        },
      },
      {
        field: "tokenSymbol",
        headerName: "Token Symbol",
        minWidth: 110,
        flex: 1,
        valueGetter: (params: GridValueGetterParams) =>
          `${params.row.token.symbol}`,
      },
      {
        field: "network",
        headerName: "Network",
        minWidth: 100,
        flex: 1,
        valueGetter: (params) => findNetworkByChainId(params.row.chainId)?.name,
      },
      {
        field: "sender",
        headerName: "Sender",
        minWidth: 90,
        flex: 1,
        hide: true,
        renderCell: (params) => {
          return <AddressName address={params.row.sender.id} />;
        },
      },
      {
        field: "receiver",
        headerName: "Receiver",
        minWidth: 90,
        flex: 1,
        hide: true,
        renderCell: (params) => {
          return <AddressName address={params.row.receiver.id} />;
        },
      },
      {
        field: "transactionHash",
        headerName: "Tx Hash",
        flex: 1,
        minWidth: 90,
        hide: true,
        valueGetter: (params) => params.row.startedAtEvent.transactionHash,
      },
      {
        field: "tokenAddress",
        headerName: "Token",
        flex: 1,
        minWidth: 100,
        hide: true,
        valueGetter: (params) => params.row.token.id,
      },
      {
        field: "tokenName",
        headerName: "Token Name",
        minWidth: 120,
        flex: 1,
        hide: true,
        valueGetter: (params) => params.row.token.name,
      },
      {
        field: "underlyingTokenAddress",
        headerName: "Underlying token",
        minWidth: 140,
        flex: 1,
        hide: true,
        valueGetter: (params) => params.row.token.underlyingAddress,
      },
      {
        field: "tokensAmount",
        headerName: "Token amount",
        minWidth: 120,
        flex: 1,
        hide: true,
        valueGetter: (params) =>
          `${formatAmount(params.row.amount)} ${params.row.token.symbol}`,
      },
    ],
    [currency, mappedAddresses, visibleAddress]
  );

  const [pageSize, setPageSize] = useState(10);

  const onPageSizeChange = (newPageSize: number) => setPageSize(newPageSize);

  return (
    <Paper elevation={1}>
      <DataGrid
        sx={{
          borderRadius: "20px",
          ".MuiTablePagination-root": {
            background: "transparent",
            border: "none",
          },
        }}
        autoHeight
        initialState={{
          sorting: {
            sortModel: [{ field: "date", sort: "asc" }],
          },
        }}
        disableSelectionOnClick
        disableColumnSelector
        rows={virtualStreamPeriods}
        columns={columns}
        pageSize={pageSize}
        loading={
          streamPeriodsResponse.isLoading || streamPeriodsResponse.isFetching
        }
        rowsPerPageOptions={[10, 25, 50]}
        onPageSizeChange={onPageSizeChange}
        components={{
          Toolbar: CustomToolbar,
        }}
      />
    </Paper>
  );
};

export default AccountingExportPreview;
