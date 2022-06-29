import { Stack, Tooltip, Typography } from "@mui/material";
import { Address } from "@superfluid-finance/sdk-core";
import { FC, ReactElement, useMemo, useState } from "react";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import copyToClipboard from "../../utils/copyToClipboard";
import { getAddress } from "../../utils/memoizedEthersUtils";

interface AddressCopyTooltipProps {
  address: Address;
  children: ReactElement<any, any>;
}

const AddressCopyTooltip: FC<AddressCopyTooltipProps> = ({
  address,
  children,
}) => {
  const [isCopied, setIsCopied] = useState(false);
  const checksumAddress = getAddress(address);

  const copyAddress = () => {
    // Asynchronously call copyTextToClipboard
    copyToClipboard(checksumAddress)
      .then(() => {
        // If successful, update the isCopied state value
        setIsCopied(true);
        setTimeout(() => {
          setIsCopied(false);
        }, 1500);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <Tooltip
      arrow
      title={
        isCopied ? (
          <Typography variant="body1">Copied to clipboard!</Typography>
        ) : (
          <Stack
            direction="row"
            alignItems="center"
            gap={1}
            sx={{ cursor: "pointer" }}
            onClick={copyAddress}
          >
            <Typography variant="body1">{checksumAddress}</Typography>
            <ContentCopyRoundedIcon sx={{ fontSize: "16px" }} />
          </Stack>
        )
      }
      placement="top"
      componentsProps={{ tooltip: { sx: { maxWidth: "none" } } }}
    >
      {children}
    </Tooltip>
  );
};

export default AddressCopyTooltip;
