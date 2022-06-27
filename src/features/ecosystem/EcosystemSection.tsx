import { Box, Typography, Stack } from "@mui/material";
import { FC } from "react";
import EcosystemItem, { EcosystemApp } from "./EcosystemItem";

interface EcosystemSectionProps {
  title: string;
  apps: EcosystemApp[];
}

const EcosystemSection: FC<EcosystemSectionProps> = ({ title, apps }) => (
  <Box>
    <Typography variant="h4" sx={{ mb: 3 }}>
      {title}
    </Typography>

    <Stack
      gap={4}
      sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)" }}
    >
      {apps.map((app, index) => (
        <EcosystemItem key={index} app={app} />
      ))}
    </Stack>
  </Box>
);

export default EcosystemSection;
