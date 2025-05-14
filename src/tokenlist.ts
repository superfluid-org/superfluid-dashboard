import { type SuperTokenList, extendedSuperTokenList as extendedSuperTokenList_, fetchLatestExtendedSuperTokenList } from "@superfluid-finance/tokenlist";

export const extendedSuperTokenList = () => {
    if (fetchedSuperTokenList) {
        return fetchedSuperTokenList;
    }
    return extendedSuperTokenList_;
}

export let fetchedSuperTokenList: SuperTokenList | undefined;

fetchLatestExtendedSuperTokenList().then(fetchedTokenList => {
    fetchedSuperTokenList = fetchedTokenList;
});