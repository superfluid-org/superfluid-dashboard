import { FC, ReactElement } from "react";
import { IntercomProvider as OriginalIntercomProvider } from "react-use-intercom";
import config from "../../utils/config";
import IntercomHandler from "./IntercomHandler";

interface IntercomProviderProps {
  children: ReactElement<any, any>;
}

const IntercomProvider: FC<IntercomProviderProps> = ({ children }) => {
  return (
    <OriginalIntercomProvider
      appId={config.intercom.appId}
      initializeDelay={250}
    >
      <IntercomHandler>{children}</IntercomHandler>
    </OriginalIntercomProvider>
  );
};

export default IntercomProvider;
