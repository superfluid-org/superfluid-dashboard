import { isString } from "lodash";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { FC } from "react";
import Redirect from "../features/common/Redirect";
import { Network, networksBySlug } from "../features/network/networks";

export interface NetworkPage {
  network: Network;
}

const withPathNetwork = (Component: FC<NetworkPage>) => {
  const ComponentWithPathNetwork: NextPage = ({ ...props }) => {
    const router = useRouter();
    const { _network: pathNetwork } = router.query;

    if (isString(pathNetwork)) {
      const network = networksBySlug.get(pathNetwork);

      if (network) {
        return <Component network={network} {...props} />;
      }
    }

    return <Redirect to="/" />;
  };

  return ComponentWithPathNetwork;
};

export default withPathNetwork;
