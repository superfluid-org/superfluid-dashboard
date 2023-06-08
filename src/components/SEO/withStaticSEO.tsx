import { NextPage } from "next";
import { NextPageWithLayout } from "../../pages/_app";
import { SEOProps } from "./SEO";
import StaticSEO from "./StaticSEO";

const withStaticSEO = (
  config: SEOProps,
  Component: NextPage | NextPageWithLayout
) => {
  const ComponentWithSEO: NextPageWithLayout = (props) => {
    return (
      <StaticSEO {...config}>
        <Component {...props} />
      </StaticSEO>
    );
  };

  if (!!(Component as NextPageWithLayout).getLayout) {
    ComponentWithSEO.getLayout = (Component as NextPageWithLayout).getLayout;
  }

  return ComponentWithSEO;
};

export default withStaticSEO;
