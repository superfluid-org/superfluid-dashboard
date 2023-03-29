import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import { Button, IconButton, Stack, SxProps, Theme } from "@mui/material";
import NextLink from "next/link";
import { FC, memo, PropsWithChildren } from "react";
import { useAccount } from "wagmi";

interface VestingHeaderProps extends PropsWithChildren {
  onBack?: () => void;
  actions?: any;
  hideCreate?: boolean;
  sx?: SxProps<Theme>;
}

const VestingHeader: FC<VestingHeaderProps> = ({
  onBack,
  actions,
  hideCreate = false,
  children,
  sx = {},
}) => {
  const { address: accountAddress } = useAccount();

  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      sx={{ mb: 4.5, ...sx }}
    >
      <Stack direction="row" alignItems="center" gap={2}>
        {onBack && (
          <IconButton color="inherit" onClick={onBack}>
            <ArrowBackRoundedIcon />
          </IconButton>
        )}

        {children}
      </Stack>
      <Stack direction="row" alignItems="center" gap={1}>
        {accountAddress && !hideCreate && (
          <NextLink href="/vesting/create" passHref>
            <Button
              data-cy="create-schedule-button"
              color="primary"
              variant="contained"
              endIcon={<AddRoundedIcon />}
            >
              Create Vesting Schedule
            </Button>
          </NextLink>
        )}
        {actions}
      </Stack>
    </Stack>
  );
};

export default memo(VestingHeader);
