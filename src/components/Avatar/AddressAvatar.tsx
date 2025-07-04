import { Avatar, AvatarProps } from "@mui/material";
import { memo } from "react";
import Blockies from "react-blockies";
import { isTOREXAddress } from "../../features/torex/torexAddresses";
import useAddressName from "../../hooks/useAddressName";

interface BlockiesProps {
  size?: number;
  scale?: number;
}

interface AddressAvatarProps {
  address: string;
  AvatarProps?: AvatarProps;
  BlockiesProps?: BlockiesProps;
}

interface RainbowKitAvatarComponentProps {
  address: string;
  ensImage?: string | null;
  size?: number;
}

export default memo(function AddressAvatar({
  address,
  AvatarProps = {},
  BlockiesProps = { size: 12, scale: 3 },
}: AddressAvatarProps & RainbowKitAvatarComponentProps) {
  const addressNameData = useAddressName(address);

  // Check if this is a ToreX address first - ToreX avatars take priority
  // TODO: Move torexes to whois api and remove this
  if (isTOREXAddress(address)) {
    return (
      <Avatar
        alt="SuperBoring Torex"
        variant="rounded"
        src="/icons/superboring32x32.png"
        {...AvatarProps}
      />
    );
  }

  if (addressNameData.primaryAvatarUrl) {
    return (
      <Avatar
        alt="profile avatar"
        variant="rounded"
        src={addressNameData.primaryAvatarUrl}
        {...AvatarProps}
      />
    );
  } else {
    return (
      <Avatar alt="generated blockie avatar" variant="rounded" {...AvatarProps}>
        {/* Read about the Blockies API here: https://github.com/stephensprinkle-zz/react-blockies */}
        <Blockies seed={address.toLowerCase()} {...BlockiesProps} />
      </Avatar>
    );
  }
});
