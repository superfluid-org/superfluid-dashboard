import { IconButton, Stack, Tooltip, useTheme } from "@mui/material";
import Image from "next/legacy/image";
import { FC } from "react";
import Link from "../common/Link";

interface SocialLinkProps {
  dataCy: string;
  title: string;
  href: string;
  src: string;
}

const SocialLink: FC<SocialLinkProps> = ({ dataCy, title, href, src }) => (
  <Tooltip title={title}>
    <IconButton
      data-cy={dataCy}
      size="small"
      LinkComponent={Link}
      href={href}
      target="_blank"
      aria-label={title}
    >
      <Image
        unoptimized
        src={src}
        width={18}
        height={18}
        layout="fixed"
        alt={`${title} logo`}
      />
    </IconButton>
  </Tooltip>
);

const SocialLinks: FC = () => {
  const theme = useTheme();

  return (
    <Stack direction="row" alignItems="center" gap={0.5}>
      <SocialLink
        dataCy="socials-website-btn"
        title="Website"
        href="https://www.superfluid.finance"
        src={
          theme.palette.mode === "dark"
            ? "/icons/superfluid-light.svg"
            : "/icons/superfluid-dark.svg"
        }
      />
      <SocialLink
        dataCy="socials-discord-btn"
        title="Discord"
        href="https://discord.gg/XsK7nahanQ"
        src="/icons/social/discord.svg"
      />
      <SocialLink
        dataCy="socials-twitter-btn"
        title="Twitter"
        href="https://twitter.com/intent/follow?screen_name=Superfluid_HQ"
        src="/icons/social/twitter.svg"
      />
    </Stack>
  );
};

export default SocialLinks;
