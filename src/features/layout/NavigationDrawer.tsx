import AppsRoundedIcon from "@mui/icons-material/AppsRounded";
import ArrowRightAltRoundedIcon from "@mui/icons-material/ArrowRightAltRounded";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import AutoAwesomeMosaicRoundedIcon from "@mui/icons-material/AutoAwesomeMosaicRounded";
import AutoModeOutlinedIcon from "@mui/icons-material/AutoModeOutlined";
import AutoStoriesOutlinedIcon from "@mui/icons-material/AutoStoriesOutlined";
import ControlPointDuplicateOutlinedIcon from "@mui/icons-material/ControlPointDuplicateOutlined";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import LockClockOutlinedIcon from "@mui/icons-material/LockClockOutlined";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import SportsEsportsRoundedIcon from "@mui/icons-material/SportsEsportsRounded";
import SwapHorizRoundedIcon from "@mui/icons-material/SwapHorizRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import {
  alpha,
  Box,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  SvgIcon,
  SwipeableDrawer,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import Image from "next/legacy/image";
import { useRouter } from "next/router";
import { FC, memo, ReactNode, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import ThemeChanger from "../theme/ThemeChanger";
import ConnectWallet from "../wallet/ConnectWallet";
import { useLayoutContext } from "./LayoutContext";
import { useMinigame } from "../minigame/MinigameContext";
import { useVisibleAddress } from "../wallet/VisibleAddressContext";
import SocialLinks from "./SocialLinks";
import Link from "../common/Link";
import packageJson from "../../../package.json";

export const menuDrawerWidth = 260;

interface NavigationItemProps {
  id: string;
  title: string;
  href: string;
  active: boolean;
  icon: typeof SvgIcon;
  isExternal?: true;
  chip?: ReactNode;
  dense?: boolean;
  onClick?: () => void;
}

const NavigationItem: FC<NavigationItemProps> = ({
  id,
  title,
  href,
  active,
  icon: Icon,
  isExternal,
  chip,
  dense,
  onClick,
}) => {
  const theme = useTheme();

  return (
    <ListItemButton
      LinkComponent={Link}
      href={href}
      sx={{
        borderRadius: "10px",
        transition: theme.transitions.create("background-color", {
          easing: theme.transitions.easing.easeOut,
          duration: theme.transitions.duration.short,
        }),
        "&.Mui-selected": {
          backgroundColor: alpha(theme.palette.primary.main, 0.08),
        },
        "&.Mui-selected:hover": {
          backgroundColor: alpha(theme.palette.primary.main, 0.12),
        },
        ...(dense && { minHeight: 40, py: 0.5 }),
      }}
      selected={active}
      onClick={onClick}
      {...(isExternal && { target: "_blank" })}
    >
      {/* Dense icons are 20px in a 24px-wide slot (ml 2px + mr 18px), so labels
          share the same x-coordinate as the 24px-icon tier above. */}
      <ListItemIcon sx={dense ? { ml: 0.25, mr: 2.25 } : undefined}>
        <Icon fontSize={dense ? "small" : "medium"} />
      </ListItemIcon>
      <ListItemText
        data-cy={id}
        primary={title}
        slotProps={{
          primary: dense ? { variant: "body2" } : undefined,
        }}
      />
      {(chip || isExternal) && (
        <Stack
          direction="row"
          sx={{
            alignItems: "center",
            gap: 0.75,
          }}
        >
          {chip}
          {isExternal && (
            <OpenInNewRoundedIcon
              sx={{ fontSize: 16, color: "text.disabled" }}
            />
          )}
        </Stack>
      )}
    </ListItemButton>
  );
};

export default memo(function NavigationDrawer() {
  const theme = useTheme();
  const isBelowLg = useMediaQuery(theme.breakpoints.down("lg"));
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));
  const { navigationDrawerOpen, setNavigationDrawerOpen } = useLayoutContext();
  const { visibleAddress } = useVisibleAddress();
  const { getUrl: getMinigameUrl } = useMinigame();

  const reporterUrl = visibleAddress
    ? `https://reporter.superfluid.org/?account=${visibleAddress}`
    : "https://reporter.superfluid.org/";

  const localMajorVersion = packageJson.version.split(".")[0];

  const fetchRemoteDashboardVersion = useCallback(async () => {
    const response = await fetch(
      "https://raw.githubusercontent.com/superfluid-org/superfluid-dashboard/master/package.json"
    );
    if (!response.ok) {
      throw new Error(
        `Failed to fetch remote package.json: ${response.statusText} (status: ${response.status})`
      );
    }
    const remotePackageData = await response.json();
    const remoteFullVersion = remotePackageData.version;

    if (typeof remoteFullVersion === "string") {
      return remoteFullVersion.split(".")[0];
    }
    throw new Error(`Remote version format is incorrect: ${remoteFullVersion}`);
  }, []);

  const { data: remoteMajorVersionFromQuery } = useQuery<string, Error>({
    queryKey: ["remoteDashboardVersion"],
    queryFn: fetchRemoteDashboardVersion,
    refetchInterval: 15 * 60 * 1000, // 15 minutes
    staleTime: 15 * 60 * 1000, // 15 minutes
    refetchOnWindowFocus: true,
  });

  const remoteMajorVersion = remoteMajorVersionFromQuery;
  const isOutOfSync = !!(
    remoteMajorVersion &&
    localMajorVersion &&
    parseInt(remoteMajorVersion, 10) > parseInt(localMajorVersion, 10)
  );

  const closeNavigationDrawer = useCallback(() => {
    if (isBelowLg) setNavigationDrawerOpen(false);
  }, [isBelowLg, setNavigationDrawerOpen]);

  const openNavigationDrawer = useCallback(() => {
    if (isBelowLg) setNavigationDrawerOpen(true);
  }, [isBelowLg, setNavigationDrawerOpen]);

  const router = useRouter();
  const isActiveRoute = (...routes: Array<string>) =>
    routes.includes(router.route);

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <SwipeableDrawer
      data-cy={"navigation-drawer"}
      variant={isBelowLg ? "temporary" : "permanent"} // permanent
      open={navigationDrawerOpen}
      anchor="left"
      disableDiscovery={true}
      disableSwipeToOpen={true}
      hidden={isBelowLg && !navigationDrawerOpen}
      sx={{ width: menuDrawerWidth }}
      onClose={closeNavigationDrawer}
      onOpen={openNavigationDrawer}
      ModalProps={{ disableScrollLock: true }}
      translate="yes"
      slotProps={{
        paper: {
          sx: {
            width: menuDrawerWidth,
            borderRadius: 0,
            borderLeft: 0,
            borderTop: 0,
            borderBottom: 0,
          },
          style: {
            pointerEvents:
              isBelowLg && !navigationDrawerOpen ? "none" : "initial",
          },
        },
      }}
    >
      <Toolbar
        sx={{
          height: 88,
          px: 4,
          [theme.breakpoints.up("sm")]: {
            px: 4,
          },
        }}
      >
        <Link href="/">
          <Image
            data-cy={"superfluid-logo"}
            priority
            unoptimized
            src={
              theme.palette.mode === "dark"
                ? "/superfluid-logo-light.svg"
                : "/superfluid-logo-dark.svg"
            }
            width={167}
            height={40}
            layout="fixed"
            alt="Superfluid logo"
          />
        </Link>
      </Toolbar>
      {!isBelowMd && (
        <Box sx={{ px: 2, py: 1.5 }}>
          <ConnectWallet />
        </Box>
      )}
      <Stack
        component={List}
        sx={{
          gap: 1,
          color: theme.palette.text.secondary,
          px: 2,
        }}
      >
        <NavigationItem
          id="nav-dashboard"
          title="Portfolio"
          href="/"
          onClick={closeNavigationDrawer}
          active={isActiveRoute("/", "/[_network]/token")}
          icon={AutoAwesomeMosaicRoundedIcon}
        />

        <NavigationItem
          id="nav-send"
          title="Send"
          href="/send"
          onClick={closeNavigationDrawer}
          active={isActiveRoute("/send", "/transfer")}
          icon={ArrowRightAltRoundedIcon}
        />

        <NavigationItem
          id="nav-wrap-unwrap"
          title="Wrap / Unwrap"
          href="/wrap?upgrade"
          onClick={closeNavigationDrawer}
          active={isActiveRoute("/wrap")}
          icon={ControlPointDuplicateOutlinedIcon}
        />

        <NavigationItem
          id="nav-bridge"
          title="Swap & Bridge"
          href="/bridge"
          onClick={closeNavigationDrawer}
          active={isActiveRoute("/bridge")}
          icon={SwapHorizRoundedIcon}
        />

        <NavigationItem
          id="nav-vesting"
          title="Vesting"
          href="/vesting"
          onClick={closeNavigationDrawer}
          active={isActiveRoute(
            "/vesting",
            "/vesting/create",
            "/vesting/[_network]/[_id]"
          )}
          icon={LockClockOutlinedIcon}
        />

        <NavigationItem
          id="nav-auto-wrap"
          title="Auto-Wrap"
          href="/auto-wrap"
          onClick={closeNavigationDrawer}
          active={isActiveRoute("/auto-wrap")}
          icon={AutoModeOutlinedIcon}
        />

        <NavigationItem
          id="nav-approvals"
          title="Approvals"
          href="/approvals"
          onClick={closeNavigationDrawer}
          active={isActiveRoute("/approvals")}
          icon={FactCheckOutlinedIcon}
        />

        <NavigationItem
          id="nav-history"
          title="Activity History"
          href="/history"
          onClick={closeNavigationDrawer}
          active={isActiveRoute("/history")}
          icon={HistoryRoundedIcon}
        />
      </Stack>
      <Stack
        sx={{
          justifyContent: "flex-end",
          flex: 1,
        }}
      >
        <Stack
          sx={{
            gap: 0.5,
            my: 2,
            px: 2,
            color: theme.palette.text.secondary,
          }}
        >
          <NavigationItem
            id="nav-address-book"
            title="Address Book"
            href="/address-book"
            onClick={closeNavigationDrawer}
            active={isActiveRoute("/address-book")}
            icon={AutoStoriesOutlinedIcon}
            dense
          />
          <NavigationItem
            id="nav-export"
            title="Export Stream Data"
            href="/accounting"
            onClick={closeNavigationDrawer}
            active={isActiveRoute("/accounting")}
            icon={AssessmentOutlinedIcon}
            dense
          />
          <NavigationItem
            id="nav-reporter"
            title="Superfluid Reporter"
            href={reporterUrl}
            onClick={closeNavigationDrawer}
            active={false}
            icon={ReceiptLongRoundedIcon}
            isExternal
            dense
          />
          <NavigationItem
            id="nav-superfluid-runner"
            title="Superfluid Runner"
            href={getMinigameUrl().toString()}
            onClick={closeNavigationDrawer}
            active={false}
            icon={SportsEsportsRoundedIcon}
            isExternal
            dense
          />
          <NavigationItem
            id="nav-ecosystem"
            title="Ecosystem"
            href="https://superfluid.org/ecosystem"
            onClick={closeNavigationDrawer}
            active={false}
            icon={AppsRoundedIcon}
            isExternal
            dense
          />
          <Divider sx={{ mt: 1, opacity: 0.6 }} />
          <Stack
            direction="row"
            sx={{
              alignItems: "center",
              gap: 0.75,
              mt: 0.5,
              pl: 1.5,
            }}
          >
            <SocialLinks />
            <Typography variant="body2" component="span">
              ·
            </Typography>
            {isOutOfSync && remoteMajorVersion ? (
              <IconButton
                onClick={handleRefresh}
                title={`Newer version v${remoteMajorVersion} available. Click to refresh.`}
                sx={{
                  p: 0.5,
                  borderRadius: theme.shape.borderRadius,
                  display: "flex",
                  alignItems: "center",
                  gap: theme.spacing(0.5),
                  color: "inherit",
                }}
              >
                <Typography variant="body2" component="span">
                  v{localMajorVersion}
                </Typography>
                <WarningAmberRoundedIcon
                  fontSize="small"
                  sx={{ color: theme.palette.warning.main }}
                />
              </IconButton>
            ) : (
              <Typography
                variant="body2"
                title={`The current Dashboard version is v${localMajorVersion}.`}
              >
                v{localMajorVersion}
              </Typography>
            )}
            {/* mr aligns the icon's right edge with the dense rows' trailing
                ↗ icons: 16px container padding + 12px here + 4px IconButton
                padding = the arrows' 32px inset from the drawer edge. */}
            <Box sx={{ ml: "auto", mr: 1.5 }}>
              <ThemeChanger />
            </Box>
          </Stack>
        </Stack>
      </Stack>
    </SwipeableDrawer>
  );
});
