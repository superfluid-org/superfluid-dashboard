import { Stack, Paper, useTheme } from "@mui/material";
import { FC, PropsWithChildren } from "react";

export const WrapInputCard: FC<PropsWithChildren> = ({ children }) => {
  const theme = useTheme();

  return (
    <Stack
      component={Paper}
      elevation={theme.palette.mode === "dark" ? 4 : 1}
      spacing={1}
      sx={{
        px: 2.5,
        py: 1.5,
        border: "1px solid",
        borderColor: theme.palette.other.outline,
        borderRadius: "15px",
      }}
    >
      {children}
    </Stack>
  );
};
