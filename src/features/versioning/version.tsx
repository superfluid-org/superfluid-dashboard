import { Box, Popover, Stack, Typography } from "@mui/material";
import { FC, useState, MouseEvent } from "react";
import { timeAgo } from "../../utils/timeAgo";

const buildVersion = process.env.NEXT_PUBLIC_BUILD_VERSION;
const buildTimestamp = process.env.NEXT_PUBLIC_BUILD_TIMESTAMP;

export const Version: FC = () => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  const handlePopoverOpen = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  if (buildVersion && buildTimestamp) {
    return (
      <>
        <Typography
          variant="caption"
          aria-haspopup="true"
          onClick={handlePopoverOpen}
          sx={{
            ":hover": {
              cursor: "pointer",
              "text-decoration": "underline",
            },
          }}
        >
          {buildVersion} ({timeAgo(Number(buildTimestamp))})
        </Typography>
        <Popover
          open={open}
          onClose={handlePopoverClose}
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
        >
          <Typography component="h1" variant="h5" sx={{ p: 1 }}>
            Major Version History
          </Typography>
          <Box sx={{ p: 2 }}>
            <Typography component="h1" variant="h5">
              2022.08
            </Typography>
            <ul>
              <li>
                Enable approving (and revoking approvals) of{" "}
                <a
                  href="https://docs.superfluid.finance/superfluid/protocol-overview/in-depth-overview/super-agreements/instant-distribution-agreement-ida"
                  target="_blank"
                >
                  instant distribution index
                </a>{" "}
                subscriptions.
              </li>
            </ul>
          </Box>
        </Popover>
      </>
    );
  }

  return null;
};
