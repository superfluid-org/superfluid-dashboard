import { useEffect, useState } from "react";

const useScrollPosition = () => {
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    function scrollHandler() {
      setScrollPosition(
        document.body.scrollTop || document.documentElement.scrollTop
      );
    }

    window.addEventListener("scroll", scrollHandler);

    return () => {
      window.removeEventListener("scroll", scrollHandler);
    };
  }, []);

  return scrollPosition;
};

export default useScrollPosition;
