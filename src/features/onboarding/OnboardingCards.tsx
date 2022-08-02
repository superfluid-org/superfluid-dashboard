import CancelIcon from "@mui/icons-material/Cancel";
import EditIcon from "@mui/icons-material/Edit";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import {
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Paper,
  Skeleton,
  Stack,
  useTheme,
} from "@mui/material";
import { Address } from "@superfluid-finance/sdk-core";
import Image from "next/image";
import Link from "next/link";
import { FC, useState } from "react";
import { useAccount } from "wagmi";
import AddressAvatar from "../../components/AddressAvatar/AddressAvatar";
import TokenIcon from "../token/TokenIcon";
import { useConnectButton } from "../wallet/ConnectButtonProvider";

interface OnboardingItemProps {
  title: string;
  subheader: string;
  href: string;
  childrenGap?: number;
  onClick?: () => void;
}

const OnboardingItem: FC<OnboardingItemProps> = ({
  title,
  subheader,
  childrenGap = 1.5,
  href,
  onClick,
  children,
}) => {
  const theme = useTheme();
  const [isHovering, setIsHovering] = useState(false);

  const onMouseEnter = () => setIsHovering(true);
  const onMouseLeave = () => setIsHovering(false);

  return (
    <Link href={href} passHref>
      <Card
        elevation={isHovering ? 3 : 1}
        component="a"
        onClick={onClick}
        sx={{
          textDecoration: "none",
          [theme.breakpoints.down("md")]: {
            textAlign: "center",
            scrollSnapAlign: "center",
          },
        }}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
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
    </Link>
  );
};

interface StreamItemProps {
  address: Address;
}

const StreamItem: FC<StreamItemProps> = ({ address }) => (
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
      address={address}
    />
    <Stack flex={1} alignItems="flex-start">
      <Skeleton width="100%" height={12} animation={false} />
      <Skeleton width="50%" height={12} animation={false} />
    </Stack>
  </Paper>
);

interface OnboardingCardsProps {
  vertical?: boolean;
  onClick?: () => void;
}

const OnboardingCards: FC<OnboardingCardsProps> = ({
  vertical = false,
  onClick,
}) => {
  const theme = useTheme();
  const { address: accountAddress } = useAccount();
  const { openConnectModal } = useConnectButton();

  return (
    <Stack
      alignItems="center"
      justifyContent="center"
      gap={3.5}
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 290px)",
        [theme.breakpoints.down("md")]: {
          maxWidth: "100vw",
          mx: -2,
          py: 2,
          px: 3.5 + 2, // Column gap + 2 spacing for the next card to peek out.
          overflowY: "auto",
          gridTemplateColumns: "repeat(3, 100%)",
          justifyContent: "flex-start",
          alignItems: "flex-start",
          scrollSnapType: "x mandatory",
          scrollPadding: `0px ${theme.spacing(3.5)}`,
          ...(vertical ? { gridTemplateColumns: "290px", px: 0 } : {}),
        },
      }}
    >
      <OnboardingItem
        title="Get Super Tokens"
        subheader="Wrap any token in your wallet"
        href="/wrap?upgrade"
        onClick={onClick}
      >
        <TokenIcon size={32} tokenSymbol="DAI" />
        <SwapVertIcon color="primary" sx={{ transform: "rotate(90deg)" }} />
        <TokenIcon size={32} tokenSymbol="DAIx" />
      </OnboardingItem>

      <OnboardingItem
        title="Send a Stream"
        subheader="Pick a recipient, token and network"
        href="/send"
        onClick={onClick}
        childrenGap={0}
      >
        <StreamItem address="0xd8da6bf26964af9d7eed9e03e53415d37aa96045" />

        <Image
          unoptimized
          src="/gifs/stream-loop.gif"
          width={34}
          height={18}
          layout="fixed"
          alt="Superfluid stream"
        />

        <StreamItem address="0xF9Ce34dFCD3cc92804772F3022AF27bCd5E43Ff2" />
      </OnboardingItem>
      <OnboardingItem
        title="Modify and Cancel Streams"
        subheader="Don't let your balance hit zero!"
        onClick={() => {
          if (!accountAddress) openConnectModal();
          onClick && onClick();
        }}
        href="/"
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
