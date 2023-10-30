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
      data-cy="minigame-component"
      {...props}
      component="iframe"
      ref={ref}
      sx={{
        backgroundColor: "transparent",
        border: "0",
        height: "75%",
        width: "100%",
      }}
      src={getUrl().toString()}
      allowFullScreen={true}
    />
  );
});
