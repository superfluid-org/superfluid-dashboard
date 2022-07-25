import Head from "next/head";
import { useRouter } from "next/router";
import { FC, ReactChild } from "react";
import config from "../../utils/config";

type TwitterCard = "summary" | "summary_large_image" | "app" | "player";

interface SEOProps {
  title?: string;
  description?: string;

  ogTitle?: string;
  ogDescription?: string;
  ogUrl?: string;
  ogImage?: string;

  twitterCard?: TwitterCard;
  twitterSite?: string;
  twitterCreator?: string;
  twitterTitle?: string;
  twitterDescription?: string;

  children: ReactChild;
}

const SEO: FC<SEOProps> = ({
  children,
  // General meta tags
  title = `Superfluid`,
  description = `Handle subscriptions, salaries, rewards and any composable stream of value, with continuous settlement and per-second netting for extreme capital efficiency.`,
  // Open Graph metadata
  ogTitle = `Superfluid Dashboard`,
  ogDescription = description,
  ogUrl,
  ogImage = `${config.appUrl}/images/superfluid-thumbnail.png`,
  // Twitter card metadata
  twitterCard = "summary_large_image",
  twitterTitle = `Superfluid - Rails for Real-Time Finance`,
  twitterDescription = `Superfluid is a new Ethereum Protocol that extends Ethereum tokens to include novel functionalities. Superfluid enables functionalities like money streaming and reward distribution.`,
  twitterSite = `Superfluid_HQ`,
  twitterCreator = `@Superfluid_HQ`,
}) => {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta property="description" content={description} />

        <meta property="og:title" content={ogTitle} />
        <meta property="og:description" content={ogDescription} />
        <meta
          property="og:url"
          content={ogUrl || `${config.appUrl}${router.asPath}`}
        />
        <meta property="og:image" content={ogImage} />

        <meta name="twitter:card" content={twitterCard} />
        <meta name="twitter:title" content={twitterTitle} />
        <meta name="twitter:description" content={twitterDescription} />
        <meta name="twitter:site" content={twitterSite} />
        <meta name="twitter:creator" content={twitterCreator} />
      </Head>
      {children}
    </>
  );
};

export default SEO;
