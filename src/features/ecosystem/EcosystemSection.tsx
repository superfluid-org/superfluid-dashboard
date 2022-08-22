import { Box, Stack, Typography, useTheme } from "@mui/material";
import { FC } from "react";
import EcosystemItem, { EcosystemApp } from "./EcosystemItem";

interface EcosystemSectionProps {
  title: string;
  apps: EcosystemApp[];
}

const EcosystemSection: FC<EcosystemSectionProps> = ({ title, apps }) => {
  const theme = useTheme();

  return (
    <Box>
      <Typography variant="h4" component="h2" sx={{ mb: 3 }} translate="yes">
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
