import { Avatar, AvatarProps } from "@mui/material";
import { memo } from "react";
import Blockies from "react-blockies";
import { ensApi } from "../../features/ens/ensApi.slice";

interface BlockiesProps {
  size?: number;
  scale?: number;
}

interface AddressAvatarProps {
  address: string;
  AvatarProps?: AvatarProps;
  BlockiesProps?: BlockiesProps;
}

export default memo(function AddressAvatar({
  address,
  AvatarProps = {},
  BlockiesProps = { size: 12, scale: 3 },
}: AddressAvatarProps) {
  const { data: ensAvatarUrl } = ensApi.useGetAvatarQuery(address);
  if (ensAvatarUrl) {
    return (
      <Avatar
        alt="ens avatar"
        variant="rounded"
        src={ensAvatarUrl}
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
