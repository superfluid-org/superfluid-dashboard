import { isString } from "lodash";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { networks } from "../../../../../features/network/networks";
import { subgraphApi } from "../../../../../features/redux/store";
import Error from "next/error";

const V1StreamPage: NextPage = () => {
  const router = useRouter();

  const [queryStreams] = subgraphApi.useLazyStreamsQuery();
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (router.isReady) {
      const { _v1Network, _tx, _log } = router.query;
      if (isString(_v1Network) && isString(_tx) && isString(_log)) {
        const network = networks.find((x) => x.v1ShortName === _v1Network);
        if (network) {
          queryStreams({
            chainId: network.id,
            filter: {
              flowUpdatedEvents_: {
                transactionHash: _tx.toLowerCase(),
                logIndex: _log.toLowerCase(),
              },
            },
            pagination: {
              take: 1,
            },
          })
            .then((result) => {
              const stream = result.data?.items?.[0];
              if (stream) {
                router.replace(`/stream/${network.slugName}/${stream.id}`);
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
  }, [router.isReady, queryStreams, router]);

  if (notFound) {
    return <Error statusCode={404} />;
  }

  return <></>; // TODO(KK): Show a spinner or message here?
};

export default V1StreamPage;
