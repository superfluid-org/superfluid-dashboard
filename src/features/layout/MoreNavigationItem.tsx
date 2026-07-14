import { AutoModeOutlined } from "@mui/icons-material";
import AssessmentRoundedIcon from "@mui/icons-material/AssessmentRounded";
import GridViewRoundedIcon from "@mui/icons-material/GridViewRounded";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import ShowerRoundedIcon from "@mui/icons-material/ShowerRounded";
import SummarizeRoundedIcon from "@mui/icons-material/SummarizeRounded";
import {
  Chip,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Popover,
  useTheme,
} from "@mui/material";
import NextLink from "next/link";
import { FC, MouseEvent, useState } from "react";
import { useVisibleAddress } from "../wallet/VisibleAddressContext";

const MoreNavigationItem: FC = () => {
  const theme = useTheme();
  const { visibleAddress } = useVisibleAddress();

  const reporterUrl = visibleAddress
    ? `https://reporter.superfluid.org/?account=${visibleAddress}`
    : "https://reporter.superfluid.org/";

  const [moreMenuAnchor, setMoreMenuAnchor] = useState<HTMLElement | null>(
    null
  );

  const openMoreMenu = (event: MouseEvent<HTMLElement>) =>
    setMoreMenuAnchor(event.currentTarget);

  const closeMoreMenu = () => setMoreMenuAnchor(null);

  return (
    <>
      <ListItemButton
        data-cy={"nav-more-button"}
        sx={{ borderRadius: "10px" }}
        onClick={openMoreMenu}
        selected={!!moreMenuAnchor}
      >
        <ListItemIcon>
          <MoreHorizIcon />
        </ListItemIcon>
        <ListItemText primary="More" />
      </ListItemButton>

      <Popover
        open={!!moreMenuAnchor}
        anchorEl={moreMenuAnchor}
        onClose={closeMoreMenu}
        transformOrigin={{ horizontal: "left", vertical: "bottom" }}
        anchorOrigin={{ horizontal: "left", vertical: "bottom" }}
        PaperProps={{
          sx: { minWidth: 228 },
          square: true,
        }}
      >
        {/* <NextLink href="/?showFaucet=true" legacyBehavior>
          <ListItemButton
            data-cy={"more-faucet-btn"}
            href=""
            onClick={closeMoreMenu}
          >
            <ListItemIcon>
              <ShowerRoundedIcon sx={{ color: theme.palette.text.primary }} />
            </ListItemIcon>
            <ListItemText>Testnet Faucet</ListItemText>
          </ListItemButton>
        </NextLink> */}
        <NextLink href="/auto-wrap" legacyBehavior>
          <ListItemButton
            data-cy={"wrap-utility-btn"}
            href=""
            onClick={closeMoreMenu}
          >
            <ListItemIcon>
              <AutoModeOutlined sx={{ color: theme.palette.text.primary }} />
            </ListItemIcon>
            <ListItemText>Auto-Wrap</ListItemText>
          </ListItemButton>
        </NextLink>
        <NextLink href="/accounting" legacyBehavior>
          <ListItemButton
            data-cy={"more-export-btn"}
            href=""
            onClick={closeMoreMenu}
          >
            <ListItemIcon>
              <AssessmentRoundedIcon
                sx={{ color: theme.palette.text.primary }}
              />
            </ListItemIcon>
            <ListItemText>Export Stream Data</ListItemText>
          </ListItemButton>
        </NextLink>
        <NextLink href={reporterUrl} target="_blank" passHref legacyBehavior>
          <ListItemButton
            data-cy={"more-reporter-btn"}
            href=""
            target="_blank"
            onClick={closeMoreMenu}
          >
            <ListItemIcon>
              <SummarizeRoundedIcon
                sx={{ color: theme.palette.text.primary }}
              />
            </ListItemIcon>
            <ListItemText>
              Reporter <OpenInNewRoundedIcon fontSize="inherit" />{" "}
              <Chip
                label="Beta"
                size="small"
                sx={{ height: 18, fontSize: "0.65rem" }}
              />
            </ListItemText>
          </ListItemButton>
        </NextLink>
      </Popover>
    </>
  );
};

export default MoreNavigationItem;
