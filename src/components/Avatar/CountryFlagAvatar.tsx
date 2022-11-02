import { Avatar } from "@mui/material";
import { FC } from "react";

const CDN_URL = "https://hatscripts.github.io/circle-flags/flags/";
const FILE_SUFFIX = "svg";

interface CountryFlagAvatarProps {
  country: string;
  size?: number;
}

const CountryFlagAvatar: FC<CountryFlagAvatarProps> = ({
  country,
  size = 24,
}) => {
  return (
    <Avatar
      alt={`${country} flag`}
      variant="rounded"
      sx={{ width: size, height: size }}
      src={`${CDN_URL}${country.toLowerCase()}.${FILE_SUFFIX}`}
    />
  );
};

export default CountryFlagAvatar;
