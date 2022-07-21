import Head from "next/head";
import { FC } from "react";

interface SEOProps {
  title: string;
  description: string;

  OGTitle?: string;
  OGDescription?: string;
  OGUrl?: string;
  OGImage: string;
}

const SEO: FC<SEOProps> = ({
  title,
  description,
  OGTitle,
  OGDescription,
  OGUrl,
  OGImage,
}) => {
  return (
    <Head>
      <title>{title}</title>
      <meta property="description" content={description} />

      <meta name="twitter:card" content="summary_large_image" />

      <meta name="twitter:site" content="@Superfluid_HQ" />

      <meta property="og:title" content={OGTitle || title} />
      <meta property="og:description" content={OGDescription || description} />
      <meta property="og:url" content={OGUrl || window.location.href} />
      {OGImage && <meta property="og:image" content={OGImage} />}
    </Head>
  );
};

export default SEO;
