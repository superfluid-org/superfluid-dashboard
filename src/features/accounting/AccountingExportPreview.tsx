import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import { Button, Paper } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import {
  DataGrid,
  GridColDef,
  useGridApiContext,
} from "@mui/x-data-grid";
import { skipToken } from "@reduxjs/toolkit/query";
import { fromUnixTime, getUnixTime } from "date-fns";
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
import { findTokenFromTokenList } from "../../hooks/useTokenQuery";

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

interface AccountingExportPreviewProps { }

const mapVirtualizationPeriods = (
  streamPeriod: AccountingStreamPeriod
): MappedVirtualStreamPeriod[] => {
  const { virtualPeriods, ...streamPeriodData } = streamPeriod;

  return virtualPeriods
    .map((virtualPeriod) => ({
      ...streamPeriodData,
      ...virtualPeriod,
      id: `${streamPeriodData.id}-${virtualPeriod.startTime}`,
    }));
};

const AccountingExportPreview: FC<AccountingExportPreviewProps> = ({ }) => {
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

  const virtualStreamPeriods = useMemo(
    () =>
      (streamPeriodsResponse.data || []).reduce(
        (
          allPeriods: MappedVirtualStreamPeriod[],
          period: AccountingStreamPeriod
        ) => [...allPeriods, ...mapVirtualizationPeriods(period)],
        []
      ).map(x => {
        const tokenFromTokenList = findTokenFromTokenList({
          chainId: x.chainId,
          address: x.token.id
        });

        return {
          ...x,
          token: {
            ...x.token,
            symbol: tokenFromTokenList?.symbol || x.token.symbol,
            name: tokenFromTokenList?.name || x.token.name
          }
        }
      }),
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
        valueGetter: (value, row) =>
          fromUnixTime(row.endTime),
      },
      {
        field: "startDate",
        headerName: "Start Date",
        type: "date",
        minWidth: 120,
        hide: true,
        valueGetter: (value, row) =>
          fromUnixTime(row.startTime)
      },
      {
        field: "amount",
        headerName: "Amount",
        minWidth: 100,
        flex: 1,
        sortComparator: (v1, v2) => (Number(v1) > Number(v2) ? 1 : -1),
        valueGetter: (value, row) =>
          new Decimal(row.amountFiat).toFixed(2),
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
        valueGetter: (value, row) => {
          const isOutgoing = lowerCaseAddresses.includes(
            row.sender.toLowerCase()
          );

          const counterparty = isOutgoing
            ? row.receiver
            : row.sender;

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
        valueGetter: (value, row) => {
          const isOutgoing = lowerCaseAddresses.includes(
            row.sender.toLowerCase()
          );
          return isOutgoing ? row.receiver : row.sender;
        },
      },
      {
        field: "tokenSymbol",
        headerName: "Token Symbol",
        minWidth: 110,
        flex: 1,
        valueGetter: (value, row) =>
          `${row.token.symbol}`,
      },
      {
        field: "network",
        headerName: "Network",
        minWidth: 100,
        flex: 1,
        valueGetter: (value, row) =>
          tryFindNetwork(mainNetworks, row.chainId)?.name,
      },
      {
        field: "transaction",
        headerName: "TX",
        maxWidth: 100,
        flex: 1,
        valueGetter: (value, row) => {
          const network = tryFindNetwork(mainNetworks, row.chainId);
          if (!network) return "";
          return network.getLinkForTransaction(row.startedAtEvent);
        },
        renderCell: (params) => {
          const network = tryFindNetwork(mainNetworks, params.row.chainId);
          if (!network) return "";
          const linkUrl = network.getLinkForTransaction(
            params.row.startedAtEvent
          );
          return (
            <IconButton LinkComponent={Link} href={linkUrl} target="_blank">
              <OpenInNewRoundedIcon />
            </IconButton>
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
        valueGetter: (value, row) => row.startedAtEvent,
      },
      {
        field: "tokenAddress",
        headerName: "Token",
        flex: 1,
        minWidth: 100,
        hide: true,
        valueGetter: (value, row) => row.token.id,
      },
      {
        field: "tokenName",
        headerName: "Token Name",
        minWidth: 120,
        flex: 1,
        hide: true,
        valueGetter: (value, row) => row.token.name,
      },
      {
        field: "underlyingTokenAddress",
        headerName: "Underlying token",
        minWidth: 140,
        flex: 1,
        hide: true,
        valueGetter: (value, row) => row.token.underlyingAddress,
      },
      {
        field: "tokensAmount",
        headerName: "Token amount",
        minWidth: 120,
        flex: 1,
        hide: true,
        valueGetter: (value, row) => formatAmount(row.amount, 18, undefined, true /* disable rounding */),
      }
    ],
    [currency, mappedAddresses, lowerCaseAddresses]
  );

  const [paginationModel, setPaginationModel] = useState({
    pageSize: 10,
    page: 0,
  });

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
        disableRowSelectionOnClick
        rows={virtualStreamPeriods}
        columns={columns}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        loading={
          streamPeriodsResponse.isLoading || streamPeriodsResponse.isFetching
        }
        pageSizeOptions={[10, 25, 50]}
        slots={{
          toolbar: CustomToolbar,
        }}
      />
    </Paper>
  );
};

export default AccountingExportPreview;
