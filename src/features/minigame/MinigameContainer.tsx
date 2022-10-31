import { Container } from "@mui/material";
import { forwardRef } from "react";
import { useMinigame } from "./MinigameContext";

export default forwardRef<HTMLIFrameElement>(function MinigameContainer(
  props,
  ref
) {
  const { getUrl } = useMinigame();
  return (
    <Container
      {...props}
      component="iframe"
      ref={ref}
      sx={{
        border: "0",
        height: "95%",
        width: "100%",
      }}
      src={getUrl().toString()}
      allowFullScreen={true}
      allowTransparency={true}
    />
  );
});
