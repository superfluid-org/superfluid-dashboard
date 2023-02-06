import { platformApiTemplateEmpty as api } from "./platformApiTemplateEmpty";
const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    isAccountWhitelisted: build.query<
      IsAccountWhitelistedApiResponse,
      IsAccountWhitelistedApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v2/users/is_whitelist/${queryArg.account}`,
      }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as platformApiTemplate };
export type IsAccountWhitelistedApiResponse =
  /** status 200 Is User account whitelisted */ boolean;
export type IsAccountWhitelistedApiArg = {
  /** User Account address */
  account: any;
};
