import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import { IconButton, Tooltip, TooltipProps } from "@mui/material";
import { FC, useCallback, useState } from "react";
import copyToClipboard from "../../utils/copyToClipboard";

type CopyFunctionChildren = ({ copy }: { copy: () => void }) => JSX.Element;

interface CopyTooltipProps {
  content: string;
  copyText: string;
  children?: CopyFunctionChildren;
  copiedText?: string;
  TooltipProps?: Partial<TooltipProps>;
}

const defaultChildren: CopyFunctionChildren = ({ copy }) => (
  <IconButton size="small" onClick={copy}>
    <ContentCopyRoundedIcon />
  </IconButton>
);

const CopyTooltip: FC<CopyTooltipProps> = ({
  content,
  copyText,
  children = defaultChildren,
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
      data-cy={"copy-button"}
      test-data={content}
      title={isCopied ? <span>{copiedText}</span> : <span>{copyText}</span>}
      arrow
      placement="top"
      {...TooltipProps}
    >
      {children({ copy: handleCopyClick })}
    </Tooltip>
  );
};

export default CopyTooltip;
