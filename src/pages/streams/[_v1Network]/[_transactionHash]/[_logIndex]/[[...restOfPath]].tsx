import { isString } from "lodash";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { networks } from "../../../../../features/network/networks";
import { subgraphApi } from "../../../../../features/redux/store";
import Page404 from "../../../../404";

const V1StreamPage: NextPage = () => {
  const router = useRouter();

  const [queryStreams] = subgraphApi.useLazyStreamsQuery();
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (router.isReady) {
      const { _v1Network, _transactionHash, _logIndex } = router.query;
      if (
        isString(_v1Network) &&
        isString(_transactionHash) &&
        isString(_logIndex)
      ) {
        const network = networks.find((x) => x.v1ShortName === _v1Network);
        if (network) {
          queryStreams({
            chainId: network.id,
            filter: {
              flowUpdatedEvents_: {
                transactionHash: _transactionHash.toLowerCase(),
                logIndex: _logIndex.toLowerCase(),
              },
            },
            pagination: {
              take: 1,
            },
          })
            .then((result) => {
              const stream = result.data?.items?.[0];
              if (stream) {
                router.replace(
                  `/${network.slugName}/stream?stream=${stream.id}`
                );
              } else {
                setNotFound(true);
              }
            })
            .catch(() => {
              setNotFound(true);
            });
        }
      } else {
        setNotFound(true);
      }
    }
  }, [router.isReady]);

  if (notFound) {
    return <Page404 />;
  }

  return <></>; // TODO(KK): Show a spinner or message here?
};

export default V1StreamPage;
