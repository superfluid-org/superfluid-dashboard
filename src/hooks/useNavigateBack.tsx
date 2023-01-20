import { useRouter } from "next/router";
import { useCallback } from "react";
import { useLayoutContext } from "../features/layout/LayoutContext";

const useNavigateBack = (fallbackPath = "/") => {
  const router = useRouter();
  const { previousRouterPath } = useLayoutContext();

  return useCallback(
    () =>
      previousRouterPath
        ? void router.push(previousRouterPath)
        : void router.push(fallbackPath),
    [router, previousRouterPath, fallbackPath]
  );
};

export default useNavigateBack;
