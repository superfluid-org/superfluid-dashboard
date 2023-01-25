import {
  IconButton,
  IconButtonProps,
  Tooltip,
  TooltipProps,
} from "@mui/material";
import { FC, useState } from "react";
import copyToClipboard from "../../utils/copyToClipboard";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";

interface CopyIconBtnProps {
  copyText: string;
  description?: string;
  TooltipProps?: Partial<TooltipProps>;
  IconButtonProps?: Partial<IconButtonProps>;
}

export const CopyIconBtn: FC<CopyIconBtnProps> = ({
  copyText,
  description = "Copy to clipboard",
  TooltipProps = {},
  IconButtonProps = {},
}) => {
  const [isCopied, setIsCopied] = useState(false);

  /**
   * onClick handler function for the copy button
   * that will asynchronously call copyTextToClipboard
   */
  const handleCopyClick = () =>
    copyToClipboard(copyText)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => {
          setIsCopied(false);
        }, 1500);
      })
      .catch(console.log);

  return (
    <Tooltip title={isCopied ? "Copied!" : description} {...TooltipProps}>
      <IconButton onClick={handleCopyClick} {...IconButtonProps}>
        <ContentCopyRoundedIcon />
      </IconButton>
    </Tooltip>
  );
};
