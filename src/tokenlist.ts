import { extendedSuperTokenList as extendedSuperTokenList_, fetchLatestExtendedSuperTokenList } from "@superfluid-finance/tokenlist";

export let extendedSuperTokenList = extendedSuperTokenList_;
fetchLatestExtendedSuperTokenList().then(fetchedTokenList => extendedSuperTokenList = fetchedTokenList);