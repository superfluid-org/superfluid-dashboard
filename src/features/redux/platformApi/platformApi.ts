import { emptyApi as api } from "./emptyApi";
const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    getLivenessCheck: build.query<
      GetLivenessCheckApiResponse,
      GetLivenessCheckApiArg
    >({
      query: () => ({ url: `/api/v2/health/live` }),
    }),
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
    findSubscriptionById: build.query<
      FindSubscriptionByIdApiResponse,
      FindSubscriptionByIdApiArg
    >({
      query: (queryArg) => ({ url: `/api/v2/subscriptions/id/${queryArg.id}` }),
    }),
    listWeb3Actions: build.query<
      ListWeb3ActionsApiResponse,
      ListWeb3ActionsApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v2/web3-actions/list/${queryArg.account}`,
        params: {
          limit: queryArg.limit,
          page: queryArg.page,
          filter: queryArg.filter,
        },
      }),
    }),
    findWeb3ActionBySubscriptionId: build.query<
      FindWeb3ActionBySubscriptionIdApiResponse,
      FindWeb3ActionBySubscriptionIdApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v2/web3-actions/subscription/${queryArg.id}`,
      }),
    }),
    findWeb3ActionById: build.query<
      FindWeb3ActionByIdApiResponse,
      FindWeb3ActionByIdApiArg
    >({
      query: (queryArg) => ({ url: `/api/v2/web3-actions/id/${queryArg.id}` }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as platformApiSlice };
export type GetLivenessCheckApiResponse =
  /** status 200 Health of service */ Health;
export type GetLivenessCheckApiArg = void;
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
export type FindSubscriptionByIdApiResponse =
  /** status 200 Account subscription by id */ Subscription;
export type FindSubscriptionByIdApiArg = {
  /** subscription id */
  id: any;
};
export type ListWeb3ActionsApiResponse =
  /** status 200 List of all web3 actions */ Web3Actions;
export type ListWeb3ActionsApiArg = {
  /** Account address */
  account: any;
  /** Limit of page */
  limit?: any;
  /** Page number */
  page?: any;
  filter?: {
    token?: any;
    type?: any;
    status?: any;
  };
};
export type FindWeb3ActionBySubscriptionIdApiResponse =
  /** status 200 Web3-Action by subscription id */ Web3Action;
export type FindWeb3ActionBySubscriptionIdApiArg = {
  /** subscription id */
  id: any;
};
export type FindWeb3ActionByIdApiResponse =
  /** status 200 Account web3 actions by id */ Web3Action;
export type FindWeb3ActionByIdApiArg = {
  /** web3-action id */
  id: any;
};
export type Time = number;
export type Status = boolean;
export type MongodbConnectionStatus = boolean;
export type QueueConnectionStatus = boolean;
export type Health = {
  time?: Time;
  status?: Status;
  mongodbConnectionStatus?: MongodbConnectionStatus;
  queueConnectionStatus?: QueueConnectionStatus;
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
  type?: "SCHEDULED_TOP_UP_ORDER" | "SCHEDULED_STREAM_ORDER";
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
export type TransactionReceipt = {
  to?: Address;
  from?: Address;
  transaction_index?: Address;
  gas_used?: string;
  block_hash?: TransactionHash;
  transaction_hash?: TransactionHash;
  block_number?: BlockNumber;
  confirmations?: number;
  cumulative_gas_used?: string;
  effective_gas_price?: string;
  status?: number;
  type?: number;
};
export type Web3Action = {
  id?: Id;
  type?: "OPEN_STREAM" | "CLOSE_STREAM" | "WRAP_TOKEN";
  scheduled_date?: Date;
  account?: Address;
  token?: Address;
  is_deleted?: boolean;
  status?: "COMPLETED" | "PENDING" | "CANCELLED" | "SCHEDULED" | "FAILED";
  subscription?: Id;
  created_at?: Date;
  updated_at?: Date;
  errors?: string[];
  transaction_receipt?: TransactionReceipt;
};
export type Web3Actions = {
  rowsPerPage?: RowsPerPage;
  data?: Web3Action[];
  total?: Total;
  prev?: Page;
  next?: Page;
};
export const {
  useGetLivenessCheckQuery,
  useListSubscriptionsQuery,
  useFindSubscriptionByIdQuery,
  useListWeb3ActionsQuery,
  useFindWeb3ActionBySubscriptionIdQuery,
  useFindWeb3ActionByIdQuery,
} = injectedRtkApi;
