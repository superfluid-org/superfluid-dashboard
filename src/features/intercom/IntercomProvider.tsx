import { FC, ReactNode, useEffect } from "react";
import { IntercomProvider as OriginalIntercomProvider } from "react-use-intercom";
import config from "../../utils/config";
import { IsCypress } from "../../utils/SSRUtils";
import IntercomHandler from "./IntercomHandler";

interface IntercomProviderProps {
  children: ReactNode;
}

const IntercomProvider: FC<IntercomProviderProps> = ({ children }) => {
  useEffect(() => {
    if (!config.intercom.appId) console.warn("Intercom not initialized.");
  }, []);

  const shouldInitializeAndBoot = !IsCypress;

  return (
    <OriginalIntercomProvider
      appId={config.intercom.appId}
      initializeDelay={250}
      shouldInitialize={shouldInitializeAndBoot}
      autoBoot={shouldInitializeAndBoot}
      autoBootProps={{
        horizontalPadding: 24,
        verticalPadding: 24,
        alignment: "right",
      }}
    >
      {shouldInitializeAndBoot ? (<IntercomHandler>{children}</IntercomHandler>) : children}
    </OriginalIntercomProvider>
  );
};

export default IntercomProvider;
