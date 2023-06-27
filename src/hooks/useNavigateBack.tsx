import { useRouter } from "next/router";
import { useCallback } from "react";
import { useLayoutContext } from "../features/layout/LayoutContext";

const useNavigateBack = (fallbackPath = "/") => {
  const router = useRouter();
  const { previousRouterPathRef } = useLayoutContext();

  return useCallback(
    () =>
      previousRouterPathRef.current
        ? void router.push(previousRouterPathRef.current)
        : void router.push(fallbackPath),
    [router, previousRouterPathRef, fallbackPath]
  );
};

export default useNavigateBack;
