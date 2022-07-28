import { isString } from "lodash";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { networks } from "../../../../../features/network/networks";
import { subgraphApi } from "../../../../../features/redux/store";
import Page404 from "../../../../404";
import { getStreamPagePath } from "../../../../stream/[_network]/[_stream]";

// For not breaking old V1 link structure.
const V1StreamPage: NextPage = () => {
  const router = useRouter();

  const [queryStreams] = subgraphApi.useLazyStreamsQuery();
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (router.isReady) {
      const { _v1Network, _tx, _log } = router.query;
      const network = networks.find(
        (x) => x.v1ShortName === (isString(_v1Network) ? _v1Network : "")
      );

      if (network && isString(_tx) && isString(_log)) {
        // NOTE: Check StreamPage before changing this query.
        queryStreams(
          {
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
          },
          true
        )
          .then((result) => {
            const stream = result.data?.items?.[0];
            if (stream) {
              const txId = `${_tx}-${_log}`;
              router.replace(
                getStreamPagePath({
                  network: network.slugName,
                  stream: txId,
                })
              );
            } else {
              setNotFound(true);
            }
          })
          .catch(() => {
            setNotFound(true);
          });
      } else {
        setNotFound(true);
      }
    }
  }, [router.isReady, queryStreams, router]);

  if (notFound) {
    return <Page404 />;
  }

  return <></>; // TODO(KK): Show a spinner or message here?
};

export default V1StreamPage;
