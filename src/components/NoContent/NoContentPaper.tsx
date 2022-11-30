import { useTheme, useMediaQuery, Paper, Typography } from "@mui/material";
import { FC } from "react";

interface NoContentPaperProps {
  title: string;
  description: string;
}

const NoContentPaper: FC<NoContentPaperProps> = ({ title, description }) => {
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Paper
      elevation={1}
      sx={{
        px: 4,
        py: 7,
        [theme.breakpoints.down("md")]: {
          px: 2,
          py: 3,
        },
      }}
    >
      <Typography variant={isBelowMd ? "h5" : "h4"} textAlign="center">
        {title}
      </Typography>
      <Typography color="text.secondary" textAlign="center">
        {description}
      </Typography>
    </Paper>
  );
};

export default NoContentPaper;
