import { FC, ReactNode } from "react";
import { IntercomProvider as OriginalIntercomProvider } from "react-use-intercom";
import config from "../../utils/config";
import { IsCypress } from "../../utils/SSRUtils";
import IntercomHandler from "./IntercomHandler";

interface IntercomProviderProps {
  children: ReactNode;
}

const IntercomProvider: FC<IntercomProviderProps> = ({ children }) => {
  return (
    <OriginalIntercomProvider
      appId={config.intercom.appId}
      initializeDelay={250}
      shouldInitialize={!IsCypress}
    >
      <IntercomHandler>{children}</IntercomHandler>
    </OriginalIntercomProvider>
  );
};

export default IntercomProvider;
