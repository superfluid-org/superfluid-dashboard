import { FC } from "react";
import { PersistGate } from "redux-persist/integration/react";
import { reduxPersistor } from "./store";

/**
 * Waits for Redux state to be restored from persistance.
 * Read more: https://github.com/rt2zz/redux-persist
 * NOTE: It is critical for RTK-Query to have PersistGate around it when using persistance (had some weird race-condition anomalies otherwise where the cache didn't invalidate). 
 */
 const ReduxPersistGate: FC = ({ children }) => {
    return (
      <PersistGate loading={null} persistor={reduxPersistor}>
        {children}
      </PersistGate>
    );
  };

  export default ReduxPersistGate;