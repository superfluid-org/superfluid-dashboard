import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import { Avatar, Paper, useTheme } from "@mui/material";
import { FC, useState } from "react";

interface SwitchWrapModeBtnProps {
  onClick?: () => void;
}

export const SwitchWrapModeBtn: FC<SwitchWrapModeBtnProps> = ({ onClick }) => {
  const theme = useTheme();

  return (
    <Paper
      component={Avatar}
      elevation={theme.palette.mode === "light" ? 1 : 16}
      sx={{
        width: 30,
        height: 30,
        my: -1,
        cursor: "pointer",
        ...(theme.palette.mode === "dark" && {
          boxShadow: "none",
        }),
      }}
      onClick={onClick}
    >
      <ArrowDownwardIcon
        color={theme.palette.mode === "light" ? "primary" : "inherit"}
        fontSize="small"
      />
    </Paper>
  );
};
