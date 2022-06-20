import CancelIcon from "@mui/icons-material/Cancel";
import EditIcon from "@mui/icons-material/Edit";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import {
  Card,
  CardContent,
  CardHeader,
  IconButton,
  ListItemAvatar,
  ListItemText,
  Paper,
  Skeleton,
  Stack,
} from "@mui/material";
import Image from "next/image";
import { FC } from "react";
import AddressAvatar from "../../components/AddressAvatar/AddressAvatar";
import TokenIcon from "../token/TokenIcon";

interface OnboardingItemProps {
  title: string;
  subheader: string;
  childrenGap?: number;
}

const OnboardingItem: FC<OnboardingItemProps> = ({
  title,
  subheader,
  childrenGap = 1.5,
  children,
}) => (
  <Card>
    <CardHeader title={title} subheader={subheader} />
    <CardContent
      component={Stack}
      direction="row"
      alignItems="center"
      justifyContent="center"
      gap={childrenGap}
      sx={{ pointerEvents: "none" }}
    >
      {children}
    </CardContent>
  </Card>
);

const StreamItem = () => (
  <Paper
    component={Stack}
    alignItems="center"
    direction="row"
    sx={{ px: 1, py: 0.5, borderRadius: "8px" }}
    gap={1}
    flex={1}
  >
    <AddressAvatar
      AvatarProps={{
        sx: { width: "20px", height: "20px", borderRadius: "4px" },
      }}
      BlockiesProps={{ size: 10, scale: 2 }}
      address="0xF9Ce34dFCD3cc92804772F3022AF27bCd5E43Ff2"
    />
    <Stack flex={1} alignItems="flex-start">
      <Skeleton width="100%" height={12} animation={false} />
      <Skeleton width="50%" height={12} animation={false} />
    </Stack>
  </Paper>
);

interface OnboardingCardsProps {}

const OnboardingCards: FC<OnboardingCardsProps> = ({}) => {
  return (
    <Stack
      sx={{ display: "grid", gridTemplateColumns: "repeat(3, 290px)" }}
      alignItems="center"
      justifyContent="center"
      gap={3.5}
    >
      <OnboardingItem
        title="Get Super Tokens"
        subheader="Wrap any token in your wallet"
      >
        <TokenIcon size={32} tokenSymbol="DAI" />
        <SwapVertIcon color="primary" sx={{ transform: "rotate(90deg)" }} />
        <TokenIcon size={32} tokenSymbol="DAIx" />
      </OnboardingItem>

      <OnboardingItem
        title="Send a Stream"
        subheader="Pick a recipient, token and network"
        childrenGap={0}
      >
        <StreamItem />

        <Image
          unoptimized
          src="/gifs/stream-loop.gif"
          width={34}
          height={18}
          layout="fixed"
          alt="Superfluid stream"
        />

        <StreamItem />
      </OnboardingItem>

      <OnboardingItem
        title="Modify and Cancel Streams"
        subheader="Don't let your balance hit zero!"
      >
        <IconButton color="primary">
          <EditIcon />
        </IconButton>
        <IconButton color="error">
          <CancelIcon />
        </IconButton>
      </OnboardingItem>
    </Stack>
  );
};

export default OnboardingCards;
