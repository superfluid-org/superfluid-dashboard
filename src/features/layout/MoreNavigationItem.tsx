import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import SupportRoundedIcon from "@mui/icons-material/SupportRounded";
import {
  Box,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  Modal,
  useTheme,
} from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import { FC, MouseEvent, useState } from "react";
import OnboardingCards from "../onboarding/OnboardingCards";

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

  const closeOnboardingModal = () => setShowOnboardingModal(false);

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

      <Menu
        open={!!moreMenuAnchor}
        anchorEl={moreMenuAnchor}
        onClose={closeMoreMenu}
        transformOrigin={{ horizontal: "left", vertical: "bottom" }}
        anchorOrigin={{ horizontal: "left", vertical: "top" }}
        PaperProps={{
          sx: { minWidth: 228, marginTop: "-8px" },
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

        <ListItemButton onClick={openOnboardingModal}>
          <ListItemIcon>
            <SupportRoundedIcon color="primary" />
          </ListItemIcon>
          <ListItemText>Getting Started</ListItemText>
        </ListItemButton>
      </Menu>

      <Modal open={showOnboardingModal} onClose={closeOnboardingModal}>
        <Box
          sx={{
            position: "absolute",
            top: "40%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <OnboardingCards onClick={closeOnboardingModal} />
        </Box>
      </Modal>
    </>
  );
};

export default MoreNavigationItem;
