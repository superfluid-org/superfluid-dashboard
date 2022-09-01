import { useRouter } from "next/router";
import { FC, PropsWithChildren } from "react";
import ReduxPersistGate from "../../features/redux/ReduxPersistGate";
import config from "../../utils/config";
import SEO, { SEOProps } from "./SEO";

const StaticSEO: FC<PropsWithChildren<SEOProps>> = ({
  children,
  // General meta tags
  title = `Superfluid Dashboard`,
  description = `Superfluid is an asset streaming protocol that brings subscriptions, salaries and rewards to DAOs and crypto-native businesses.`,
  // Open Graph metadata
  ogTitle = title,
  ogDescription = description,
  ogUrl,
  ogImage = `${config.appUrl}/images/superfluid-thumbnail.png`,
  // Twitter card metadata
  twitterCard = "summary_large_image",
  twitterTitle = ogTitle,
  twitterDescription = ogDescription,
  twitterSite = `@Superfluid_HQ`,
  twitterCreator = `@Superfluid_HQ`,
}) => {
  const router = useRouter();

  return (
    <SEO
      {...{
        title,
        description,
        ogTitle,
        ogDescription,
        ogUrl: ogUrl || `${config.appUrl}${router.asPath}`,
        ogImage,
        twitterCard,
        twitterTitle,
        twitterDescription,
        twitterSite,
        twitterCreator,
      }}
    >
      <ReduxPersistGate>{children}</ReduxPersistGate>
    </SEO>
  );
};

export default StaticSEO;
