import { platformApiTemplateEmpty as api } from "./platformApiTemplateEmpty";
const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    listSubscriptions: build.query<
      ListSubscriptionsApiResponse,
      ListSubscriptionsApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v2/subscriptions/list/${queryArg.account}`,
        params: {
          limit: queryArg.limit,
          page: queryArg.page,
          filter: queryArg.filter,
        },
      }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as platformApiTemplate };
export type ListSubscriptionsApiResponse =
  /** status 200 List of all subscriptions */ Subscriptions;
export type ListSubscriptionsApiArg = {
  /** Account address */
  account: any;
  /** Limit of page */
  limit?: any;
  /** Page number */
  page?: any;
  filter?: {
    token?: any;
    type?: any;
  };
};
export type RowsPerPage = number;
export type Id = string;
export type Address = string;
export type Date = string;
export type StartDuration = number;
export type FlowRate = string;
export type LogIndex = number;
export type TransactionHash = string;
export type BlockNumber = number;
export type Transaction = {
  log_index?: LogIndex;
  transaction_hash?: TransactionHash;
  block_number?: BlockNumber;
};
export type Contract = {
  address?: Address;
};
export type CreateStreamMetaData = {
  receiver?: Address;
  account?: Address;
  token?: Address;
  start_date?: Date;
  end_date?: Date;
  start_duration?: StartDuration;
  flow_rate?: FlowRate;
  transaction?: Transaction;
  contract?: Contract;
};
export type Subscription = {
  id?: Id;
  type?: "SCHEDULED_TOP_UP_ORDER" | "SCHEDULED_FLOW_CREATE";
  account?: Address;
  created_at?: Date;
  updated_at?: Date;
  start_date?: Date;
  expiry_date?: Date;
  is_recurring?: boolean;
  is_subscribed?: boolean;
  meta_data?: CreateStreamMetaData;
};
export type Total = number;
export type Page2 = number;
export type Limit = number;
export type Page = {
  page?: Page2;
  limit?: Limit;
};
export type Subscriptions = {
  rowsPerPage?: RowsPerPage;
  data?: Subscription[];
  total?: Total;
  prev?: Page;
  next?: Page;
};
