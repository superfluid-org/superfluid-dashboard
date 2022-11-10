import { Box, Tooltip, Link as MuiLink } from "@mui/material";
import Image from "next/image";
import { FC } from "react";

interface ShareButtonProps {
  imgSrc: string;
  alt: string;
  tooltip: string;
  href?: string;
  dataCy?: string;
}

const ShareButton: FC<ShareButtonProps> = ({
  imgSrc,
  alt,
  tooltip,
  href,
  dataCy,
}) => (
  <Tooltip title={tooltip} arrow placement="top">
    <MuiLink data-cy={dataCy} href={href} target="_blank">
      <Box sx={{ display: "flex" }}>
        <Image
          unoptimized
          src={imgSrc}
          width={30}
          height={30}
          layout="fixed"
          alt={alt}
        />
      </Box>
    </MuiLink>
  </Tooltip>
);

export default ShareButton;
