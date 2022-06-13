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
  const ComponentWithPathNetwork: FC<{ _network: string }> = ({ _network }) => {
    const network = networksBySlug.get(_network);

    if (network) {
      return <Component network={network} />;
    }

    return <Redirect to="not-found" />;
  };

  return ComponentWithPathNetwork;
};

export default withPathNetwork;
