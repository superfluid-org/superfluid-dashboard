import { AutoModeOutlined } from "@mui/icons-material";
import AssessmentRoundedIcon from "@mui/icons-material/AssessmentRounded";
import GridViewRoundedIcon from "@mui/icons-material/GridViewRounded";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import ShowerRoundedIcon from "@mui/icons-material/ShowerRounded";
import {
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Popover,
  useTheme,
} from "@mui/material";
import Image from "next/legacy/image";
import NextLink from "next/link";
import { FC, MouseEvent, useState } from "react";

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
        <NextLink
          href="https://www.superfluid.finance"
          target="_blank"
          passHref
          legacyBehavior
        >
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
        </NextLink>

        <NextLink
          href="https://v1.superfluid.finance"
          target="_blank"
          passHref
          legacyBehavior
        >
          <ListItemButton data-cy={"more-v1-btn"} href="" target="_blank">
            <ListItemIcon>
              <GridViewRoundedIcon sx={{ color: theme.palette.text.primary }} />
            </ListItemIcon>
            <ListItemText>Dashboard V1</ListItemText>
          </ListItemButton>
        </NextLink>

        <NextLink
          href="https://discord.gg/XsK7nahanQ"
          target="_blank"
          passHref
          legacyBehavior
        >
          <ListItemButton data-cy={"more-discord-btn"} href="" target="_blank">
            <MenuItemImage src="/icons/social/discord.svg" alt="Discord logo" />
            <ListItemText>Discord</ListItemText>
          </ListItemButton>
        </NextLink>

        <NextLink
          href="https://twitter.com/intent/follow?screen_name=Superfluid_HQ"
          target="_blank"
          passHref
          legacyBehavior
        >
          <ListItemButton data-cy={"more-twitter-btn"} href="" target="_blank">
            <MenuItemImage src="/icons/social/twitter.svg" alt="Twitter logo" />
            <ListItemText>Twitter</ListItemText>
          </ListItemButton>
        </NextLink>

        <NextLink href="/?showFaucet=true" legacyBehavior>
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
        </NextLink>
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
      </Popover>
    </>
  );
};

export default MoreNavigationItem;
