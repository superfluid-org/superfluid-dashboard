import { FC } from "react";
import { Provider } from "react-redux";
import { reduxStore } from "./store";

const ReduxProvider: FC = ({ children }) => {
  return <Provider store={reduxStore}>{children}</Provider>;
};

export default ReduxProvider;
