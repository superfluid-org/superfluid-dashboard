import { useEffect, useState } from "react";

const useBodyScrolled = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    function scrollHandler() {
      const scrollPosition =
        document.body.scrollTop || document.documentElement.scrollTop;

      if (scrollPosition > 0 && !isScrolled) {
        setIsScrolled(true);
      } else if (scrollPosition <= 0 && isScrolled) {
        setIsScrolled(false);
      }
    }

    window.addEventListener("scroll", scrollHandler);

    return () => {
      window.removeEventListener("scroll", scrollHandler);
    };
  }, [isScrolled]);

  return isScrolled;
};

export default useBodyScrolled;
