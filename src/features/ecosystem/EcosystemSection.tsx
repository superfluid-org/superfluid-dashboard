import { Box, Typography, Stack, useTheme } from "@mui/material";
import { FC } from "react";
import useMediaBreakpoints from "../../hooks/useMediaBreakpoints";
import { useLayoutContext } from "../layout/LayoutContext";
import EcosystemItem, { EcosystemApp } from "./EcosystemItem";

interface EcosystemSectionProps {
  title: string;
  apps: EcosystemApp[];
}

const EcosystemSection: FC<EcosystemSectionProps> = ({ title, apps }) => {
  const theme = useTheme();
  const { isPhone } = useMediaBreakpoints();

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
        {title}
      </Typography>

      <Stack
        gap={4}
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          [theme.breakpoints.down("sm")]: { gridTemplateColumns: "1fr" },
        }}
      >
        {apps.map((app, index) => (
          <EcosystemItem key={index} app={app} />
        ))}
      </Stack>
    </Box>
  );
};

export default EcosystemSection;
