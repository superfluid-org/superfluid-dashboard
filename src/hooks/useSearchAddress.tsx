import { ensApi, ResolveNameResult } from "../features/ens/ensApi.slice";
import UseQueryResult from "../UseQueryResult";

interface AddressSearch {
  ensQuery: UseQueryResult<ResolveNameResult | null>;
}

const useSearchAddress = (
  searchTerm: string
): AddressSearch => {
  const ensQuery = ensApi.useResolveNameQuery(searchTerm);
  return {
    ensQuery,
  };
};

export default useSearchAddress;
