import { Avatar, AvatarProps } from "@mui/material";
import { memo } from "react";
import Blockies from "react-blockies";
import { ensApi } from "../../features/ens/ensApi.slice";
import { lensApi } from "../../features/lens/lensApi.slice";
import { isTOREXAddress } from "../../features/torex/torexAddresses";

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
  const { currentData: ensAvatarUrl, isFetching: ensFetching } =
    ensApi.useGetAvatarQuery(address);
  const { currentData: lensData } = lensApi.useLookupAddressQuery(address);

  // Check if this is a ToreX address first - ToreX avatars take priority
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

  if (ensAvatarUrl) {
    return (
      <Avatar
        alt="ens avatar"
        variant="rounded"
        src={ensAvatarUrl}
        {...AvatarProps}
      />
    );
  } else if (!ensFetching && lensData?.avatarUrl) {
    return (
      <Avatar
        alt="lens avatar"
        variant="rounded"
        src={lensData.avatarUrl}
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
