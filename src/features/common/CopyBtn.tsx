import CheckOutlinedIcon from "@mui/icons-material/CheckOutlined";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import { Button, ButtonProps } from "@mui/material";
import { FC, useState } from "react";
import copyToClipboard from "../../utils/copyToClipboard";

interface CopyBtnProps {
  label: string;
  copyText: string;
  ButtonProps?: Partial<ButtonProps>;
}

const CopyBtn: FC<CopyBtnProps> = ({ label, copyText, ButtonProps = {} }) => {
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
    <Button
      {...ButtonProps}
      endIcon={isCopied ? <CheckOutlinedIcon /> : <ContentCopyRoundedIcon />}
      onClick={handleCopyClick}
    >
      {isCopied ? "Copied!" : label}
    </Button>
  );
};

export default CopyBtn;
