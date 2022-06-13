import { GetStaticPaths, GetStaticProps } from "next";
import { ParsedUrlQuery } from "querystring";
import { networks, networksBySlug } from "../network/networks";

interface NetworkPageParams extends ParsedUrlQuery {
  _network: string;
}

export const getNetworkStaticPaths: GetStaticPaths = async () => {
  return {
    paths: networks.map(({ slugName }) => ({
      params: { _network: slugName },
    })),
    fallback: false,
  };
};

export const getNetworkStaticProps: GetStaticProps = async (context) => ({
  props: {
    _network: (context.params as NetworkPageParams)._network,
  },
});
