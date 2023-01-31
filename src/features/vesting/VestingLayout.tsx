import { FC, PropsWithChildren } from "react";
import { useFeatureFlags } from "../featureFlags/FeatureFlagContext";
import Page404 from "../../pages/404";
import ReduxPersistGate from "../redux/ReduxPersistGate";

interface VestingLayoutProps extends PropsWithChildren {}

const VestingLayout: FC<VestingLayoutProps> = ({ children }) => {
  const { isVestingEnabled } = useFeatureFlags();

  return (
    <ReduxPersistGate>
      {isVestingEnabled ? <>{children}</> : <Page404 />}
    </ReduxPersistGate>
  );
};

export default VestingLayout;
