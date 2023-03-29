import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import { Button, Paper } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import {
  DataGrid,
  GridColDef,
  GridValueGetterParams,
  useGridApiContext,
} from "@mui/x-data-grid";
import { skipToken } from "@reduxjs/toolkit/dist/query";
import { format, fromUnixTime, getUnixTime } from "date-fns";
import Decimal from "decimal.js";
import uniq from "lodash/fp/uniq";
import { FC, useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";
import AddressName from "../../components/AddressName/AddressName";
import useAddressNames from "../../hooks/useAddressNames";
import { currenciesByCode } from "../../utils/currencyUtils";
import Link from "../common/Link";
import { mainNetworks, tryFindNetwork } from "../network/networks";
import { formatAmount } from "../token/Amount";
import accountingApi, {
  AccountingStreamPeriod,
  UnitOfTimeVirtualizationMap,
  VirtualStreamPeriod,
} from "./accountingApi.slice";
import { ValidAccountingExportForm } from "./AccountingExportFormProvider";

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
  const {
    data: {
      addresses,
      startDate,
      endDate,
      priceGranularity,
      virtualizationPeriod,
      currencyCode,
      counterparties,
    },
  } = getValues();

  const lowerCaseAddresses = useMemo(
    () => addresses.map((addr) => addr.toLowerCase()),
    [addresses]
  );

  const currency = currenciesByCode[currencyCode];

  const streamPeriodsResponse = accountingApi.useStreamPeriodsQuery(
    formState.isValid
      ? {
          addresses,
          chains: mainNetworks.map((x) => x.id),
          start: getUnixTime(startDate),
          end: getUnixTime(endDate),
          priceGranularity: UnitOfTimeVirtualizationMap[priceGranularity],
          virtualization: UnitOfTimeVirtualizationMap[virtualizationPeriod],
          currency: currencyCode,
          ...(counterparties.length > 0 ? { counterparties } : {}),
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
            streamPeriod.sender,
            streamPeriod.receiver,
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
        valueGetter: (params: GridValueGetterParams) =>
          format(fromUnixTime(params.row.endTime), "yyyy/MM/dd"),
      },
      {
        field: "startDate",
        headerName: "Start Date",
        type: "date",
        minWidth: 120,
        hide: true,
        valueGetter: (params: GridValueGetterParams) =>
          format(fromUnixTime(params.row.startTime), "yyyy/MM/dd"),
      },
      {
        field: "amount",
        headerName: "Amount",
        minWidth: 100,
        flex: 1,
        sortComparator: (v1, v2) => (Number(v1) > Number(v2) ? 1 : -1),
        valueGetter: (params: GridValueGetterParams) =>
          new Decimal(params.row.amountFiat).toFixed(2),
        renderCell: (params) => {
          const sign = Decimal.sign(params.value);
          const absDecimal = Decimal.abs(params.value);

          return `${sign < 0 ? "-" : ""}${currency.format(absDecimal)}`;
        },
      },
      {
        field: "counterparty",
        headerName: "Counterparty",
        minWidth: 120,
        flex: 1,
        valueGetter: (params: GridValueGetterParams) => {
          const isOutgoing = lowerCaseAddresses.includes(
            params.row.sender.toLowerCase()
          );

          const counterparty = isOutgoing
            ? params.row.receiver
            : params.row.sender;

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
          const isOutgoing = lowerCaseAddresses.includes(
            params.row.sender.toLowerCase()
          );
          return isOutgoing ? params.row.receiver : params.row.sender;
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
        valueGetter: (params) =>
          tryFindNetwork(mainNetworks, params.row.chainId)?.name,
      },
      {
        field: "transaction",
        headerName: "TX",
        maxWidth: 100,
        flex: 1,
        valueGetter: (params: GridValueGetterParams) => {
          const network = tryFindNetwork(mainNetworks, params.row.chainId);
          if (!network) return "";
          return network.getLinkForTransaction(params.row.startedAtEvent);
        },
        renderCell: (params) => {
          const network = tryFindNetwork(mainNetworks, params.row.chainId);
          if (!network) return "";
          const linkUrl = network.getLinkForTransaction(
            params.row.startedAtEvent
          );
          return (
            <Link href={linkUrl} target="_blank">
              <IconButton component="a">
                <OpenInNewRoundedIcon />
              </IconButton>
            </Link>
          );
        },
      },
      {
        field: "sender",
        headerName: "Sender",
        minWidth: 90,
        flex: 1,
        hide: true,
        renderCell: (params) => {
          return <AddressName address={params.row.sender} />;
        },
      },
      {
        field: "receiver",
        headerName: "Receiver",
        minWidth: 90,
        flex: 1,
        hide: true,
        renderCell: (params) => {
          return <AddressName address={params.row.receiver} />;
        },
      },
      {
        field: "transactionHash",
        headerName: "Tx Hash",
        flex: 1,
        minWidth: 90,
        hide: true,
        valueGetter: (params) => params.row.startedAtEvent,
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
        valueGetter: (params) => formatAmount(params.row.amount),
      },
    ],
    [currency, mappedAddresses, lowerCaseAddresses]
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
