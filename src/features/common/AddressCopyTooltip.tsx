import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import { Stack, Tooltip, Typography } from "@mui/material";
import { Address } from "@superfluid-finance/sdk-core";
import {
  FC,
  MouseEvent,
  ReactElement,
  useEffect,
  useRef,
  useState,
} from "react";
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
  const addressWrapperRef = useRef<HTMLDivElement>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [tooltipWidth, setTooltipWidth] = useState(0);
  const checksumAddress = getAddress(address);

  const copyAddress = (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    // Asynchronously call copyTextToClipboard
    copyToClipboard(checksumAddress)
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
  };

  const onOpen = () =>
    setTooltipWidth(addressWrapperRef.current?.clientWidth || 0);

  const onClose = () => {
    setTimeout(() => {
      setIsCopied(false);
    }, 300);
  };

  return (
    <Tooltip
      arrow
      title={
        <Stack
          ref={addressWrapperRef}
          direction="row"
          alignItems="center"
          justifyContent="center"
          gap={1}
          sx={{
            ...(tooltipWidth && { width: tooltipWidth }),
            ...(!isCopied && { cursor: "pointer" }),
          }}
          onClick={!isCopied ? copyAddress : undefined}
        >
          {isCopied ? (
            <Typography variant="tooltip">Copied to clipboard!</Typography>
          ) : (
            <>
              <Typography variant="tooltip">{checksumAddress}</Typography>
              <ContentCopyRoundedIcon sx={{ fontSize: "16px" }} />
            </>
          )}
        </Stack>
      }
      placement="top"
      componentsProps={{ tooltip: { sx: { maxWidth: "none" } } }}
      onOpen={onOpen}
      onClose={onClose}
    >
      {children}
    </Tooltip>
  );
};

export default AddressCopyTooltip;
