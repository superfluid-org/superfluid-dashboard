import AssessmentRoundedIcon from "@mui/icons-material/AssessmentRounded";
import GridViewRoundedIcon from "@mui/icons-material/GridViewRounded";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import QrCodeRoundedIcon from "@mui/icons-material/QrCodeRounded";
import ShowerRoundedIcon from "@mui/icons-material/ShowerRounded";
import {
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Popover,
  Typography,
  useTheme,
} from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import { FC, MouseEvent, useState } from "react";
import PrimaryLink from "../common/Link";
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

const MoreNavigationItem: FC = () => {
  const theme = useTheme();

  const { setAccessCodeDialogContent } = useLayoutContext();
  const [moreMenuAnchor, setMoreMenuAnchor] = useState<HTMLElement | null>(
    null
  );

  const openMoreMenu = (event: MouseEvent<HTMLElement>) =>
    setMoreMenuAnchor(event.currentTarget);

  const closeMoreMenu = () => setMoreMenuAnchor(null);

  const openMainnetAccessCodeDialog = () => {
    closeMoreMenu();
    setAccessCodeDialogContent({
      title: "Access Ethereum Mainnet",
      description: (
        <>
          <Typography>
            Enter your access code to unlock Ethereum Mainnet.
          </Typography>
          <Typography>
            Apply for the access code{" "}
            <PrimaryLink
              href="https://use.superfluid.finance/ethmainnet"
              target="_blank"
            >
              here
            </PrimaryLink>
            .
          </Typography>
        </>
      ),
    });
  };

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
        <Link href="https://www.superfluid.finance" target="_blank" passHref>
          <ListItemButton data-cy={"more-website-btn"} href="" target="_blank">
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
          <ListItemButton data-cy={"more-v1-btn"} href="" target="_blank">
            <ListItemIcon>
              <GridViewRoundedIcon sx={{ color: theme.palette.text.primary }} />
            </ListItemIcon>
            <ListItemText>Dashboard V1</ListItemText>
          </ListItemButton>
        </Link>

        <Link href="https://discord.gg/XsK7nahanQ" target="_blank" passHref>
          <ListItemButton data-cy={"more-discord-btn"} href="" target="_blank">
            <MenuItemImage src="/icons/social/discord.svg" alt="Discord logo" />
            <ListItemText>Discord</ListItemText>
          </ListItemButton>
        </Link>

        <Link
          href="https://twitter.com/intent/follow?screen_name=Superfluid_HQ"
          target="_blank"
          passHref
        >
          <ListItemButton data-cy={"more-twitter-btn"} href="" target="_blank">
            <MenuItemImage src="/icons/social/twitter.svg" alt="Twitter logo" />
            <ListItemText>Twitter</ListItemText>
          </ListItemButton>
        </Link>

        <Link href="/?showFaucet=true">
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
        </Link>

        <Link href="/accounting">
          <ListItemButton data-cy={"more-export-btn"} href="" onClick={closeMoreMenu}>
            <ListItemIcon>
              <AssessmentRoundedIcon
                sx={{ color: theme.palette.text.primary }}
              />
            </ListItemIcon>
            <ListItemText>Export Stream Data</ListItemText>
          </ListItemButton>
        </Link>

        <ListItemButton
          data-cy={"more-access-code-btn"}
          onClick={openMainnetAccessCodeDialog}
        >
          <ListItemIcon>
            <QrCodeRoundedIcon sx={{ color: theme.palette.text.primary }} />
          </ListItemIcon>
          <ListItemText>Access Ethereum Mainnet</ListItemText>
        </ListItemButton>
      </Popover>
    </>
  );
};

export default MoreNavigationItem;
