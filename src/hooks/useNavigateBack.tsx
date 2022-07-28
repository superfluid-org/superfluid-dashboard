import { useRouter } from "next/router";
import { useCallback } from "react";

const isDocumentReferrerSameAsOrigin = () => {
  try {
    const referrer = new URL(document.referrer);
    return referrer.origin === location.origin;
  } catch (invalid_url_error) {
    return false;
  }
};

const useNavigateBack = () => {
  const router = useRouter();

  return useCallback(
    () =>
      isDocumentReferrerSameAsOrigin()
        ? void router.back()
        : void router.push("/"),
    [router]
  );
};

export default useNavigateBack;
