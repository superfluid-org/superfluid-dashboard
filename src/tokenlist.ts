import { type SuperTokenList, extendedSuperTokenList as extendedSuperTokenList_, fetchLatestExtendedSuperTokenList } from "@superfluid-finance/tokenlist";

export const extendedSuperTokenList = () => {
    if (fetchedSuperTokenList) {
        return fetchedSuperTokenList;
    }
    return extendedSuperTokenList_;
}

export let fetchedSuperTokenList: SuperTokenList | undefined;

// Only refresh the token list in the browser. On the server / at build time the fetch is pointless
// (the result is discarded when the worker exits) and just spams "Error fetching tokenlist" AbortErrors.
if (typeof window !== "undefined") {
    fetchLatestExtendedSuperTokenList()
        .then(fetchedTokenList => {
            fetchedSuperTokenList = fetchedTokenList;
        })
        .catch(() => {
            // Package already falls back to the bundled list internally; ignore.
        });
}