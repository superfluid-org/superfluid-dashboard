import { Avatar, AvatarProps } from "@mui/material";
import { memo } from "react";
import { ensApi } from "../../features/ens/ensApi.slice";
import Blockies from "react-blockies";
import { getAddress } from "../../utils/memoizedEthersUtils";

interface AddressAvatarProps {
  address: string;
  AvatarProps?: AvatarProps;
}

export default memo(function AddressAvatar({
  address,
  AvatarProps = {},
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
        <Blockies seed={getAddress(address)} size={12} scale={3} />
      </Avatar>
    );
  }
});
