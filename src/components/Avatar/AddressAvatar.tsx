import { Avatar, AvatarProps } from "@mui/material";
import { memo } from "react";
import Blockies from "react-blockies";
import { ensApi } from "../../features/ens/ensApi.slice";
import { lensApi } from "../../features/lens/lensApi.slice";

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
  const { data: ensAvatarUrl, isFetching: ensFetching } =
    ensApi.useGetAvatarQuery(address);
  const { data: lensData } = lensApi.useLookupAddressQuery(address);

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
