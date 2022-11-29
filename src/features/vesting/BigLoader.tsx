import {
  CircularProgress,
  Container,
  ContainerProps,
  Stack,
} from "@mui/material";
import { merge } from "lodash";
import { FC } from "react";

export const BigLoader: FC<{
  ContainerProps?: ContainerProps;
}> = ({ ContainerProps }) => {
  const containerProps: ContainerProps = merge(
    {
      maxWidth: "md",
      sx: {
        minHeight: "300px",
        minWidth: "300px",
        mb: 4,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      },
    },
    ContainerProps
  );

  return (
    <Container {...containerProps}>
      <CircularProgress size="80px" />
    </Container>
  );
};
