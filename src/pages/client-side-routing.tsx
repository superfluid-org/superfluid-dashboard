import { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect } from "react";

const ClientSideRouting: NextPage = () => {
  const router = useRouter();

  useEffect(() => {
    if (router.isReady) {
      router.replace(router.asPath);
    }
  }, [router.isReady]);

  return <></>; // TODO(KK): Show a spinner or message here?
};

export default ClientSideRouting;