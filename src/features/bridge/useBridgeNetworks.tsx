import LIFI from "@lifi/sdk";
import { useEffect, useState } from "react";
import { Network, networks } from "../network/networks";

const useBridgeNetworks = (lifi: LIFI): [Network[], boolean] => {
  const [bridgeNetworks, setBridgeNetworks] = useState<Network[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);

    lifi
      .getChains()
      .then((chainsResponse) => {
        setBridgeNetworks(
          networks.filter((network) =>
            chainsResponse.some((lifiNetwork) => lifiNetwork.id === network.id)
          )
        );
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [lifi]);

  return [bridgeNetworks, isLoading];
};

export default useBridgeNetworks;
