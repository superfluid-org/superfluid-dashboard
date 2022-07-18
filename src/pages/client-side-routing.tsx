import { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect } from "react";

const ClientSideRouting: NextPage = () => {
  const router = useRouter();

  useEffect(() => {
    if (router.isReady) {
      console.log({
        asPath: router.asPath
      })

      router.push(router.asPath, undefined, {
        shallow: true,
      });
    }
  }, [router.isReady]);

  return <></>; // TODO(KK): Show a spinner or message here?
};

export default ClientSideRouting;
