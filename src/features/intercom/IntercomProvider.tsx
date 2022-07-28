import { FC, ReactElement } from "react";
import { IntercomProvider as OriginalIntercomProvider } from "react-use-intercom";
import IntercomHandler from "./IntercomHandler";

export const INTERCOM_APP_ID = process.env.NEXT_PUBLIC_INTERCOM_APP_ID || "";

interface IntercomProviderProps {
  children: ReactElement<any, any>;
}

const IntercomProvider: FC<IntercomProviderProps> = ({ children }) => {
  return (
    <OriginalIntercomProvider appId={INTERCOM_APP_ID} initializeDelay={250}>
      <IntercomHandler>{children}</IntercomHandler>
    </OriginalIntercomProvider>
  );
};

export default IntercomProvider;
