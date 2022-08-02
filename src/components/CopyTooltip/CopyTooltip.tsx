import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import { IconButton, Tooltip, TooltipProps } from "@mui/material";
import { FC, useCallback, useState } from "react";
import copyToClipboard from "../../utils/copyToClipboard";

interface CopyTooltipProps {
  content: string;
  copyText: string;
  children?: ({ copy }: { copy: () => void }) => JSX.Element;
  copiedText?: string;
  TooltipProps?: Partial<TooltipProps>;
}

const defaultChildren = ({ copy }) => (
  <IconButton size="small" onClick={copy}>
    <ContentCopyRoundedIcon />
  </IconButton>
);

const CopyTooltip: FC<CopyTooltipProps> = ({
  content,
  copyText,
  children,
  copiedText = "Copied!",
  TooltipProps = {},
}) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyClick = useCallback(() => {
    // Asynchronously call copyTextToClipboard
    copyToClipboard(content)
      .then(() => {
        // If successful, update the isCopied state value
        setIsCopied(true);
        setTimeout(() => {
          setIsCopied(false);
        }, 1500);
      })
      .catch((e) => {
        console.error(e);
      });
  }, [content]);

  return (
    <Tooltip
      title={isCopied ? copiedText : copyText}
      arrow
      placement="top"
      {...TooltipProps}
    >
      {children({ copy: handleCopyClick })}
    </Tooltip>
  );
};

export default CopyTooltip;
