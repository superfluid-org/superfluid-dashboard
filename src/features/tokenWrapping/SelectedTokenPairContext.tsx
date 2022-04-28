import { createContext, FC, useContext, useEffect, useState } from "react";
import { getNetworkDefaultTokenPair } from "../network/networks";
import { WrappedSuperTokenPair } from "../redux/endpoints/adHocSubgraphEndpoints";
import { useNetworkContext } from "../network/NetworkContext";

const SelectedTokenContext = createContext<{
  selectedTokenPair: WrappedSuperTokenPair | undefined;
  setSelectedTokenPair: (tokenPair: WrappedSuperTokenPair | undefined) => void;
}>(null!);

export const SelectedTokenContextProvider: FC = ({ children }) => {
  const { network } = useNetworkContext();
  const [selectedTokenPair, setSelectedTokenPair] = useState<
    WrappedSuperTokenPair | undefined
  >(getNetworkDefaultTokenPair(network));

  useEffect(() => {
    if (!selectedTokenPair) {
      setSelectedTokenPair(getNetworkDefaultTokenPair(network));
    }
  }, [selectedTokenPair]);

  return (
    <SelectedTokenContext.Provider
      value={{ selectedTokenPair, setSelectedTokenPair }}
    >
      {children}
    </SelectedTokenContext.Provider>
  );
};

export const useSelectedTokenContext = () => useContext(SelectedTokenContext);
