import Head from "next/head";
import { FC, PropsWithChildren } from "react";

type TwitterCard = "summary" | "summary_large_image" | "app" | "player";

interface MetaProps {
  name?: string;
  property?: string;
  content: any;
}
const Meta: FC<MetaProps> = ({ name, property, content }) =>
  content ? <meta name={name} property={property} content={content} /> : null;

export interface SEOProps {
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
}

const SEO: FC<PropsWithChildren<SEOProps>> = ({
  children,
  // General meta tags
  title,
  description,
  // Open Graph metadata
  ogTitle,
  ogDescription,
  ogUrl,
  ogImage,
  // Twitter card metadata
  twitterCard,
  twitterTitle,
  twitterDescription,
  twitterSite,
  twitterCreator,
}) => {
  return (
    <>
      <Head>
        {title && <title>{title}</title>}
        <Meta name="description" content={description} />

        <Meta property="og:title" content={ogTitle} />
        <Meta property="og:description" content={ogDescription} />
        <Meta property="og:url" content={ogUrl} />
        <Meta property="og:image" content={ogImage} />

        <Meta name="twitter:card" content={twitterCard} />
        <Meta name="twitter:title" content={twitterTitle} />
        <Meta name="twitter:description" content={twitterDescription} />
        <Meta name="twitter:site" content={twitterSite} />
        <Meta name="twitter:creator" content={twitterCreator} />
      </Head>
      {children}
    </>
  );
};

export default SEO;
