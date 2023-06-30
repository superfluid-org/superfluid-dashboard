import { FC, memo, useMemo } from "react";
import ResponsiveDialog from "../../common/ResponsiveDialog";
import {
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Stack,
  Typography,
  useTheme,
  useMediaQuery,
  FormGroup,
  FormLabel,
  Button,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddTokenWrapFormProvider, {
  PartialAddTokenWrapForm,
} from "./AddTokenWrapFormProvider";
import { Controller, useFormContext } from "react-hook-form";
import ConnectionBoundary from "../../transactionBoundary/ConnectionBoundary";
import { Network } from "../../network/networks";
import AutoWrapEnableDialogContentSection from "../../vesting/dialogs/AutoWrapEnableDialogContentSection";
import { PlatformWhitelistedStatuses } from "../ScheduledWrapTables";
import SelectNetwork from "../../network/SelectNetwork";
import { useExpectedNetwork } from "../../network/ExpectedNetworkContext";
import { TokenDialogButton } from "../../tokenWrapping/TokenDialogButton";
import { subgraphApi } from "../../redux/store";
import { useNetworkCustomTokens } from "../../customTokens/customTokens.slice";
import { skipToken } from "@reduxjs/toolkit/dist/query";
import { getSuperTokenType } from "../../redux/endpoints/adHocSubgraphEndpoints";

const AutoWrapAddTokenForm: FC<{
  closeEnableAutoWrapDialog: () => void;
  platformWhitelistedStatuses: PlatformWhitelistedStatuses;
}> = ({ closeEnableAutoWrapDialog, platformWhitelistedStatuses }) => {
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));
  const { control, watch, setValue } =
    useFormContext<PartialAddTokenWrapForm>();
  const [network, token] = watch(["data.network", "data.token"]);

  const networkCustomTokens = useNetworkCustomTokens(network?.id!);

  const listedSuperTokensQuery = subgraphApi.useTokensQuery({
    chainId: network?.id!,
    filter: {
      isSuperToken: true,
      isListed: true,
      underlyingAddress_not: "0x0000000000000000000000000000000000000000",
    },
  });

  const customSuperTokensQuery = subgraphApi.useTokensQuery(
    networkCustomTokens.length > 0
      ? {
          chainId: network?.id!,
          filter: {
            isSuperToken: true,
            isListed: false,
            id_in: networkCustomTokens,
            underlyingAddress_not: "0x0000000000000000000000000000000000000000",
          },
        }
      : skipToken
  );

  const superTokens = useMemo(
    () =>
      (listedSuperTokensQuery.data?.items || [])
        .concat(customSuperTokensQuery.data?.items || [])
        .map((x) => ({
          ...x,
          type: getSuperTokenType({ ...x, network: network!, address: x.id }),
          address: x.id,
          name: x.name,
          symbol: x.symbol,
          decimals: 18,
          isListed: x.isListed,
        })),
    [
      network,
      listedSuperTokensQuery.isLoading,
      listedSuperTokensQuery.data,
      customSuperTokensQuery.isLoading,
      customSuperTokensQuery.data,
    ]
  );

  return (
    <>
      <Stack component={DialogTitle} sx={{ p: 3 }}>
        <Typography variant="h4">Add Token</Typography>
        <IconButton
          aria-label="close"
          onClick={closeEnableAutoWrapDialog}
          sx={{
            position: "absolute",
            right: theme.spacing(3),
            top: theme.spacing(3),
          }}
        >
          <CloseIcon />
        </IconButton>
      </Stack>
      <Stack gap={3} component={DialogContent}>
        <Grid
          direction={isBelowMd ? "column" : "row"}
          gap={isBelowMd ? 2 : 0}
          container
          justifyContent={"space-between"}
        >
          <Grid>
            <FormGroup>
              <FormLabel>Network</FormLabel>
              <Controller
                control={control}
                name="data.network"
                render={({ field: { value, onChange, onBlur } }) => (
                  <SelectNetwork
                    isIconButton={false}
                    isCollapsable={false}
                    disabled={false}
                    network={value}
                    placeholder={"Select network"}
                    onChange={(e) => {
                      setValue("data.token", null);
                      onChange(e);
                    }}
                    onBlur={onBlur}
                    predicates={[
                      (network: Network) =>
                        !!platformWhitelistedStatuses[network.id]
                          ?.isWhitelisted,
                    ]}
                    ButtonProps={{
                      disabled: !network,
                      variant: "outlined",
                      color: "secondary",
                      size: "large",
                      sx: {
                        minWidth: "200px",
                        justifyContent: "flex-start",
                        ".MuiButton-startIcon > *:nth-of-type(1)": {
                          fontSize: "16px",
                        },
                        ".MuiButton-endIcon": { marginLeft: "auto" },
                      },
                    }}
                  />
                )}
              />
            </FormGroup>
          </Grid>
          <Grid gap={2}>
            <FormGroup>
              <FormLabel>Token</FormLabel>
              <Controller
                control={control}
                name="data.token"
                render={({ field: { onChange, onBlur } }) => (
                  <TokenDialogButton
                    token={token}
                    network={network!}
                    tokenSelection={{
                      showUpgrade: true,
                      tokenPairsQuery: {
                        data: superTokens,
                        isFetching:
                          listedSuperTokensQuery.isFetching ||
                          customSuperTokensQuery.isFetching,
                      },
                    }}
                    onTokenSelect={onChange}
                    onBlur={onBlur}
                    ButtonProps={{
                      disabled: !network,
                      variant: "outlined",
                      color: "secondary",
                      size: "large",
                      sx: {
                        minWidth: "200px",
                        justifyContent: "flex-start",
                        ".MuiButton-startIcon > *:nth-of-type(1)": {
                          fontSize: "16px",
                        },
                        ".MuiButton-endIcon": { marginLeft: "auto" },
                      },
                    }}
                  />
                )}
              />
            </FormGroup>
          </Grid>
        </Grid>
        {token && network ? (
          <ConnectionBoundary expectedNetwork={network}>
            <AutoWrapEnableDialogContentSection
              closeEnableAutoWrapDialog={closeEnableAutoWrapDialog}
              token={token}
              network={network}
            />
          </ConnectionBoundary>
        ) : (
          <Button
            fullWidth={true}
            data-cy={"enable-auto-wrap-button"}
            variant="contained"
            disabled={true}
            size="large"
          >
            Add
          </Button>
        )}
      </Stack>
    </>
  );
};

const AutoWrapAddTokenDialogSection: FC<{
  closeEnableAutoWrapDialog: () => void;
  isEnableAutoWrapDialogOpen: boolean;
  platformWhitelistedStatuses: PlatformWhitelistedStatuses;
}> = ({
  closeEnableAutoWrapDialog,
  isEnableAutoWrapDialogOpen,
  platformWhitelistedStatuses,
}) => {
  const { network: expectedNetwork } = useExpectedNetwork();
  return (
    <ResponsiveDialog
      data-cy={"auto-wrap-add-token-dialog-section"}
      open={isEnableAutoWrapDialogOpen}
      onClose={closeEnableAutoWrapDialog}
      PaperProps={{ sx: { borderRadius: "20px", maxWidth: 479 } }}
      keepMounted={true}
    >
      <AddTokenWrapFormProvider
        initialFormValues={{
          network: expectedNetwork,
        }}
      >
        <AutoWrapAddTokenForm
          closeEnableAutoWrapDialog={closeEnableAutoWrapDialog}
          platformWhitelistedStatuses={platformWhitelistedStatuses}
        />
      </AddTokenWrapFormProvider>
    </ResponsiveDialog>
  );
};

export default memo(AutoWrapAddTokenDialogSection);
