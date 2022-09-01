import { FC, PropsWithChildren } from "react";
import { PersistGate } from "redux-persist/integration/react";
import { SSR } from "../../utils/SSRUtils";
import { reduxPersistor } from "./store";

/**
 * Waits for Redux state to be restored from persistance.
 * Read more: https://github.com/rt2zz/redux-persist
 * NOTE: It is critical for RTK-Query to have PersistGate around it when using persistance (had some weird race-condition anomalies otherwise where the cache didn't invalidate).
 */
const ReduxPersistGate: FC<PropsWithChildren> = ({ children }) => {
  return <PersistGate persistor={reduxPersistor}>{children}</PersistGate>;
};

export default ReduxPersistGate;
