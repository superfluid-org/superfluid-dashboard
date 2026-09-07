import { buildQueryString } from "../../utils/URLUtils";

interface BridgePageQuery {
  fromChain?: number;
  fromToken?: string;
}

export const getBridgePagePath = (query: BridgePageQuery = {}) => {
  const queryString = buildQueryString(query);
  return `/bridge${queryString ? `?${queryString}` : ""}`;
};
