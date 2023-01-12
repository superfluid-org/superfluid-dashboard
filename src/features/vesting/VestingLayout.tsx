import {
  Box,
  Button,
  Container,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import { FC, PropsWithChildren } from "react";
import { useExpectedNetwork } from "../network/ExpectedNetworkContext";
import NextLink from "next/link";
import AddIcon from "@mui/icons-material/Add";
import { useFeatureFlags } from "../featureFlags/FeatureFlagContext";
import Page404 from "../../pages/404";
import ReduxPersistGate from "../redux/ReduxPersistGate";

export const VestingLayout: FC<PropsWithChildren> = ({ children }) => {
  const { isVestingEnabled } = useFeatureFlags();

  return (
    <ReduxPersistGate>
      {isVestingEnabled ? children : <Page404 />}
    </ReduxPersistGate>
  );
};
