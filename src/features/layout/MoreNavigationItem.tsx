import GridViewRoundedIcon from "@mui/icons-material/GridViewRounded";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import QrCodeRoundedIcon from "@mui/icons-material/QrCodeRounded";
import ShowerRoundedIcon from "@mui/icons-material/ShowerRounded";
import SupportRoundedIcon from "@mui/icons-material/SupportRounded";
import {
  Box,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Modal,
  Popover,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import { FC, MouseEvent, useState } from "react";
import AccessCodeDialog from "../featureFlags/AccessCodeDialog";
import OnboardingCards from "../onboarding/OnboardingCards";
import { useLayoutContext } from "./LayoutContext";

interface MenuItemImageProps {
  src: string;
  alt: string;
}

const MenuItemImage: FC<MenuItemImageProps> = ({ src, alt }) => (
  <ListItemIcon>
    <Image
      unoptimized
      src={src}
      width={24}
      height={24}
      layout="fixed"
      alt={alt}
    />
  </ListItemIcon>
);

const MoreNavigationItem: FC = ({}) => {
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));

  const { setNavigationDrawerOpen } = useLayoutContext();
  const [showAccessCodeDialog, setShowAccessCodeDialog] = useState(false);
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [moreMenuAnchor, setMoreMenuAnchor] = useState<HTMLElement | null>(
    null
  );

  const openMoreMenu = (event: MouseEvent<HTMLElement>) =>
    setMoreMenuAnchor(event.currentTarget);

  const closeMoreMenu = () => setMoreMenuAnchor(null);

  const openOnboardingModal = () => {
    setShowOnboardingModal(true);
    closeMoreMenu();
  };

  const closeOnboardingModal = () => {
    setShowOnboardingModal(false);
  };

  const onOnboardingItemClicked = () => {
    closeOnboardingModal();
    setNavigationDrawerOpen(false);
  };

  const openAccessCodeDialog = () => {
    closeMoreMenu();
    setShowAccessCodeDialog(true);
  };

  const closeAccessCodeDialog = () => setShowAccessCodeDialog(false);

  return (
    <>
      <ListItemButton
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
        <Link href="https://www.superfluid.finance" target="_blank" passHref>
          <ListItemButton href="" target="_blank">
            <MenuItemImage
              src={
                theme.palette.mode === "dark"
                  ? "/icons/superfluid-light.svg"
                  : "/icons/superfluid-dark.svg"
              }
              alt="Superfluid logo"
            />
            <ListItemText>Website</ListItemText>
          </ListItemButton>
        </Link>

        <Link href="https://v1.superfluid.finance" target="_blank" passHref>
          <ListItemButton href="" target="_blank">
            <ListItemIcon>
              <GridViewRoundedIcon sx={{ color: theme.palette.text.primary }} />
            </ListItemIcon>
            <ListItemText>Dashboard V1</ListItemText>
          </ListItemButton>
        </Link>

        <Link href="https://discord.gg/XsK7nahanQ" target="_blank" passHref>
          <ListItemButton href="" target="_blank">
            <MenuItemImage src="/icons/social/discord.svg" alt="Discord logo" />
            <ListItemText>Discord</ListItemText>
          </ListItemButton>
        </Link>

        <Link
          href="https://twitter.com/intent/follow?screen_name=Superfluid_HQ"
          target="_blank"
          passHref
        >
          <ListItemButton href="" target="_blank">
            <MenuItemImage src="/icons/social/twitter.svg" alt="Twitter logo" />
            <ListItemText>Twitter</ListItemText>
          </ListItemButton>
        </Link>

        <Link href="/?showFaucet=true">
          <ListItemButton href="" onClick={closeMoreMenu}>
            <ListItemIcon>
              <ShowerRoundedIcon sx={{ color: theme.palette.text.primary }} />
            </ListItemIcon>
            <ListItemText>Faucet</ListItemText>
          </ListItemButton>
        </Link>

        <ListItemButton onClick={openOnboardingModal}>
          <ListItemIcon>
            <SupportRoundedIcon color="primary" />
          </ListItemIcon>
          <ListItemText>Getting Started</ListItemText>
        </ListItemButton>

        <ListItemButton onClick={openAccessCodeDialog}>
          <ListItemIcon>
            <QrCodeRoundedIcon sx={{ color: theme.palette.text.primary }} />
          </ListItemIcon>
          <ListItemText>Access Code</ListItemText>
        </ListItemButton>
      </Popover>

      <Modal open={showOnboardingModal} onClose={closeOnboardingModal}>
        <Box
          sx={{
            position: "absolute",
            top: "40%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            [theme.breakpoints.down("md")]: {
              top: "50%",
            },
          }}
        >
          <OnboardingCards
            vertical={isBelowMd}
            onClick={onOnboardingItemClicked}
          />
        </Box>
      </Modal>

      {showAccessCodeDialog && (
        <AccessCodeDialog onClose={closeAccessCodeDialog} />
      )}
    </>
  );
};

export default MoreNavigationItem;
