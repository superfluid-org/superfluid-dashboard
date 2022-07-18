import { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect } from "react";

const V1StreamPage: NextPage = () => {
  const router = useRouter();

  useEffect(() => {
    if (router.isReady) {
      console.log({
        query: router.query
      })
    }
  }, [router.isReady]);

  return <></>; // TODO(KK): Show a spinner or message here?
};

export default V1StreamPage;