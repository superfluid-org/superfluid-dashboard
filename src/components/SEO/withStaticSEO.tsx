import React, { FC } from "react";
import { SEOProps } from "./SEO";
import StaticSEO from "./StaticSEO";

const withStaticSEO = (config: SEOProps, Component: React.ComponentType) => {
  const ComponentWithSEO: FC = (props) => {
    return (
      <StaticSEO {...config}>
        <Component {...props} />
      </StaticSEO>
    );
  };

  return ComponentWithSEO;
};

export default withStaticSEO;
