import { FC } from "react";
import { PersistGate } from "redux-persist/integration/react";
import { SSR } from "../../utils/SSRUtils";
import { reduxPersistor } from "./store";

/**
 * Waits for Redux state to be restored from persistance.
 * Read more: https://github.com/rt2zz/redux-persist
 * NOTE: It is critical for RTK-Query to have PersistGate around it when using persistance (had some weird race-condition anomalies otherwise where the cache didn't invalidate).
 * NOTE: While building static assets (SSR), the persistance is removed via function children and can be handled deeper in the app.
 */
const ReduxPersistGate: FC = ({ children }) => {
  return (
    <PersistGate persistor={reduxPersistor}>
      {(bootstrapped) => (!!(bootstrapped || SSR) ? children : null)}
    </PersistGate>
  );
};

export default ReduxPersistGate;
