import { MouseEvent, useState } from "react";

const useMenuUtils = (): [
  boolean,
  HTMLElement | null,
  (e: MouseEvent<HTMLElement>) => void,
  () => void
] => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleOpen = (event: MouseEvent<HTMLElement>) =>
    setAnchorEl(event.currentTarget);

  const handleClose = () => setAnchorEl(null);

  const open = Boolean(anchorEl);

  return [open, anchorEl, handleOpen, handleClose];
};

export default useMenuUtils;
