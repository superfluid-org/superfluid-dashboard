import { alpha, IconButton, Stack, useTheme } from "@mui/material";
import Image from "next/legacy/image";
import { FC, ReactNode } from "react";
import { SocialIcon } from "react-social-icons/component";
import "react-social-icons/discord";
import "react-social-icons/x";
import Link from "../common/Link";

interface SocialLinkProps {
  dataCy: string;
  title: string;
  href: string;
  children: ReactNode;
}

const SocialLink: FC<SocialLinkProps> = ({ dataCy, title, href, children }) => (
  <IconButton
    data-cy={dataCy}
    size="small"
    LinkComponent={Link}
    href={href}
    target="_blank"
    aria-label={title}
    sx={{ opacity: 0.6, "&:hover": { opacity: 1 } }}
  >
    {children}
  </IconButton>
);

const SocialLinks: FC = () => {
  const theme = useTheme();

  return (
    <Stack direction="row" alignItems="center" gap={0.5}>
      <SocialLink
        dataCy="socials-website-btn"
        title="Website"
        href="https://superfluid.org"
      >
        <Image
          unoptimized
          src={
            theme.palette.mode === "dark"
              ? "/icons/superfluid-light.svg"
              : "/icons/superfluid-dark.svg"
          }
          width={18}
          height={18}
          layout="fixed"
          alt="Website logo"
        />
      </SocialLink>
      <SocialLink
        dataCy="socials-discord-btn"
        title="Discord"
        href="https://discord.gg/XsK7nahanQ"
      >
        <SocialIcon
          as="span"
          network="discord"
          bgColor={alpha(theme.palette.text.primary, 1)}
          fgColor="transparent"
          style={{ width: 18, height: 18, display: "flex" }}
        />
      </SocialLink>
      <SocialLink
        dataCy="socials-x-btn"
        title="X"
        href="https://x.com/Superfluid_HQ"
      >
        <SocialIcon
          as="span"
          network="x"
          bgColor={alpha(theme.palette.text.primary, 1)}
          fgColor="transparent"
          style={{ width: 18, height: 18, display: "flex" }}
        />
      </SocialLink>
    </Stack>
  );
};

export default SocialLinks;
