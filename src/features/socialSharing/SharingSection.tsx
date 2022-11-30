import LinkIcon from "@mui/icons-material/Link";
import ShareIcon from "@mui/icons-material/Share";
import { IconButton, Stack, Typography, useTheme } from "@mui/material";
import { FC } from "react";
import CopyTooltip from "../../components/CopyTooltip/CopyTooltip";
import ShareButton from "./ShareButton";

interface SharingSectionProps {
  url: string;
  twitterText?: string;
  twitterHashtags?: string;
  telegramText?: string;
}

const SharingSection: FC<SharingSectionProps> = ({
  url,
  twitterText,
  twitterHashtags,
  telegramText,
}) => {
  const theme = useTheme();
  const encodedUrlToShare = encodeURIComponent(url);

  return (
    <Stack direction="row" alignItems="center" justifyContent="center" gap={1}>
      <ShareIcon sx={{ width: 18, height: 18 }} />
      <Typography variant="h5" translate="yes" sx={{ mr: 1 }}>
        Share:
      </Typography>

      <CopyTooltip content={url} copyText="Copy link">
        {({ copy }) => (
          <IconButton
            data-cy={"copy-button"}
            onClick={copy}
            sx={{
              color: "#fff",
              width: 30,
              height: 30,
              borderRadius: "50%",
              backgroundColor: theme.palette.primary.main,
              "&:hover": {
                backgroundColor: theme.palette.primary.main,
              },
            }}
          >
            <LinkIcon
              sx={{
                transform: "rotate(135deg)",
                width: 20,
                height: 20,
              }}
            />
          </IconButton>
        )}
      </CopyTooltip>
      {twitterText && (
        <ShareButton
          dataCy={"twitter-button"}
          imgSrc="/icons/social/twitter.svg"
          alt="Twitter logo"
          tooltip="Share on Twitter"
          href={`https://twitter.com/intent/tweet?text=${twitterText}&url=${encodedUrlToShare}&hashtags=${twitterHashtags}`}
        />
      )}
      {/* <ShareButton imgSrc="/icons/social/discord.svg" alt="Discord logo" /> */}
      {telegramText && (
        <ShareButton
          dataCy={"telegram-button"}
          imgSrc="/icons/social/telegram.svg"
          alt="Telegram logo"
          tooltip="Share on Telegram"
          href={`https://t.me/share/url?text=${telegramText}&url=${encodedUrlToShare}`}
        />
      )}
    </Stack>
  );
};

export default SharingSection;
