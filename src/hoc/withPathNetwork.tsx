import { isString } from "lodash";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { FC, useEffect, useState } from "react";
import Redirect from "../features/common/Redirect";
import { Network, networksBySlug } from "../features/network/networks";

export interface NetworkPage {
  network: Network;
}

const withPathNetwork = (Component: FC<NetworkPage>) => {
  const ComponentWithPathNetwork: NextPage = ({ ...props }) => {
    const router = useRouter();
    const { _network } = router.query;
    const [pathNetwork, setPathNetwork] = useState<Network | null>(null);

    useEffect(() => {
      if (router.isReady) {
        if (isString(_network)) {
          const network = networksBySlug.get(_network);

          if (network) {
            setPathNetwork(network);
            return;
          }
        }

        router.push("/not-found");
      }
    }, [_network, router]);

    if (!pathNetwork) return null;
    return <Component network={pathNetwork} {...props} />;
  };

  return ComponentWithPathNetwork;
};

export default withPathNetwork;
