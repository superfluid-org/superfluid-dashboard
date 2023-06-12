import { useRouter } from "next/router";
import { FC, useEffect } from "react";

interface RedirectProps {
  to: string;
}

const Redirect: FC<RedirectProps> = ({ to }) => {
  const router = useRouter();

  useEffect(() => {
    router.push(to);
  }, [router, to]);

  return null;
};

export default Redirect;
