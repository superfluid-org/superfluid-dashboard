import { Tooltip, TooltipProps } from "@mui/material";
import { FC, useCallback, useState } from "react";
import copyToClipboard from "../../utils/copyToClipboard";

interface CopyTooltipProps {
  content: string;
  copyText: string;
  copiedText?: string;
  TooltipProps: Partial<TooltipProps>;
  children: ({ copy }: { copy: () => void }) => JSX.Element;
}

const CopyTooltip: FC<CopyTooltipProps> = ({
  content,
  copyText,
  copiedText = "Copied!",
  TooltipProps,
  children,
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
    <Tooltip title={isCopied ? copiedText : copyText} {...TooltipProps}>
      {children({ copy: handleCopyClick })}
    </Tooltip>
  );
};

export default CopyTooltip;
