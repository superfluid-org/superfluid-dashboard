// @ts-nocheck

import { InContextSdkMethod } from '@graphql-mesh/types';
import { MeshContext } from '@graphql-mesh/runtime';

export namespace VestingTypes {
  export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  BigDecimal: any;
  BigInt: any;
  Bytes: any;
  Int8: any;
  Timestamp: any;
};

export type Aggregation_interval =
  | 'hour'
  | 'day';

export type BlockChangedFilter = {
  number_gte: Scalars['Int'];
};

export type Block_height = {
  hash?: InputMaybe<Scalars['Bytes']>;
  number?: InputMaybe<Scalars['Int']>;
  number_gte?: InputMaybe<Scalars['Int']>;
};

export type ContractVersion =
  | 'v1'
  | 'v2'
  | 'v3';

/**
 * Event: An interface which is shared by all
 * event entities and contains basic transaction
 * data.
 *
 */
export type Event = {
  id: Scalars['ID'];
  blockNumber: Scalars['BigInt'];
  logIndex: Scalars['BigInt'];
  order: Scalars['BigInt'];
  name: Scalars['String'];
  /**
   * Holds the addresses for accounts that were impacted by the event.
   *
   */
  addresses: Array<Scalars['Bytes']>;
  timestamp: Scalars['BigInt'];
  transactionHash: Scalars['Bytes'];
  gasPrice: Scalars['BigInt'];
};

export type Event_filter = {
  id?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  blockNumber?: InputMaybe<Scalars['BigInt']>;
  blockNumber_not?: InputMaybe<Scalars['BigInt']>;
  blockNumber_gt?: InputMaybe<Scalars['BigInt']>;
  blockNumber_lt?: InputMaybe<Scalars['BigInt']>;
  blockNumber_gte?: InputMaybe<Scalars['BigInt']>;
  blockNumber_lte?: InputMaybe<Scalars['BigInt']>;
  blockNumber_in?: InputMaybe<Array<Scalars['BigInt']>>;
  blockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  logIndex?: InputMaybe<Scalars['BigInt']>;
  logIndex_not?: InputMaybe<Scalars['BigInt']>;
  logIndex_gt?: InputMaybe<Scalars['BigInt']>;
  logIndex_lt?: InputMaybe<Scalars['BigInt']>;
  logIndex_gte?: InputMaybe<Scalars['BigInt']>;
  logIndex_lte?: InputMaybe<Scalars['BigInt']>;
  logIndex_in?: InputMaybe<Array<Scalars['BigInt']>>;
  logIndex_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  order?: InputMaybe<Scalars['BigInt']>;
  order_not?: InputMaybe<Scalars['BigInt']>;
  order_gt?: InputMaybe<Scalars['BigInt']>;
  order_lt?: InputMaybe<Scalars['BigInt']>;
  order_gte?: InputMaybe<Scalars['BigInt']>;
  order_lte?: InputMaybe<Scalars['BigInt']>;
  order_in?: InputMaybe<Array<Scalars['BigInt']>>;
  order_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  name?: InputMaybe<Scalars['String']>;
  name_not?: InputMaybe<Scalars['String']>;
  name_gt?: InputMaybe<Scalars['String']>;
  name_lt?: InputMaybe<Scalars['String']>;
  name_gte?: InputMaybe<Scalars['String']>;
  name_lte?: InputMaybe<Scalars['String']>;
  name_in?: InputMaybe<Array<Scalars['String']>>;
  name_not_in?: InputMaybe<Array<Scalars['String']>>;
  name_contains?: InputMaybe<Scalars['String']>;
  name_contains_nocase?: InputMaybe<Scalars['String']>;
  name_not_contains?: InputMaybe<Scalars['String']>;
  name_not_contains_nocase?: InputMaybe<Scalars['String']>;
  name_starts_with?: InputMaybe<Scalars['String']>;
  name_starts_with_nocase?: InputMaybe<Scalars['String']>;
  name_not_starts_with?: InputMaybe<Scalars['String']>;
  name_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  name_ends_with?: InputMaybe<Scalars['String']>;
  name_ends_with_nocase?: InputMaybe<Scalars['String']>;
  name_not_ends_with?: InputMaybe<Scalars['String']>;
  name_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  addresses?: InputMaybe<Array<Scalars['Bytes']>>;
  addresses_not?: InputMaybe<Array<Scalars['Bytes']>>;
  addresses_contains?: InputMaybe<Array<Scalars['Bytes']>>;
  addresses_contains_nocase?: InputMaybe<Array<Scalars['Bytes']>>;
  addresses_not_contains?: InputMaybe<Array<Scalars['Bytes']>>;
  addresses_not_contains_nocase?: InputMaybe<Array<Scalars['Bytes']>>;
  timestamp?: InputMaybe<Scalars['BigInt']>;
  timestamp_not?: InputMaybe<Scalars['BigInt']>;
  timestamp_gt?: InputMaybe<Scalars['BigInt']>;
  timestamp_lt?: InputMaybe<Scalars['BigInt']>;
  timestamp_gte?: InputMaybe<Scalars['BigInt']>;
  timestamp_lte?: InputMaybe<Scalars['BigInt']>;
  timestamp_in?: InputMaybe<Array<Scalars['BigInt']>>;
  timestamp_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  transactionHash?: InputMaybe<Scalars['Bytes']>;
  transactionHash_not?: InputMaybe<Scalars['Bytes']>;
  transactionHash_gt?: InputMaybe<Scalars['Bytes']>;
  transactionHash_lt?: InputMaybe<Scalars['Bytes']>;
  transactionHash_gte?: InputMaybe<Scalars['Bytes']>;
  transactionHash_lte?: InputMaybe<Scalars['Bytes']>;
  transactionHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  transactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  transactionHash_contains?: InputMaybe<Scalars['Bytes']>;
  transactionHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  gasPrice?: InputMaybe<Scalars['BigInt']>;
  gasPrice_not?: InputMaybe<Scalars['BigInt']>;
  gasPrice_gt?: InputMaybe<Scalars['BigInt']>;
  gasPrice_lt?: InputMaybe<Scalars['BigInt']>;
  gasPrice_gte?: InputMaybe<Scalars['BigInt']>;
  gasPrice_lte?: InputMaybe<Scalars['BigInt']>;
  gasPrice_in?: InputMaybe<Array<Scalars['BigInt']>>;
  gasPrice_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<Event_filter>>>;
  or?: InputMaybe<Array<InputMaybe<Event_filter>>>;
};

export type Event_orderBy =
  | 'id'
  | 'blockNumber'
  | 'logIndex'
  | 'order'
  | 'name'
  | 'addresses'
  | 'timestamp'
  | 'transactionHash'
  | 'gasPrice';

/** Defines the order direction, either ascending or descending */
export type OrderDirection =
  | 'asc'
  | 'desc';

export type Query = {
  vestingCliffAndFlowExecutedEvent?: Maybe<VestingCliffAndFlowExecutedEvent>;
  vestingCliffAndFlowExecutedEvents: Array<VestingCliffAndFlowExecutedEvent>;
  vestingEndExecutedEvent?: Maybe<VestingEndExecutedEvent>;
  vestingEndExecutedEvents: Array<VestingEndExecutedEvent>;
  vestingEndFailedEvent?: Maybe<VestingEndFailedEvent>;
  vestingEndFailedEvents: Array<VestingEndFailedEvent>;
  vestingScheduleCreatedEvent?: Maybe<VestingScheduleCreatedEvent>;
  vestingScheduleCreatedEvents: Array<VestingScheduleCreatedEvent>;
  vestingScheduleDeletedEvent?: Maybe<VestingScheduleDeletedEvent>;
  vestingScheduleDeletedEvents: Array<VestingScheduleDeletedEvent>;
  vestingScheduleUpdatedEvent?: Maybe<VestingScheduleUpdatedEvent>;
  vestingScheduleUpdatedEvents: Array<VestingScheduleUpdatedEvent>;
  vestingClaimedEvent?: Maybe<VestingClaimedEvent>;
  vestingClaimedEvents: Array<VestingClaimedEvent>;
  vestingScheduleEndDateUpdatedEvent?: Maybe<VestingScheduleEndDateUpdatedEvent>;
  vestingScheduleEndDateUpdatedEvents: Array<VestingScheduleEndDateUpdatedEvent>;
  vestingSchedule?: Maybe<VestingSchedule>;
  vestingSchedules: Array<VestingSchedule>;
  tokenSenderReceiverCursor?: Maybe<TokenSenderReceiverCursor>;
  tokenSenderReceiverCursors: Array<TokenSenderReceiverCursor>;
  task?: Maybe<Task>;
  tasks: Array<Task>;
  event?: Maybe<Event>;
  events: Array<Event>;
  /** Access to subgraph metadata */
  _meta?: Maybe<_Meta_>;
};


export type QueryvestingCliffAndFlowExecutedEventArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryvestingCliffAndFlowExecutedEventsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<VestingCliffAndFlowExecutedEvent_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<VestingCliffAndFlowExecutedEvent_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryvestingEndExecutedEventArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryvestingEndExecutedEventsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<VestingEndExecutedEvent_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<VestingEndExecutedEvent_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryvestingEndFailedEventArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryvestingEndFailedEventsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<VestingEndFailedEvent_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<VestingEndFailedEvent_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryvestingScheduleCreatedEventArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryvestingScheduleCreatedEventsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<VestingScheduleCreatedEvent_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<VestingScheduleCreatedEvent_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryvestingScheduleDeletedEventArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryvestingScheduleDeletedEventsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<VestingScheduleDeletedEvent_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<VestingScheduleDeletedEvent_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryvestingScheduleUpdatedEventArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryvestingScheduleUpdatedEventsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<VestingScheduleUpdatedEvent_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<VestingScheduleUpdatedEvent_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryvestingClaimedEventArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryvestingClaimedEventsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<VestingClaimedEvent_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<VestingClaimedEvent_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryvestingScheduleEndDateUpdatedEventArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryvestingScheduleEndDateUpdatedEventsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<VestingScheduleEndDateUpdatedEvent_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<VestingScheduleEndDateUpdatedEvent_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryvestingScheduleArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryvestingSchedulesArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<VestingSchedule_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<VestingSchedule_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QuerytokenSenderReceiverCursorArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QuerytokenSenderReceiverCursorsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<TokenSenderReceiverCursor_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<TokenSenderReceiverCursor_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QuerytaskArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QuerytasksArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Task_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<Task_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryeventArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryeventsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Event_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<Event_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type Query_metaArgs = {
  block?: InputMaybe<Block_height>;
};

export type Subscription = {
  vestingCliffAndFlowExecutedEvent?: Maybe<VestingCliffAndFlowExecutedEvent>;
  vestingCliffAndFlowExecutedEvents: Array<VestingCliffAndFlowExecutedEvent>;
  vestingEndExecutedEvent?: Maybe<VestingEndExecutedEvent>;
  vestingEndExecutedEvents: Array<VestingEndExecutedEvent>;
  vestingEndFailedEvent?: Maybe<VestingEndFailedEvent>;
  vestingEndFailedEvents: Array<VestingEndFailedEvent>;
  vestingScheduleCreatedEvent?: Maybe<VestingScheduleCreatedEvent>;
  vestingScheduleCreatedEvents: Array<VestingScheduleCreatedEvent>;
  vestingScheduleDeletedEvent?: Maybe<VestingScheduleDeletedEvent>;
  vestingScheduleDeletedEvents: Array<VestingScheduleDeletedEvent>;
  vestingScheduleUpdatedEvent?: Maybe<VestingScheduleUpdatedEvent>;
  vestingScheduleUpdatedEvents: Array<VestingScheduleUpdatedEvent>;
  vestingClaimedEvent?: Maybe<VestingClaimedEvent>;
  vestingClaimedEvents: Array<VestingClaimedEvent>;
  vestingScheduleEndDateUpdatedEvent?: Maybe<VestingScheduleEndDateUpdatedEvent>;
  vestingScheduleEndDateUpdatedEvents: Array<VestingScheduleEndDateUpdatedEvent>;
  vestingSchedule?: Maybe<VestingSchedule>;
  vestingSchedules: Array<VestingSchedule>;
  tokenSenderReceiverCursor?: Maybe<TokenSenderReceiverCursor>;
  tokenSenderReceiverCursors: Array<TokenSenderReceiverCursor>;
  task?: Maybe<Task>;
  tasks: Array<Task>;
  event?: Maybe<Event>;
  events: Array<Event>;
  /** Access to subgraph metadata */
  _meta?: Maybe<_Meta_>;
};


export type SubscriptionvestingCliffAndFlowExecutedEventArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionvestingCliffAndFlowExecutedEventsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<VestingCliffAndFlowExecutedEvent_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<VestingCliffAndFlowExecutedEvent_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionvestingEndExecutedEventArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionvestingEndExecutedEventsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<VestingEndExecutedEvent_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<VestingEndExecutedEvent_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionvestingEndFailedEventArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionvestingEndFailedEventsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<VestingEndFailedEvent_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<VestingEndFailedEvent_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionvestingScheduleCreatedEventArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionvestingScheduleCreatedEventsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<VestingScheduleCreatedEvent_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<VestingScheduleCreatedEvent_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionvestingScheduleDeletedEventArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionvestingScheduleDeletedEventsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<VestingScheduleDeletedEvent_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<VestingScheduleDeletedEvent_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionvestingScheduleUpdatedEventArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionvestingScheduleUpdatedEventsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<VestingScheduleUpdatedEvent_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<VestingScheduleUpdatedEvent_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionvestingClaimedEventArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionvestingClaimedEventsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<VestingClaimedEvent_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<VestingClaimedEvent_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionvestingScheduleEndDateUpdatedEventArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionvestingScheduleEndDateUpdatedEventsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<VestingScheduleEndDateUpdatedEvent_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<VestingScheduleEndDateUpdatedEvent_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionvestingScheduleArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionvestingSchedulesArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<VestingSchedule_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<VestingSchedule_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptiontokenSenderReceiverCursorArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptiontokenSenderReceiverCursorsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<TokenSenderReceiverCursor_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<TokenSenderReceiverCursor_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptiontaskArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptiontasksArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Task_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<Task_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptioneventArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptioneventsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Event_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<Event_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type Subscription_metaArgs = {
  block?: InputMaybe<Block_height>;
};

export type Task = {
  id: Scalars['ID'];
  type: TaskType;
  executedAt?: Maybe<Scalars['BigInt']>;
  executionAt: Scalars['BigInt'];
  expirationAt: Scalars['BigInt'];
  cancelledAt?: Maybe<Scalars['BigInt']>;
  failedAt?: Maybe<Scalars['BigInt']>;
  vestingSchedule: VestingSchedule;
};

export type TaskType =
  | 'ExecuteCliffAndFlow'
  | 'ExecuteEndVesting';

export type Task_filter = {
  id?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  type?: InputMaybe<TaskType>;
  type_not?: InputMaybe<TaskType>;
  type_in?: InputMaybe<Array<TaskType>>;
  type_not_in?: InputMaybe<Array<TaskType>>;
  executedAt?: InputMaybe<Scalars['BigInt']>;
  executedAt_not?: InputMaybe<Scalars['BigInt']>;
  executedAt_gt?: InputMaybe<Scalars['BigInt']>;
  executedAt_lt?: InputMaybe<Scalars['BigInt']>;
  executedAt_gte?: InputMaybe<Scalars['BigInt']>;
  executedAt_lte?: InputMaybe<Scalars['BigInt']>;
  executedAt_in?: InputMaybe<Array<Scalars['BigInt']>>;
  executedAt_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  executionAt?: InputMaybe<Scalars['BigInt']>;
  executionAt_not?: InputMaybe<Scalars['BigInt']>;
  executionAt_gt?: InputMaybe<Scalars['BigInt']>;
  executionAt_lt?: InputMaybe<Scalars['BigInt']>;
  executionAt_gte?: InputMaybe<Scalars['BigInt']>;
  executionAt_lte?: InputMaybe<Scalars['BigInt']>;
  executionAt_in?: InputMaybe<Array<Scalars['BigInt']>>;
  executionAt_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  expirationAt?: InputMaybe<Scalars['BigInt']>;
  expirationAt_not?: InputMaybe<Scalars['BigInt']>;
  expirationAt_gt?: InputMaybe<Scalars['BigInt']>;
  expirationAt_lt?: InputMaybe<Scalars['BigInt']>;
  expirationAt_gte?: InputMaybe<Scalars['BigInt']>;
  expirationAt_lte?: InputMaybe<Scalars['BigInt']>;
  expirationAt_in?: InputMaybe<Array<Scalars['BigInt']>>;
  expirationAt_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  cancelledAt?: InputMaybe<Scalars['BigInt']>;
  cancelledAt_not?: InputMaybe<Scalars['BigInt']>;
  cancelledAt_gt?: InputMaybe<Scalars['BigInt']>;
  cancelledAt_lt?: InputMaybe<Scalars['BigInt']>;
  cancelledAt_gte?: InputMaybe<Scalars['BigInt']>;
  cancelledAt_lte?: InputMaybe<Scalars['BigInt']>;
  cancelledAt_in?: InputMaybe<Array<Scalars['BigInt']>>;
  cancelledAt_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  failedAt?: InputMaybe<Scalars['BigInt']>;
  failedAt_not?: InputMaybe<Scalars['BigInt']>;
  failedAt_gt?: InputMaybe<Scalars['BigInt']>;
  failedAt_lt?: InputMaybe<Scalars['BigInt']>;
  failedAt_gte?: InputMaybe<Scalars['BigInt']>;
  failedAt_lte?: InputMaybe<Scalars['BigInt']>;
  failedAt_in?: InputMaybe<Array<Scalars['BigInt']>>;
  failedAt_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  vestingSchedule?: InputMaybe<Scalars['String']>;
  vestingSchedule_not?: InputMaybe<Scalars['String']>;
  vestingSchedule_gt?: InputMaybe<Scalars['String']>;
  vestingSchedule_lt?: InputMaybe<Scalars['String']>;
  vestingSchedule_gte?: InputMaybe<Scalars['String']>;
  vestingSchedule_lte?: InputMaybe<Scalars['String']>;
  vestingSchedule_in?: InputMaybe<Array<Scalars['String']>>;
  vestingSchedule_not_in?: InputMaybe<Array<Scalars['String']>>;
  vestingSchedule_contains?: InputMaybe<Scalars['String']>;
  vestingSchedule_contains_nocase?: InputMaybe<Scalars['String']>;
  vestingSchedule_not_contains?: InputMaybe<Scalars['String']>;
  vestingSchedule_not_contains_nocase?: InputMaybe<Scalars['String']>;
  vestingSchedule_starts_with?: InputMaybe<Scalars['String']>;
  vestingSchedule_starts_with_nocase?: InputMaybe<Scalars['String']>;
  vestingSchedule_not_starts_with?: InputMaybe<Scalars['String']>;
  vestingSchedule_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  vestingSchedule_ends_with?: InputMaybe<Scalars['String']>;
  vestingSchedule_ends_with_nocase?: InputMaybe<Scalars['String']>;
  vestingSchedule_not_ends_with?: InputMaybe<Scalars['String']>;
  vestingSchedule_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  vestingSchedule_?: InputMaybe<VestingSchedule_filter>;
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<Task_filter>>>;
  or?: InputMaybe<Array<InputMaybe<Task_filter>>>;
};

export type Task_orderBy =
  | 'id'
  | 'type'
  | 'executedAt'
  | 'executionAt'
  | 'expirationAt'
  | 'cancelledAt'
  | 'failedAt'
  | 'vestingSchedule'
  | 'vestingSchedule__id'
  | 'vestingSchedule__contractVersion'
  | 'vestingSchedule__createdAt'
  | 'vestingSchedule__superToken'
  | 'vestingSchedule__sender'
  | 'vestingSchedule__receiver'
  | 'vestingSchedule__startDate'
  | 'vestingSchedule__endDate'
  | 'vestingSchedule__cliffDate'
  | 'vestingSchedule__cliffAndFlowDate'
  | 'vestingSchedule__cliffAmount'
  | 'vestingSchedule__flowRate'
  | 'vestingSchedule__didEarlyEndCompensationFail'
  | 'vestingSchedule__earlyEndCompensation'
  | 'vestingSchedule__cliffAndFlowExpirationAt'
  | 'vestingSchedule__endDateValidAt'
  | 'vestingSchedule__deletedAt'
  | 'vestingSchedule__failedAt'
  | 'vestingSchedule__cliffAndFlowExecutedAt'
  | 'vestingSchedule__endExecutedAt'
  | 'vestingSchedule__claimValidityDate'
  | 'vestingSchedule__claimedAt'
  | 'vestingSchedule__remainderAmount'
  | 'vestingSchedule__totalAmount'
  | 'vestingSchedule__settledAmount'
  | 'vestingSchedule__settledAt';

export type TokenSenderReceiverCursor = {
  id: Scalars['String'];
  currentVestingSchedule?: Maybe<VestingSchedule>;
  currentCliffAndFlowTask?: Maybe<Task>;
  currentEndVestingTask?: Maybe<Task>;
};

export type TokenSenderReceiverCursor_filter = {
  id?: InputMaybe<Scalars['String']>;
  id_not?: InputMaybe<Scalars['String']>;
  id_gt?: InputMaybe<Scalars['String']>;
  id_lt?: InputMaybe<Scalars['String']>;
  id_gte?: InputMaybe<Scalars['String']>;
  id_lte?: InputMaybe<Scalars['String']>;
  id_in?: InputMaybe<Array<Scalars['String']>>;
  id_not_in?: InputMaybe<Array<Scalars['String']>>;
  id_contains?: InputMaybe<Scalars['String']>;
  id_contains_nocase?: InputMaybe<Scalars['String']>;
  id_not_contains?: InputMaybe<Scalars['String']>;
  id_not_contains_nocase?: InputMaybe<Scalars['String']>;
  id_starts_with?: InputMaybe<Scalars['String']>;
  id_starts_with_nocase?: InputMaybe<Scalars['String']>;
  id_not_starts_with?: InputMaybe<Scalars['String']>;
  id_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  id_ends_with?: InputMaybe<Scalars['String']>;
  id_ends_with_nocase?: InputMaybe<Scalars['String']>;
  id_not_ends_with?: InputMaybe<Scalars['String']>;
  id_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  currentVestingSchedule?: InputMaybe<Scalars['String']>;
  currentVestingSchedule_not?: InputMaybe<Scalars['String']>;
  currentVestingSchedule_gt?: InputMaybe<Scalars['String']>;
  currentVestingSchedule_lt?: InputMaybe<Scalars['String']>;
  currentVestingSchedule_gte?: InputMaybe<Scalars['String']>;
  currentVestingSchedule_lte?: InputMaybe<Scalars['String']>;
  currentVestingSchedule_in?: InputMaybe<Array<Scalars['String']>>;
  currentVestingSchedule_not_in?: InputMaybe<Array<Scalars['String']>>;
  currentVestingSchedule_contains?: InputMaybe<Scalars['String']>;
  currentVestingSchedule_contains_nocase?: InputMaybe<Scalars['String']>;
  currentVestingSchedule_not_contains?: InputMaybe<Scalars['String']>;
  currentVestingSchedule_not_contains_nocase?: InputMaybe<Scalars['String']>;
  currentVestingSchedule_starts_with?: InputMaybe<Scalars['String']>;
  currentVestingSchedule_starts_with_nocase?: InputMaybe<Scalars['String']>;
  currentVestingSchedule_not_starts_with?: InputMaybe<Scalars['String']>;
  currentVestingSchedule_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  currentVestingSchedule_ends_with?: InputMaybe<Scalars['String']>;
  currentVestingSchedule_ends_with_nocase?: InputMaybe<Scalars['String']>;
  currentVestingSchedule_not_ends_with?: InputMaybe<Scalars['String']>;
  currentVestingSchedule_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  currentVestingSchedule_?: InputMaybe<VestingSchedule_filter>;
  currentCliffAndFlowTask?: InputMaybe<Scalars['String']>;
  currentCliffAndFlowTask_not?: InputMaybe<Scalars['String']>;
  currentCliffAndFlowTask_gt?: InputMaybe<Scalars['String']>;
  currentCliffAndFlowTask_lt?: InputMaybe<Scalars['String']>;
  currentCliffAndFlowTask_gte?: InputMaybe<Scalars['String']>;
  currentCliffAndFlowTask_lte?: InputMaybe<Scalars['String']>;
  currentCliffAndFlowTask_in?: InputMaybe<Array<Scalars['String']>>;
  currentCliffAndFlowTask_not_in?: InputMaybe<Array<Scalars['String']>>;
  currentCliffAndFlowTask_contains?: InputMaybe<Scalars['String']>;
  currentCliffAndFlowTask_contains_nocase?: InputMaybe<Scalars['String']>;
  currentCliffAndFlowTask_not_contains?: InputMaybe<Scalars['String']>;
  currentCliffAndFlowTask_not_contains_nocase?: InputMaybe<Scalars['String']>;
  currentCliffAndFlowTask_starts_with?: InputMaybe<Scalars['String']>;
  currentCliffAndFlowTask_starts_with_nocase?: InputMaybe<Scalars['String']>;
  currentCliffAndFlowTask_not_starts_with?: InputMaybe<Scalars['String']>;
  currentCliffAndFlowTask_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  currentCliffAndFlowTask_ends_with?: InputMaybe<Scalars['String']>;
  currentCliffAndFlowTask_ends_with_nocase?: InputMaybe<Scalars['String']>;
  currentCliffAndFlowTask_not_ends_with?: InputMaybe<Scalars['String']>;
  currentCliffAndFlowTask_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  currentCliffAndFlowTask_?: InputMaybe<Task_filter>;
  currentEndVestingTask?: InputMaybe<Scalars['String']>;
  currentEndVestingTask_not?: InputMaybe<Scalars['String']>;
  currentEndVestingTask_gt?: InputMaybe<Scalars['String']>;
  currentEndVestingTask_lt?: InputMaybe<Scalars['String']>;
  currentEndVestingTask_gte?: InputMaybe<Scalars['String']>;
  currentEndVestingTask_lte?: InputMaybe<Scalars['String']>;
  currentEndVestingTask_in?: InputMaybe<Array<Scalars['String']>>;
  currentEndVestingTask_not_in?: InputMaybe<Array<Scalars['String']>>;
  currentEndVestingTask_contains?: InputMaybe<Scalars['String']>;
  currentEndVestingTask_contains_nocase?: InputMaybe<Scalars['String']>;
  currentEndVestingTask_not_contains?: InputMaybe<Scalars['String']>;
  currentEndVestingTask_not_contains_nocase?: InputMaybe<Scalars['String']>;
  currentEndVestingTask_starts_with?: InputMaybe<Scalars['String']>;
  currentEndVestingTask_starts_with_nocase?: InputMaybe<Scalars['String']>;
  currentEndVestingTask_not_starts_with?: InputMaybe<Scalars['String']>;
  currentEndVestingTask_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  currentEndVestingTask_ends_with?: InputMaybe<Scalars['String']>;
  currentEndVestingTask_ends_with_nocase?: InputMaybe<Scalars['String']>;
  currentEndVestingTask_not_ends_with?: InputMaybe<Scalars['String']>;
  currentEndVestingTask_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  currentEndVestingTask_?: InputMaybe<Task_filter>;
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<TokenSenderReceiverCursor_filter>>>;
  or?: InputMaybe<Array<InputMaybe<TokenSenderReceiverCursor_filter>>>;
};

export type TokenSenderReceiverCursor_orderBy =
  | 'id'
  | 'currentVestingSchedule'
  | 'currentVestingSchedule__id'
  | 'currentVestingSchedule__contractVersion'
  | 'currentVestingSchedule__createdAt'
  | 'currentVestingSchedule__superToken'
  | 'currentVestingSchedule__sender'
  | 'currentVestingSchedule__receiver'
  | 'currentVestingSchedule__startDate'
  | 'currentVestingSchedule__endDate'
  | 'currentVestingSchedule__cliffDate'
  | 'currentVestingSchedule__cliffAndFlowDate'
  | 'currentVestingSchedule__cliffAmount'
  | 'currentVestingSchedule__flowRate'
  | 'currentVestingSchedule__didEarlyEndCompensationFail'
  | 'currentVestingSchedule__earlyEndCompensation'
  | 'currentVestingSchedule__cliffAndFlowExpirationAt'
  | 'currentVestingSchedule__endDateValidAt'
  | 'currentVestingSchedule__deletedAt'
  | 'currentVestingSchedule__failedAt'
  | 'currentVestingSchedule__cliffAndFlowExecutedAt'
  | 'currentVestingSchedule__endExecutedAt'
  | 'currentVestingSchedule__claimValidityDate'
  | 'currentVestingSchedule__claimedAt'
  | 'currentVestingSchedule__remainderAmount'
  | 'currentVestingSchedule__totalAmount'
  | 'currentVestingSchedule__settledAmount'
  | 'currentVestingSchedule__settledAt'
  | 'currentCliffAndFlowTask'
  | 'currentCliffAndFlowTask__id'
  | 'currentCliffAndFlowTask__type'
  | 'currentCliffAndFlowTask__executedAt'
  | 'currentCliffAndFlowTask__executionAt'
  | 'currentCliffAndFlowTask__expirationAt'
  | 'currentCliffAndFlowTask__cancelledAt'
  | 'currentCliffAndFlowTask__failedAt'
  | 'currentEndVestingTask'
  | 'currentEndVestingTask__id'
  | 'currentEndVestingTask__type'
  | 'currentEndVestingTask__executedAt'
  | 'currentEndVestingTask__executionAt'
  | 'currentEndVestingTask__expirationAt'
  | 'currentEndVestingTask__cancelledAt'
  | 'currentEndVestingTask__failedAt';

export type VestingClaimedEvent = Event & {
  id: Scalars['ID'];
  blockNumber: Scalars['BigInt'];
  logIndex: Scalars['BigInt'];
  order: Scalars['BigInt'];
  name: Scalars['String'];
  /**
   * Holds the addresses for sender and receiver.
   *
   */
  addresses: Array<Scalars['Bytes']>;
  timestamp: Scalars['BigInt'];
  transactionHash: Scalars['Bytes'];
  gasPrice: Scalars['BigInt'];
  superToken: Scalars['Bytes'];
  sender: Scalars['Bytes'];
  receiver: Scalars['Bytes'];
  claimer: Scalars['Bytes'];
};

export type VestingClaimedEvent_filter = {
  id?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  blockNumber?: InputMaybe<Scalars['BigInt']>;
  blockNumber_not?: InputMaybe<Scalars['BigInt']>;
  blockNumber_gt?: InputMaybe<Scalars['BigInt']>;
  blockNumber_lt?: InputMaybe<Scalars['BigInt']>;
  blockNumber_gte?: InputMaybe<Scalars['BigInt']>;
  blockNumber_lte?: InputMaybe<Scalars['BigInt']>;
  blockNumber_in?: InputMaybe<Array<Scalars['BigInt']>>;
  blockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  logIndex?: InputMaybe<Scalars['BigInt']>;
  logIndex_not?: InputMaybe<Scalars['BigInt']>;
  logIndex_gt?: InputMaybe<Scalars['BigInt']>;
  logIndex_lt?: InputMaybe<Scalars['BigInt']>;
  logIndex_gte?: InputMaybe<Scalars['BigInt']>;
  logIndex_lte?: InputMaybe<Scalars['BigInt']>;
  logIndex_in?: InputMaybe<Array<Scalars['BigInt']>>;
  logIndex_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  order?: InputMaybe<Scalars['BigInt']>;
  order_not?: InputMaybe<Scalars['BigInt']>;
  order_gt?: InputMaybe<Scalars['BigInt']>;
  order_lt?: InputMaybe<Scalars['BigInt']>;
  order_gte?: InputMaybe<Scalars['BigInt']>;
  order_lte?: InputMaybe<Scalars['BigInt']>;
  order_in?: InputMaybe<Array<Scalars['BigInt']>>;
  order_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  name?: InputMaybe<Scalars['String']>;
  name_not?: InputMaybe<Scalars['String']>;
  name_gt?: InputMaybe<Scalars['String']>;
  name_lt?: InputMaybe<Scalars['String']>;
  name_gte?: InputMaybe<Scalars['String']>;
  name_lte?: InputMaybe<Scalars['String']>;
  name_in?: InputMaybe<Array<Scalars['String']>>;
  name_not_in?: InputMaybe<Array<Scalars['String']>>;
  name_contains?: InputMaybe<Scalars['String']>;
  name_contains_nocase?: InputMaybe<Scalars['String']>;
  name_not_contains?: InputMaybe<Scalars['String']>;
  name_not_contains_nocase?: InputMaybe<Scalars['String']>;
  name_starts_with?: InputMaybe<Scalars['String']>;
  name_starts_with_nocase?: InputMaybe<Scalars['String']>;
  name_not_starts_with?: InputMaybe<Scalars['String']>;
  name_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  name_ends_with?: InputMaybe<Scalars['String']>;
  name_ends_with_nocase?: InputMaybe<Scalars['String']>;
  name_not_ends_with?: InputMaybe<Scalars['String']>;
  name_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  addresses?: InputMaybe<Array<Scalars['Bytes']>>;
  addresses_not?: InputMaybe<Array<Scalars['Bytes']>>;
  addresses_contains?: InputMaybe<Array<Scalars['Bytes']>>;
  addresses_contains_nocase?: InputMaybe<Array<Scalars['Bytes']>>;
  addresses_not_contains?: InputMaybe<Array<Scalars['Bytes']>>;
  addresses_not_contains_nocase?: InputMaybe<Array<Scalars['Bytes']>>;
  timestamp?: InputMaybe<Scalars['BigInt']>;
  timestamp_not?: InputMaybe<Scalars['BigInt']>;
  timestamp_gt?: InputMaybe<Scalars['BigInt']>;
  timestamp_lt?: InputMaybe<Scalars['BigInt']>;
  timestamp_gte?: InputMaybe<Scalars['BigInt']>;
  timestamp_lte?: InputMaybe<Scalars['BigInt']>;
  timestamp_in?: InputMaybe<Array<Scalars['BigInt']>>;
  timestamp_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  transactionHash?: InputMaybe<Scalars['Bytes']>;
  transactionHash_not?: InputMaybe<Scalars['Bytes']>;
  transactionHash_gt?: InputMaybe<Scalars['Bytes']>;
  transactionHash_lt?: InputMaybe<Scalars['Bytes']>;
  transactionHash_gte?: InputMaybe<Scalars['Bytes']>;
  transactionHash_lte?: InputMaybe<Scalars['Bytes']>;
  transactionHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  transactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  transactionHash_contains?: InputMaybe<Scalars['Bytes']>;
  transactionHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  gasPrice?: InputMaybe<Scalars['BigInt']>;
  gasPrice_not?: InputMaybe<Scalars['BigInt']>;
  gasPrice_gt?: InputMaybe<Scalars['BigInt']>;
  gasPrice_lt?: InputMaybe<Scalars['BigInt']>;
  gasPrice_gte?: InputMaybe<Scalars['BigInt']>;
  gasPrice_lte?: InputMaybe<Scalars['BigInt']>;
  gasPrice_in?: InputMaybe<Array<Scalars['BigInt']>>;
  gasPrice_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  superToken?: InputMaybe<Scalars['Bytes']>;
  superToken_not?: InputMaybe<Scalars['Bytes']>;
  superToken_gt?: InputMaybe<Scalars['Bytes']>;
  superToken_lt?: InputMaybe<Scalars['Bytes']>;
  superToken_gte?: InputMaybe<Scalars['Bytes']>;
  superToken_lte?: InputMaybe<Scalars['Bytes']>;
  superToken_in?: InputMaybe<Array<Scalars['Bytes']>>;
  superToken_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  superToken_contains?: InputMaybe<Scalars['Bytes']>;
  superToken_not_contains?: InputMaybe<Scalars['Bytes']>;
  sender?: InputMaybe<Scalars['Bytes']>;
  sender_not?: InputMaybe<Scalars['Bytes']>;
  sender_gt?: InputMaybe<Scalars['Bytes']>;
  sender_lt?: InputMaybe<Scalars['Bytes']>;
  sender_gte?: InputMaybe<Scalars['Bytes']>;
  sender_lte?: InputMaybe<Scalars['Bytes']>;
  sender_in?: InputMaybe<Array<Scalars['Bytes']>>;
  sender_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  sender_contains?: InputMaybe<Scalars['Bytes']>;
  sender_not_contains?: InputMaybe<Scalars['Bytes']>;
  receiver?: InputMaybe<Scalars['Bytes']>;
  receiver_not?: InputMaybe<Scalars['Bytes']>;
  receiver_gt?: InputMaybe<Scalars['Bytes']>;
  receiver_lt?: InputMaybe<Scalars['Bytes']>;
  receiver_gte?: InputMaybe<Scalars['Bytes']>;
  receiver_lte?: InputMaybe<Scalars['Bytes']>;
  receiver_in?: InputMaybe<Array<Scalars['Bytes']>>;
  receiver_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  receiver_contains?: InputMaybe<Scalars['Bytes']>;
  receiver_not_contains?: InputMaybe<Scalars['Bytes']>;
  claimer?: InputMaybe<Scalars['Bytes']>;
  claimer_not?: InputMaybe<Scalars['Bytes']>;
  claimer_gt?: InputMaybe<Scalars['Bytes']>;
  claimer_lt?: InputMaybe<Scalars['Bytes']>;
  claimer_gte?: InputMaybe<Scalars['Bytes']>;
  claimer_lte?: InputMaybe<Scalars['Bytes']>;
  claimer_in?: InputMaybe<Array<Scalars['Bytes']>>;
  claimer_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  claimer_contains?: InputMaybe<Scalars['Bytes']>;
  claimer_not_contains?: InputMaybe<Scalars['Bytes']>;
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<VestingClaimedEvent_filter>>>;
  or?: InputMaybe<Array<InputMaybe<VestingClaimedEvent_filter>>>;
};

export type VestingClaimedEvent_orderBy =
  | 'id'
  | 'blockNumber'
  | 'logIndex'
  | 'order'
  | 'name'
  | 'addresses'
  | 'timestamp'
  | 'transactionHash'
  | 'gasPrice'
  | 'superToken'
  | 'sender'
  | 'receiver'
  | 'claimer';

export type VestingCliffAndFlowExecutedEvent = Event & {
  id: Scalars['ID'];
  blockNumber: Scalars['BigInt'];
  logIndex: Scalars['BigInt'];
  order: Scalars['BigInt'];
  name: Scalars['String'];
  /**
   * Holds the addresses for sender and receiver.
   *
   */
  addresses: Array<Scalars['Bytes']>;
  timestamp: Scalars['BigInt'];
  transactionHash: Scalars['Bytes'];
  gasPrice: Scalars['BigInt'];
  gasUsed: Scalars['BigInt'];
  superToken: Scalars['Bytes'];
  sender: Scalars['Bytes'];
  receiver: Scalars['Bytes'];
  cliffAndFlowDate: Scalars['BigInt'];
  flowRate: Scalars['BigInt'];
  cliffAmount: Scalars['BigInt'];
  flowDelayCompensation: Scalars['BigInt'];
};

export type VestingCliffAndFlowExecutedEvent_filter = {
  id?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  blockNumber?: InputMaybe<Scalars['BigInt']>;
  blockNumber_not?: InputMaybe<Scalars['BigInt']>;
  blockNumber_gt?: InputMaybe<Scalars['BigInt']>;
  blockNumber_lt?: InputMaybe<Scalars['BigInt']>;
  blockNumber_gte?: InputMaybe<Scalars['BigInt']>;
  blockNumber_lte?: InputMaybe<Scalars['BigInt']>;
  blockNumber_in?: InputMaybe<Array<Scalars['BigInt']>>;
  blockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  logIndex?: InputMaybe<Scalars['BigInt']>;
  logIndex_not?: InputMaybe<Scalars['BigInt']>;
  logIndex_gt?: InputMaybe<Scalars['BigInt']>;
  logIndex_lt?: InputMaybe<Scalars['BigInt']>;
  logIndex_gte?: InputMaybe<Scalars['BigInt']>;
  logIndex_lte?: InputMaybe<Scalars['BigInt']>;
  logIndex_in?: InputMaybe<Array<Scalars['BigInt']>>;
  logIndex_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  order?: InputMaybe<Scalars['BigInt']>;
  order_not?: InputMaybe<Scalars['BigInt']>;
  order_gt?: InputMaybe<Scalars['BigInt']>;
  order_lt?: InputMaybe<Scalars['BigInt']>;
  order_gte?: InputMaybe<Scalars['BigInt']>;
  order_lte?: InputMaybe<Scalars['BigInt']>;
  order_in?: InputMaybe<Array<Scalars['BigInt']>>;
  order_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  name?: InputMaybe<Scalars['String']>;
  name_not?: InputMaybe<Scalars['String']>;
  name_gt?: InputMaybe<Scalars['String']>;
  name_lt?: InputMaybe<Scalars['String']>;
  name_gte?: InputMaybe<Scalars['String']>;
  name_lte?: InputMaybe<Scalars['String']>;
  name_in?: InputMaybe<Array<Scalars['String']>>;
  name_not_in?: InputMaybe<Array<Scalars['String']>>;
  name_contains?: InputMaybe<Scalars['String']>;
  name_contains_nocase?: InputMaybe<Scalars['String']>;
  name_not_contains?: InputMaybe<Scalars['String']>;
  name_not_contains_nocase?: InputMaybe<Scalars['String']>;
  name_starts_with?: InputMaybe<Scalars['String']>;
  name_starts_with_nocase?: InputMaybe<Scalars['String']>;
  name_not_starts_with?: InputMaybe<Scalars['String']>;
  name_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  name_ends_with?: InputMaybe<Scalars['String']>;
  name_ends_with_nocase?: InputMaybe<Scalars['String']>;
  name_not_ends_with?: InputMaybe<Scalars['String']>;
  name_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  addresses?: InputMaybe<Array<Scalars['Bytes']>>;
  addresses_not?: InputMaybe<Array<Scalars['Bytes']>>;
  addresses_contains?: InputMaybe<Array<Scalars['Bytes']>>;
  addresses_contains_nocase?: InputMaybe<Array<Scalars['Bytes']>>;
  addresses_not_contains?: InputMaybe<Array<Scalars['Bytes']>>;
  addresses_not_contains_nocase?: InputMaybe<Array<Scalars['Bytes']>>;
  timestamp?: InputMaybe<Scalars['BigInt']>;
  timestamp_not?: InputMaybe<Scalars['BigInt']>;
  timestamp_gt?: InputMaybe<Scalars['BigInt']>;
  timestamp_lt?: InputMaybe<Scalars['BigInt']>;
  timestamp_gte?: InputMaybe<Scalars['BigInt']>;
  timestamp_lte?: InputMaybe<Scalars['BigInt']>;
  timestamp_in?: InputMaybe<Array<Scalars['BigInt']>>;
  timestamp_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  transactionHash?: InputMaybe<Scalars['Bytes']>;
  transactionHash_not?: InputMaybe<Scalars['Bytes']>;
  transactionHash_gt?: InputMaybe<Scalars['Bytes']>;
  transactionHash_lt?: InputMaybe<Scalars['Bytes']>;
  transactionHash_gte?: InputMaybe<Scalars['Bytes']>;
  transactionHash_lte?: InputMaybe<Scalars['Bytes']>;
  transactionHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  transactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  transactionHash_contains?: InputMaybe<Scalars['Bytes']>;
  transactionHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  gasPrice?: InputMaybe<Scalars['BigInt']>;
  gasPrice_not?: InputMaybe<Scalars['BigInt']>;
  gasPrice_gt?: InputMaybe<Scalars['BigInt']>;
  gasPrice_lt?: InputMaybe<Scalars['BigInt']>;
  gasPrice_gte?: InputMaybe<Scalars['BigInt']>;
  gasPrice_lte?: InputMaybe<Scalars['BigInt']>;
  gasPrice_in?: InputMaybe<Array<Scalars['BigInt']>>;
  gasPrice_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  gasUsed?: InputMaybe<Scalars['BigInt']>;
  gasUsed_not?: InputMaybe<Scalars['BigInt']>;
  gasUsed_gt?: InputMaybe<Scalars['BigInt']>;
  gasUsed_lt?: InputMaybe<Scalars['BigInt']>;
  gasUsed_gte?: InputMaybe<Scalars['BigInt']>;
  gasUsed_lte?: InputMaybe<Scalars['BigInt']>;
  gasUsed_in?: InputMaybe<Array<Scalars['BigInt']>>;
  gasUsed_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  superToken?: InputMaybe<Scalars['Bytes']>;
  superToken_not?: InputMaybe<Scalars['Bytes']>;
  superToken_gt?: InputMaybe<Scalars['Bytes']>;
  superToken_lt?: InputMaybe<Scalars['Bytes']>;
  superToken_gte?: InputMaybe<Scalars['Bytes']>;
  superToken_lte?: InputMaybe<Scalars['Bytes']>;
  superToken_in?: InputMaybe<Array<Scalars['Bytes']>>;
  superToken_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  superToken_contains?: InputMaybe<Scalars['Bytes']>;
  superToken_not_contains?: InputMaybe<Scalars['Bytes']>;
  sender?: InputMaybe<Scalars['Bytes']>;
  sender_not?: InputMaybe<Scalars['Bytes']>;
  sender_gt?: InputMaybe<Scalars['Bytes']>;
  sender_lt?: InputMaybe<Scalars['Bytes']>;
  sender_gte?: InputMaybe<Scalars['Bytes']>;
  sender_lte?: InputMaybe<Scalars['Bytes']>;
  sender_in?: InputMaybe<Array<Scalars['Bytes']>>;
  sender_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  sender_contains?: InputMaybe<Scalars['Bytes']>;
  sender_not_contains?: InputMaybe<Scalars['Bytes']>;
  receiver?: InputMaybe<Scalars['Bytes']>;
  receiver_not?: InputMaybe<Scalars['Bytes']>;
  receiver_gt?: InputMaybe<Scalars['Bytes']>;
  receiver_lt?: InputMaybe<Scalars['Bytes']>;
  receiver_gte?: InputMaybe<Scalars['Bytes']>;
  receiver_lte?: InputMaybe<Scalars['Bytes']>;
  receiver_in?: InputMaybe<Array<Scalars['Bytes']>>;
  receiver_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  receiver_contains?: InputMaybe<Scalars['Bytes']>;
  receiver_not_contains?: InputMaybe<Scalars['Bytes']>;
  cliffAndFlowDate?: InputMaybe<Scalars['BigInt']>;
  cliffAndFlowDate_not?: InputMaybe<Scalars['BigInt']>;
  cliffAndFlowDate_gt?: InputMaybe<Scalars['BigInt']>;
  cliffAndFlowDate_lt?: InputMaybe<Scalars['BigInt']>;
  cliffAndFlowDate_gte?: InputMaybe<Scalars['BigInt']>;
  cliffAndFlowDate_lte?: InputMaybe<Scalars['BigInt']>;
  cliffAndFlowDate_in?: InputMaybe<Array<Scalars['BigInt']>>;
  cliffAndFlowDate_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  flowRate?: InputMaybe<Scalars['BigInt']>;
  flowRate_not?: InputMaybe<Scalars['BigInt']>;
  flowRate_gt?: InputMaybe<Scalars['BigInt']>;
  flowRate_lt?: InputMaybe<Scalars['BigInt']>;
  flowRate_gte?: InputMaybe<Scalars['BigInt']>;
  flowRate_lte?: InputMaybe<Scalars['BigInt']>;
  flowRate_in?: InputMaybe<Array<Scalars['BigInt']>>;
  flowRate_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  cliffAmount?: InputMaybe<Scalars['BigInt']>;
  cliffAmount_not?: InputMaybe<Scalars['BigInt']>;
  cliffAmount_gt?: InputMaybe<Scalars['BigInt']>;
  cliffAmount_lt?: InputMaybe<Scalars['BigInt']>;
  cliffAmount_gte?: InputMaybe<Scalars['BigInt']>;
  cliffAmount_lte?: InputMaybe<Scalars['BigInt']>;
  cliffAmount_in?: InputMaybe<Array<Scalars['BigInt']>>;
  cliffAmount_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  flowDelayCompensation?: InputMaybe<Scalars['BigInt']>;
  flowDelayCompensation_not?: InputMaybe<Scalars['BigInt']>;
  flowDelayCompensation_gt?: InputMaybe<Scalars['BigInt']>;
  flowDelayCompensation_lt?: InputMaybe<Scalars['BigInt']>;
  flowDelayCompensation_gte?: InputMaybe<Scalars['BigInt']>;
  flowDelayCompensation_lte?: InputMaybe<Scalars['BigInt']>;
  flowDelayCompensation_in?: InputMaybe<Array<Scalars['BigInt']>>;
  flowDelayCompensation_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<VestingCliffAndFlowExecutedEvent_filter>>>;
  or?: InputMaybe<Array<InputMaybe<VestingCliffAndFlowExecutedEvent_filter>>>;
};

export type VestingCliffAndFlowExecutedEvent_orderBy =
  | 'id'
  | 'blockNumber'
  | 'logIndex'
  | 'order'
  | 'name'
  | 'addresses'
  | 'timestamp'
  | 'transactionHash'
  | 'gasPrice'
  | 'gasUsed'
  | 'superToken'
  | 'sender'
  | 'receiver'
  | 'cliffAndFlowDate'
  | 'flowRate'
  | 'cliffAmount'
  | 'flowDelayCompensation';

export type VestingEndExecutedEvent = Event & {
  id: Scalars['ID'];
  blockNumber: Scalars['BigInt'];
  logIndex: Scalars['BigInt'];
  order: Scalars['BigInt'];
  name: Scalars['String'];
  /**
   * Holds the addresses for sender and receiver.
   *
   */
  addresses: Array<Scalars['Bytes']>;
  timestamp: Scalars['BigInt'];
  transactionHash: Scalars['Bytes'];
  gasPrice: Scalars['BigInt'];
  gasUsed: Scalars['BigInt'];
  superToken: Scalars['Bytes'];
  sender: Scalars['Bytes'];
  receiver: Scalars['Bytes'];
  endDate: Scalars['BigInt'];
  earlyEndCompensation: Scalars['BigInt'];
  didCompensationFail: Scalars['Boolean'];
};

export type VestingEndExecutedEvent_filter = {
  id?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  blockNumber?: InputMaybe<Scalars['BigInt']>;
  blockNumber_not?: InputMaybe<Scalars['BigInt']>;
  blockNumber_gt?: InputMaybe<Scalars['BigInt']>;
  blockNumber_lt?: InputMaybe<Scalars['BigInt']>;
  blockNumber_gte?: InputMaybe<Scalars['BigInt']>;
  blockNumber_lte?: InputMaybe<Scalars['BigInt']>;
  blockNumber_in?: InputMaybe<Array<Scalars['BigInt']>>;
  blockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  logIndex?: InputMaybe<Scalars['BigInt']>;
  logIndex_not?: InputMaybe<Scalars['BigInt']>;
  logIndex_gt?: InputMaybe<Scalars['BigInt']>;
  logIndex_lt?: InputMaybe<Scalars['BigInt']>;
  logIndex_gte?: InputMaybe<Scalars['BigInt']>;
  logIndex_lte?: InputMaybe<Scalars['BigInt']>;
  logIndex_in?: InputMaybe<Array<Scalars['BigInt']>>;
  logIndex_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  order?: InputMaybe<Scalars['BigInt']>;
  order_not?: InputMaybe<Scalars['BigInt']>;
  order_gt?: InputMaybe<Scalars['BigInt']>;
  order_lt?: InputMaybe<Scalars['BigInt']>;
  order_gte?: InputMaybe<Scalars['BigInt']>;
  order_lte?: InputMaybe<Scalars['BigInt']>;
  order_in?: InputMaybe<Array<Scalars['BigInt']>>;
  order_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  name?: InputMaybe<Scalars['String']>;
  name_not?: InputMaybe<Scalars['String']>;
  name_gt?: InputMaybe<Scalars['String']>;
  name_lt?: InputMaybe<Scalars['String']>;
  name_gte?: InputMaybe<Scalars['String']>;
  name_lte?: InputMaybe<Scalars['String']>;
  name_in?: InputMaybe<Array<Scalars['String']>>;
  name_not_in?: InputMaybe<Array<Scalars['String']>>;
  name_contains?: InputMaybe<Scalars['String']>;
  name_contains_nocase?: InputMaybe<Scalars['String']>;
  name_not_contains?: InputMaybe<Scalars['String']>;
  name_not_contains_nocase?: InputMaybe<Scalars['String']>;
  name_starts_with?: InputMaybe<Scalars['String']>;
  name_starts_with_nocase?: InputMaybe<Scalars['String']>;
  name_not_starts_with?: InputMaybe<Scalars['String']>;
  name_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  name_ends_with?: InputMaybe<Scalars['String']>;
  name_ends_with_nocase?: InputMaybe<Scalars['String']>;
  name_not_ends_with?: InputMaybe<Scalars['String']>;
  name_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  addresses?: InputMaybe<Array<Scalars['Bytes']>>;
  addresses_not?: InputMaybe<Array<Scalars['Bytes']>>;
  addresses_contains?: InputMaybe<Array<Scalars['Bytes']>>;
  addresses_contains_nocase?: InputMaybe<Array<Scalars['Bytes']>>;
  addresses_not_contains?: InputMaybe<Array<Scalars['Bytes']>>;
  addresses_not_contains_nocase?: InputMaybe<Array<Scalars['Bytes']>>;
  timestamp?: InputMaybe<Scalars['BigInt']>;
  timestamp_not?: InputMaybe<Scalars['BigInt']>;
  timestamp_gt?: InputMaybe<Scalars['BigInt']>;
  timestamp_lt?: InputMaybe<Scalars['BigInt']>;
  timestamp_gte?: InputMaybe<Scalars['BigInt']>;
  timestamp_lte?: InputMaybe<Scalars['BigInt']>;
  timestamp_in?: InputMaybe<Array<Scalars['BigInt']>>;
  timestamp_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  transactionHash?: InputMaybe<Scalars['Bytes']>;
  transactionHash_not?: InputMaybe<Scalars['Bytes']>;
  transactionHash_gt?: InputMaybe<Scalars['Bytes']>;
  transactionHash_lt?: InputMaybe<Scalars['Bytes']>;
  transactionHash_gte?: InputMaybe<Scalars['Bytes']>;
  transactionHash_lte?: InputMaybe<Scalars['Bytes']>;
  transactionHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  transactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  transactionHash_contains?: InputMaybe<Scalars['Bytes']>;
  transactionHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  gasPrice?: InputMaybe<Scalars['BigInt']>;
  gasPrice_not?: InputMaybe<Scalars['BigInt']>;
  gasPrice_gt?: InputMaybe<Scalars['BigInt']>;
  gasPrice_lt?: InputMaybe<Scalars['BigInt']>;
  gasPrice_gte?: InputMaybe<Scalars['BigInt']>;
  gasPrice_lte?: InputMaybe<Scalars['BigInt']>;
  gasPrice_in?: InputMaybe<Array<Scalars['BigInt']>>;
  gasPrice_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  gasUsed?: InputMaybe<Scalars['BigInt']>;
  gasUsed_not?: InputMaybe<Scalars['BigInt']>;
  gasUsed_gt?: InputMaybe<Scalars['BigInt']>;
  gasUsed_lt?: InputMaybe<Scalars['BigInt']>;
  gasUsed_gte?: InputMaybe<Scalars['BigInt']>;
  gasUsed_lte?: InputMaybe<Scalars['BigInt']>;
  gasUsed_in?: InputMaybe<Array<Scalars['BigInt']>>;
  gasUsed_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  superToken?: InputMaybe<Scalars['Bytes']>;
  superToken_not?: InputMaybe<Scalars['Bytes']>;
  superToken_gt?: InputMaybe<Scalars['Bytes']>;
  superToken_lt?: InputMaybe<Scalars['Bytes']>;
  superToken_gte?: InputMaybe<Scalars['Bytes']>;
  superToken_lte?: InputMaybe<Scalars['Bytes']>;
  superToken_in?: InputMaybe<Array<Scalars['Bytes']>>;
  superToken_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  superToken_contains?: InputMaybe<Scalars['Bytes']>;
  superToken_not_contains?: InputMaybe<Scalars['Bytes']>;
  sender?: InputMaybe<Scalars['Bytes']>;
  sender_not?: InputMaybe<Scalars['Bytes']>;
  sender_gt?: InputMaybe<Scalars['Bytes']>;
  sender_lt?: InputMaybe<Scalars['Bytes']>;
  sender_gte?: InputMaybe<Scalars['Bytes']>;
  sender_lte?: InputMaybe<Scalars['Bytes']>;
  sender_in?: InputMaybe<Array<Scalars['Bytes']>>;
  sender_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  sender_contains?: InputMaybe<Scalars['Bytes']>;
  sender_not_contains?: InputMaybe<Scalars['Bytes']>;
  receiver?: InputMaybe<Scalars['Bytes']>;
  receiver_not?: InputMaybe<Scalars['Bytes']>;
  receiver_gt?: InputMaybe<Scalars['Bytes']>;
  receiver_lt?: InputMaybe<Scalars['Bytes']>;
  receiver_gte?: InputMaybe<Scalars['Bytes']>;
  receiver_lte?: InputMaybe<Scalars['Bytes']>;
  receiver_in?: InputMaybe<Array<Scalars['Bytes']>>;
  receiver_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  receiver_contains?: InputMaybe<Scalars['Bytes']>;
  receiver_not_contains?: InputMaybe<Scalars['Bytes']>;
  endDate?: InputMaybe<Scalars['BigInt']>;
  endDate_not?: InputMaybe<Scalars['BigInt']>;
  endDate_gt?: InputMaybe<Scalars['BigInt']>;
  endDate_lt?: InputMaybe<Scalars['BigInt']>;
  endDate_gte?: InputMaybe<Scalars['BigInt']>;
  endDate_lte?: InputMaybe<Scalars['BigInt']>;
  endDate_in?: InputMaybe<Array<Scalars['BigInt']>>;
  endDate_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  earlyEndCompensation?: InputMaybe<Scalars['BigInt']>;
  earlyEndCompensation_not?: InputMaybe<Scalars['BigInt']>;
  earlyEndCompensation_gt?: InputMaybe<Scalars['BigInt']>;
  earlyEndCompensation_lt?: InputMaybe<Scalars['BigInt']>;
  earlyEndCompensation_gte?: InputMaybe<Scalars['BigInt']>;
  earlyEndCompensation_lte?: InputMaybe<Scalars['BigInt']>;
  earlyEndCompensation_in?: InputMaybe<Array<Scalars['BigInt']>>;
  earlyEndCompensation_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  didCompensationFail?: InputMaybe<Scalars['Boolean']>;
  didCompensationFail_not?: InputMaybe<Scalars['Boolean']>;
  didCompensationFail_in?: InputMaybe<Array<Scalars['Boolean']>>;
  didCompensationFail_not_in?: InputMaybe<Array<Scalars['Boolean']>>;
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<VestingEndExecutedEvent_filter>>>;
  or?: InputMaybe<Array<InputMaybe<VestingEndExecutedEvent_filter>>>;
};

export type VestingEndExecutedEvent_orderBy =
  | 'id'
  | 'blockNumber'
  | 'logIndex'
  | 'order'
  | 'name'
  | 'addresses'
  | 'timestamp'
  | 'transactionHash'
  | 'gasPrice'
  | 'gasUsed'
  | 'superToken'
  | 'sender'
  | 'receiver'
  | 'endDate'
  | 'earlyEndCompensation'
  | 'didCompensationFail';

export type VestingEndFailedEvent = Event & {
  id: Scalars['ID'];
  blockNumber: Scalars['BigInt'];
  logIndex: Scalars['BigInt'];
  order: Scalars['BigInt'];
  name: Scalars['String'];
  /**
   * Holds the addresses for sender and receiver.
   *
   */
  addresses: Array<Scalars['Bytes']>;
  timestamp: Scalars['BigInt'];
  transactionHash: Scalars['Bytes'];
  gasPrice: Scalars['BigInt'];
  gasUsed: Scalars['BigInt'];
  superToken: Scalars['Bytes'];
  sender: Scalars['Bytes'];
  receiver: Scalars['Bytes'];
  endDate: Scalars['BigInt'];
};

export type VestingEndFailedEvent_filter = {
  id?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  blockNumber?: InputMaybe<Scalars['BigInt']>;
  blockNumber_not?: InputMaybe<Scalars['BigInt']>;
  blockNumber_gt?: InputMaybe<Scalars['BigInt']>;
  blockNumber_lt?: InputMaybe<Scalars['BigInt']>;
  blockNumber_gte?: InputMaybe<Scalars['BigInt']>;
  blockNumber_lte?: InputMaybe<Scalars['BigInt']>;
  blockNumber_in?: InputMaybe<Array<Scalars['BigInt']>>;
  blockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  logIndex?: InputMaybe<Scalars['BigInt']>;
  logIndex_not?: InputMaybe<Scalars['BigInt']>;
  logIndex_gt?: InputMaybe<Scalars['BigInt']>;
  logIndex_lt?: InputMaybe<Scalars['BigInt']>;
  logIndex_gte?: InputMaybe<Scalars['BigInt']>;
  logIndex_lte?: InputMaybe<Scalars['BigInt']>;
  logIndex_in?: InputMaybe<Array<Scalars['BigInt']>>;
  logIndex_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  order?: InputMaybe<Scalars['BigInt']>;
  order_not?: InputMaybe<Scalars['BigInt']>;
  order_gt?: InputMaybe<Scalars['BigInt']>;
  order_lt?: InputMaybe<Scalars['BigInt']>;
  order_gte?: InputMaybe<Scalars['BigInt']>;
  order_lte?: InputMaybe<Scalars['BigInt']>;
  order_in?: InputMaybe<Array<Scalars['BigInt']>>;
  order_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  name?: InputMaybe<Scalars['String']>;
  name_not?: InputMaybe<Scalars['String']>;
  name_gt?: InputMaybe<Scalars['String']>;
  name_lt?: InputMaybe<Scalars['String']>;
  name_gte?: InputMaybe<Scalars['String']>;
  name_lte?: InputMaybe<Scalars['String']>;
  name_in?: InputMaybe<Array<Scalars['String']>>;
  name_not_in?: InputMaybe<Array<Scalars['String']>>;
  name_contains?: InputMaybe<Scalars['String']>;
  name_contains_nocase?: InputMaybe<Scalars['String']>;
  name_not_contains?: InputMaybe<Scalars['String']>;
  name_not_contains_nocase?: InputMaybe<Scalars['String']>;
  name_starts_with?: InputMaybe<Scalars['String']>;
  name_starts_with_nocase?: InputMaybe<Scalars['String']>;
  name_not_starts_with?: InputMaybe<Scalars['String']>;
  name_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  name_ends_with?: InputMaybe<Scalars['String']>;
  name_ends_with_nocase?: InputMaybe<Scalars['String']>;
  name_not_ends_with?: InputMaybe<Scalars['String']>;
  name_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  addresses?: InputMaybe<Array<Scalars['Bytes']>>;
  addresses_not?: InputMaybe<Array<Scalars['Bytes']>>;
  addresses_contains?: InputMaybe<Array<Scalars['Bytes']>>;
  addresses_contains_nocase?: InputMaybe<Array<Scalars['Bytes']>>;
  addresses_not_contains?: InputMaybe<Array<Scalars['Bytes']>>;
  addresses_not_contains_nocase?: InputMaybe<Array<Scalars['Bytes']>>;
  timestamp?: InputMaybe<Scalars['BigInt']>;
  timestamp_not?: InputMaybe<Scalars['BigInt']>;
  timestamp_gt?: InputMaybe<Scalars['BigInt']>;
  timestamp_lt?: InputMaybe<Scalars['BigInt']>;
  timestamp_gte?: InputMaybe<Scalars['BigInt']>;
  timestamp_lte?: InputMaybe<Scalars['BigInt']>;
  timestamp_in?: InputMaybe<Array<Scalars['BigInt']>>;
  timestamp_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  transactionHash?: InputMaybe<Scalars['Bytes']>;
  transactionHash_not?: InputMaybe<Scalars['Bytes']>;
  transactionHash_gt?: InputMaybe<Scalars['Bytes']>;
  transactionHash_lt?: InputMaybe<Scalars['Bytes']>;
  transactionHash_gte?: InputMaybe<Scalars['Bytes']>;
  transactionHash_lte?: InputMaybe<Scalars['Bytes']>;
  transactionHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  transactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  transactionHash_contains?: InputMaybe<Scalars['Bytes']>;
  transactionHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  gasPrice?: InputMaybe<Scalars['BigInt']>;
  gasPrice_not?: InputMaybe<Scalars['BigInt']>;
  gasPrice_gt?: InputMaybe<Scalars['BigInt']>;
  gasPrice_lt?: InputMaybe<Scalars['BigInt']>;
  gasPrice_gte?: InputMaybe<Scalars['BigInt']>;
  gasPrice_lte?: InputMaybe<Scalars['BigInt']>;
  gasPrice_in?: InputMaybe<Array<Scalars['BigInt']>>;
  gasPrice_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  gasUsed?: InputMaybe<Scalars['BigInt']>;
  gasUsed_not?: InputMaybe<Scalars['BigInt']>;
  gasUsed_gt?: InputMaybe<Scalars['BigInt']>;
  gasUsed_lt?: InputMaybe<Scalars['BigInt']>;
  gasUsed_gte?: InputMaybe<Scalars['BigInt']>;
  gasUsed_lte?: InputMaybe<Scalars['BigInt']>;
  gasUsed_in?: InputMaybe<Array<Scalars['BigInt']>>;
  gasUsed_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  superToken?: InputMaybe<Scalars['Bytes']>;
  superToken_not?: InputMaybe<Scalars['Bytes']>;
  superToken_gt?: InputMaybe<Scalars['Bytes']>;
  superToken_lt?: InputMaybe<Scalars['Bytes']>;
  superToken_gte?: InputMaybe<Scalars['Bytes']>;
  superToken_lte?: InputMaybe<Scalars['Bytes']>;
  superToken_in?: InputMaybe<Array<Scalars['Bytes']>>;
  superToken_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  superToken_contains?: InputMaybe<Scalars['Bytes']>;
  superToken_not_contains?: InputMaybe<Scalars['Bytes']>;
  sender?: InputMaybe<Scalars['Bytes']>;
  sender_not?: InputMaybe<Scalars['Bytes']>;
  sender_gt?: InputMaybe<Scalars['Bytes']>;
  sender_lt?: InputMaybe<Scalars['Bytes']>;
  sender_gte?: InputMaybe<Scalars['Bytes']>;
  sender_lte?: InputMaybe<Scalars['Bytes']>;
  sender_in?: InputMaybe<Array<Scalars['Bytes']>>;
  sender_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  sender_contains?: InputMaybe<Scalars['Bytes']>;
  sender_not_contains?: InputMaybe<Scalars['Bytes']>;
  receiver?: InputMaybe<Scalars['Bytes']>;
  receiver_not?: InputMaybe<Scalars['Bytes']>;
  receiver_gt?: InputMaybe<Scalars['Bytes']>;
  receiver_lt?: InputMaybe<Scalars['Bytes']>;
  receiver_gte?: InputMaybe<Scalars['Bytes']>;
  receiver_lte?: InputMaybe<Scalars['Bytes']>;
  receiver_in?: InputMaybe<Array<Scalars['Bytes']>>;
  receiver_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  receiver_contains?: InputMaybe<Scalars['Bytes']>;
  receiver_not_contains?: InputMaybe<Scalars['Bytes']>;
  endDate?: InputMaybe<Scalars['BigInt']>;
  endDate_not?: InputMaybe<Scalars['BigInt']>;
  endDate_gt?: InputMaybe<Scalars['BigInt']>;
  endDate_lt?: InputMaybe<Scalars['BigInt']>;
  endDate_gte?: InputMaybe<Scalars['BigInt']>;
  endDate_lte?: InputMaybe<Scalars['BigInt']>;
  endDate_in?: InputMaybe<Array<Scalars['BigInt']>>;
  endDate_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<VestingEndFailedEvent_filter>>>;
  or?: InputMaybe<Array<InputMaybe<VestingEndFailedEvent_filter>>>;
};

export type VestingEndFailedEvent_orderBy =
  | 'id'
  | 'blockNumber'
  | 'logIndex'
  | 'order'
  | 'name'
  | 'addresses'
  | 'timestamp'
  | 'transactionHash'
  | 'gasPrice'
  | 'gasUsed'
  | 'superToken'
  | 'sender'
  | 'receiver'
  | 'endDate';

export type VestingSchedule = {
  id: Scalars['String'];
  contractVersion: ContractVersion;
  createdAt: Scalars['BigInt'];
  superToken: Scalars['Bytes'];
  sender: Scalars['Bytes'];
  receiver: Scalars['Bytes'];
  startDate: Scalars['BigInt'];
  endDate: Scalars['BigInt'];
  cliffDate?: Maybe<Scalars['BigInt']>;
  cliffAndFlowDate: Scalars['BigInt'];
  cliffAmount: Scalars['BigInt'];
  flowRate: Scalars['BigInt'];
  didEarlyEndCompensationFail?: Maybe<Scalars['Boolean']>;
  earlyEndCompensation?: Maybe<Scalars['BigInt']>;
  cliffAndFlowExpirationAt: Scalars['BigInt'];
  endDateValidAt: Scalars['BigInt'];
  deletedAt?: Maybe<Scalars['BigInt']>;
  failedAt?: Maybe<Scalars['BigInt']>;
  cliffAndFlowExecutedAt?: Maybe<Scalars['BigInt']>;
  endExecutedAt?: Maybe<Scalars['BigInt']>;
  tasks: Array<Task>;
  events: Array<Event>;
  claimValidityDate: Scalars['BigInt'];
  claimedAt?: Maybe<Scalars['BigInt']>;
  remainderAmount: Scalars['BigInt'];
  totalAmount: Scalars['BigInt'];
  settledAmount: Scalars['BigInt'];
  settledAt: Scalars['BigInt'];
};


export type VestingScheduletasksArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Task_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<Task_filter>;
};


export type VestingScheduleeventsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Event_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<Event_filter>;
};

export type VestingScheduleCreatedEvent = Event & {
  id: Scalars['ID'];
  blockNumber: Scalars['BigInt'];
  logIndex: Scalars['BigInt'];
  order: Scalars['BigInt'];
  name: Scalars['String'];
  /**
   * Holds the addresses for sender and receiver.
   *
   */
  addresses: Array<Scalars['Bytes']>;
  timestamp: Scalars['BigInt'];
  transactionHash: Scalars['Bytes'];
  gasPrice: Scalars['BigInt'];
  superToken: Scalars['Bytes'];
  sender: Scalars['Bytes'];
  receiver: Scalars['Bytes'];
  startDate: Scalars['BigInt'];
  cliffDate: Scalars['BigInt'];
  flowRate: Scalars['BigInt'];
  endDate: Scalars['BigInt'];
  cliffAmount: Scalars['BigInt'];
  claimValidityDate: Scalars['BigInt'];
  remainderAmount: Scalars['BigInt'];
};

export type VestingScheduleCreatedEvent_filter = {
  id?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  blockNumber?: InputMaybe<Scalars['BigInt']>;
  blockNumber_not?: InputMaybe<Scalars['BigInt']>;
  blockNumber_gt?: InputMaybe<Scalars['BigInt']>;
  blockNumber_lt?: InputMaybe<Scalars['BigInt']>;
  blockNumber_gte?: InputMaybe<Scalars['BigInt']>;
  blockNumber_lte?: InputMaybe<Scalars['BigInt']>;
  blockNumber_in?: InputMaybe<Array<Scalars['BigInt']>>;
  blockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  logIndex?: InputMaybe<Scalars['BigInt']>;
  logIndex_not?: InputMaybe<Scalars['BigInt']>;
  logIndex_gt?: InputMaybe<Scalars['BigInt']>;
  logIndex_lt?: InputMaybe<Scalars['BigInt']>;
  logIndex_gte?: InputMaybe<Scalars['BigInt']>;
  logIndex_lte?: InputMaybe<Scalars['BigInt']>;
  logIndex_in?: InputMaybe<Array<Scalars['BigInt']>>;
  logIndex_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  order?: InputMaybe<Scalars['BigInt']>;
  order_not?: InputMaybe<Scalars['BigInt']>;
  order_gt?: InputMaybe<Scalars['BigInt']>;
  order_lt?: InputMaybe<Scalars['BigInt']>;
  order_gte?: InputMaybe<Scalars['BigInt']>;
  order_lte?: InputMaybe<Scalars['BigInt']>;
  order_in?: InputMaybe<Array<Scalars['BigInt']>>;
  order_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  name?: InputMaybe<Scalars['String']>;
  name_not?: InputMaybe<Scalars['String']>;
  name_gt?: InputMaybe<Scalars['String']>;
  name_lt?: InputMaybe<Scalars['String']>;
  name_gte?: InputMaybe<Scalars['String']>;
  name_lte?: InputMaybe<Scalars['String']>;
  name_in?: InputMaybe<Array<Scalars['String']>>;
  name_not_in?: InputMaybe<Array<Scalars['String']>>;
  name_contains?: InputMaybe<Scalars['String']>;
  name_contains_nocase?: InputMaybe<Scalars['String']>;
  name_not_contains?: InputMaybe<Scalars['String']>;
  name_not_contains_nocase?: InputMaybe<Scalars['String']>;
  name_starts_with?: InputMaybe<Scalars['String']>;
  name_starts_with_nocase?: InputMaybe<Scalars['String']>;
  name_not_starts_with?: InputMaybe<Scalars['String']>;
  name_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  name_ends_with?: InputMaybe<Scalars['String']>;
  name_ends_with_nocase?: InputMaybe<Scalars['String']>;
  name_not_ends_with?: InputMaybe<Scalars['String']>;
  name_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  addresses?: InputMaybe<Array<Scalars['Bytes']>>;
  addresses_not?: InputMaybe<Array<Scalars['Bytes']>>;
  addresses_contains?: InputMaybe<Array<Scalars['Bytes']>>;
  addresses_contains_nocase?: InputMaybe<Array<Scalars['Bytes']>>;
  addresses_not_contains?: InputMaybe<Array<Scalars['Bytes']>>;
  addresses_not_contains_nocase?: InputMaybe<Array<Scalars['Bytes']>>;
  timestamp?: InputMaybe<Scalars['BigInt']>;
  timestamp_not?: InputMaybe<Scalars['BigInt']>;
  timestamp_gt?: InputMaybe<Scalars['BigInt']>;
  timestamp_lt?: InputMaybe<Scalars['BigInt']>;
  timestamp_gte?: InputMaybe<Scalars['BigInt']>;
  timestamp_lte?: InputMaybe<Scalars['BigInt']>;
  timestamp_in?: InputMaybe<Array<Scalars['BigInt']>>;
  timestamp_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  transactionHash?: InputMaybe<Scalars['Bytes']>;
  transactionHash_not?: InputMaybe<Scalars['Bytes']>;
  transactionHash_gt?: InputMaybe<Scalars['Bytes']>;
  transactionHash_lt?: InputMaybe<Scalars['Bytes']>;
  transactionHash_gte?: InputMaybe<Scalars['Bytes']>;
  transactionHash_lte?: InputMaybe<Scalars['Bytes']>;
  transactionHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  transactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  transactionHash_contains?: InputMaybe<Scalars['Bytes']>;
  transactionHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  gasPrice?: InputMaybe<Scalars['BigInt']>;
  gasPrice_not?: InputMaybe<Scalars['BigInt']>;
  gasPrice_gt?: InputMaybe<Scalars['BigInt']>;
  gasPrice_lt?: InputMaybe<Scalars['BigInt']>;
  gasPrice_gte?: InputMaybe<Scalars['BigInt']>;
  gasPrice_lte?: InputMaybe<Scalars['BigInt']>;
  gasPrice_in?: InputMaybe<Array<Scalars['BigInt']>>;
  gasPrice_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  superToken?: InputMaybe<Scalars['Bytes']>;
  superToken_not?: InputMaybe<Scalars['Bytes']>;
  superToken_gt?: InputMaybe<Scalars['Bytes']>;
  superToken_lt?: InputMaybe<Scalars['Bytes']>;
  superToken_gte?: InputMaybe<Scalars['Bytes']>;
  superToken_lte?: InputMaybe<Scalars['Bytes']>;
  superToken_in?: InputMaybe<Array<Scalars['Bytes']>>;
  superToken_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  superToken_contains?: InputMaybe<Scalars['Bytes']>;
  superToken_not_contains?: InputMaybe<Scalars['Bytes']>;
  sender?: InputMaybe<Scalars['Bytes']>;
  sender_not?: InputMaybe<Scalars['Bytes']>;
  sender_gt?: InputMaybe<Scalars['Bytes']>;
  sender_lt?: InputMaybe<Scalars['Bytes']>;
  sender_gte?: InputMaybe<Scalars['Bytes']>;
  sender_lte?: InputMaybe<Scalars['Bytes']>;
  sender_in?: InputMaybe<Array<Scalars['Bytes']>>;
  sender_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  sender_contains?: InputMaybe<Scalars['Bytes']>;
  sender_not_contains?: InputMaybe<Scalars['Bytes']>;
  receiver?: InputMaybe<Scalars['Bytes']>;
  receiver_not?: InputMaybe<Scalars['Bytes']>;
  receiver_gt?: InputMaybe<Scalars['Bytes']>;
  receiver_lt?: InputMaybe<Scalars['Bytes']>;
  receiver_gte?: InputMaybe<Scalars['Bytes']>;
  receiver_lte?: InputMaybe<Scalars['Bytes']>;
  receiver_in?: InputMaybe<Array<Scalars['Bytes']>>;
  receiver_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  receiver_contains?: InputMaybe<Scalars['Bytes']>;
  receiver_not_contains?: InputMaybe<Scalars['Bytes']>;
  startDate?: InputMaybe<Scalars['BigInt']>;
  startDate_not?: InputMaybe<Scalars['BigInt']>;
  startDate_gt?: InputMaybe<Scalars['BigInt']>;
  startDate_lt?: InputMaybe<Scalars['BigInt']>;
  startDate_gte?: InputMaybe<Scalars['BigInt']>;
  startDate_lte?: InputMaybe<Scalars['BigInt']>;
  startDate_in?: InputMaybe<Array<Scalars['BigInt']>>;
  startDate_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  cliffDate?: InputMaybe<Scalars['BigInt']>;
  cliffDate_not?: InputMaybe<Scalars['BigInt']>;
  cliffDate_gt?: InputMaybe<Scalars['BigInt']>;
  cliffDate_lt?: InputMaybe<Scalars['BigInt']>;
  cliffDate_gte?: InputMaybe<Scalars['BigInt']>;
  cliffDate_lte?: InputMaybe<Scalars['BigInt']>;
  cliffDate_in?: InputMaybe<Array<Scalars['BigInt']>>;
  cliffDate_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  flowRate?: InputMaybe<Scalars['BigInt']>;
  flowRate_not?: InputMaybe<Scalars['BigInt']>;
  flowRate_gt?: InputMaybe<Scalars['BigInt']>;
  flowRate_lt?: InputMaybe<Scalars['BigInt']>;
  flowRate_gte?: InputMaybe<Scalars['BigInt']>;
  flowRate_lte?: InputMaybe<Scalars['BigInt']>;
  flowRate_in?: InputMaybe<Array<Scalars['BigInt']>>;
  flowRate_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  endDate?: InputMaybe<Scalars['BigInt']>;
  endDate_not?: InputMaybe<Scalars['BigInt']>;
  endDate_gt?: InputMaybe<Scalars['BigInt']>;
  endDate_lt?: InputMaybe<Scalars['BigInt']>;
  endDate_gte?: InputMaybe<Scalars['BigInt']>;
  endDate_lte?: InputMaybe<Scalars['BigInt']>;
  endDate_in?: InputMaybe<Array<Scalars['BigInt']>>;
  endDate_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  cliffAmount?: InputMaybe<Scalars['BigInt']>;
  cliffAmount_not?: InputMaybe<Scalars['BigInt']>;
  cliffAmount_gt?: InputMaybe<Scalars['BigInt']>;
  cliffAmount_lt?: InputMaybe<Scalars['BigInt']>;
  cliffAmount_gte?: InputMaybe<Scalars['BigInt']>;
  cliffAmount_lte?: InputMaybe<Scalars['BigInt']>;
  cliffAmount_in?: InputMaybe<Array<Scalars['BigInt']>>;
  cliffAmount_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  claimValidityDate?: InputMaybe<Scalars['BigInt']>;
  claimValidityDate_not?: InputMaybe<Scalars['BigInt']>;
  claimValidityDate_gt?: InputMaybe<Scalars['BigInt']>;
  claimValidityDate_lt?: InputMaybe<Scalars['BigInt']>;
  claimValidityDate_gte?: InputMaybe<Scalars['BigInt']>;
  claimValidityDate_lte?: InputMaybe<Scalars['BigInt']>;
  claimValidityDate_in?: InputMaybe<Array<Scalars['BigInt']>>;
  claimValidityDate_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  remainderAmount?: InputMaybe<Scalars['BigInt']>;
  remainderAmount_not?: InputMaybe<Scalars['BigInt']>;
  remainderAmount_gt?: InputMaybe<Scalars['BigInt']>;
  remainderAmount_lt?: InputMaybe<Scalars['BigInt']>;
  remainderAmount_gte?: InputMaybe<Scalars['BigInt']>;
  remainderAmount_lte?: InputMaybe<Scalars['BigInt']>;
  remainderAmount_in?: InputMaybe<Array<Scalars['BigInt']>>;
  remainderAmount_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<VestingScheduleCreatedEvent_filter>>>;
  or?: InputMaybe<Array<InputMaybe<VestingScheduleCreatedEvent_filter>>>;
};

export type VestingScheduleCreatedEvent_orderBy =
  | 'id'
  | 'blockNumber'
  | 'logIndex'
  | 'order'
  | 'name'
  | 'addresses'
  | 'timestamp'
  | 'transactionHash'
  | 'gasPrice'
  | 'superToken'
  | 'sender'
  | 'receiver'
  | 'startDate'
  | 'cliffDate'
  | 'flowRate'
  | 'endDate'
  | 'cliffAmount'
  | 'claimValidityDate'
  | 'remainderAmount';

export type VestingScheduleDeletedEvent = Event & {
  id: Scalars['ID'];
  blockNumber: Scalars['BigInt'];
  logIndex: Scalars['BigInt'];
  order: Scalars['BigInt'];
  name: Scalars['String'];
  /**
   * Holds the addresses for sender and receiver.
   *
   */
  addresses: Array<Scalars['Bytes']>;
  timestamp: Scalars['BigInt'];
  transactionHash: Scalars['Bytes'];
  gasPrice: Scalars['BigInt'];
  superToken: Scalars['Bytes'];
  sender: Scalars['Bytes'];
  receiver: Scalars['Bytes'];
};

export type VestingScheduleDeletedEvent_filter = {
  id?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  blockNumber?: InputMaybe<Scalars['BigInt']>;
  blockNumber_not?: InputMaybe<Scalars['BigInt']>;
  blockNumber_gt?: InputMaybe<Scalars['BigInt']>;
  blockNumber_lt?: InputMaybe<Scalars['BigInt']>;
  blockNumber_gte?: InputMaybe<Scalars['BigInt']>;
  blockNumber_lte?: InputMaybe<Scalars['BigInt']>;
  blockNumber_in?: InputMaybe<Array<Scalars['BigInt']>>;
  blockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  logIndex?: InputMaybe<Scalars['BigInt']>;
  logIndex_not?: InputMaybe<Scalars['BigInt']>;
  logIndex_gt?: InputMaybe<Scalars['BigInt']>;
  logIndex_lt?: InputMaybe<Scalars['BigInt']>;
  logIndex_gte?: InputMaybe<Scalars['BigInt']>;
  logIndex_lte?: InputMaybe<Scalars['BigInt']>;
  logIndex_in?: InputMaybe<Array<Scalars['BigInt']>>;
  logIndex_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  order?: InputMaybe<Scalars['BigInt']>;
  order_not?: InputMaybe<Scalars['BigInt']>;
  order_gt?: InputMaybe<Scalars['BigInt']>;
  order_lt?: InputMaybe<Scalars['BigInt']>;
  order_gte?: InputMaybe<Scalars['BigInt']>;
  order_lte?: InputMaybe<Scalars['BigInt']>;
  order_in?: InputMaybe<Array<Scalars['BigInt']>>;
  order_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  name?: InputMaybe<Scalars['String']>;
  name_not?: InputMaybe<Scalars['String']>;
  name_gt?: InputMaybe<Scalars['String']>;
  name_lt?: InputMaybe<Scalars['String']>;
  name_gte?: InputMaybe<Scalars['String']>;
  name_lte?: InputMaybe<Scalars['String']>;
  name_in?: InputMaybe<Array<Scalars['String']>>;
  name_not_in?: InputMaybe<Array<Scalars['String']>>;
  name_contains?: InputMaybe<Scalars['String']>;
  name_contains_nocase?: InputMaybe<Scalars['String']>;
  name_not_contains?: InputMaybe<Scalars['String']>;
  name_not_contains_nocase?: InputMaybe<Scalars['String']>;
  name_starts_with?: InputMaybe<Scalars['String']>;
  name_starts_with_nocase?: InputMaybe<Scalars['String']>;
  name_not_starts_with?: InputMaybe<Scalars['String']>;
  name_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  name_ends_with?: InputMaybe<Scalars['String']>;
  name_ends_with_nocase?: InputMaybe<Scalars['String']>;
  name_not_ends_with?: InputMaybe<Scalars['String']>;
  name_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  addresses?: InputMaybe<Array<Scalars['Bytes']>>;
  addresses_not?: InputMaybe<Array<Scalars['Bytes']>>;
  addresses_contains?: InputMaybe<Array<Scalars['Bytes']>>;
  addresses_contains_nocase?: InputMaybe<Array<Scalars['Bytes']>>;
  addresses_not_contains?: InputMaybe<Array<Scalars['Bytes']>>;
  addresses_not_contains_nocase?: InputMaybe<Array<Scalars['Bytes']>>;
  timestamp?: InputMaybe<Scalars['BigInt']>;
  timestamp_not?: InputMaybe<Scalars['BigInt']>;
  timestamp_gt?: InputMaybe<Scalars['BigInt']>;
  timestamp_lt?: InputMaybe<Scalars['BigInt']>;
  timestamp_gte?: InputMaybe<Scalars['BigInt']>;
  timestamp_lte?: InputMaybe<Scalars['BigInt']>;
  timestamp_in?: InputMaybe<Array<Scalars['BigInt']>>;
  timestamp_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  transactionHash?: InputMaybe<Scalars['Bytes']>;
  transactionHash_not?: InputMaybe<Scalars['Bytes']>;
  transactionHash_gt?: InputMaybe<Scalars['Bytes']>;
  transactionHash_lt?: InputMaybe<Scalars['Bytes']>;
  transactionHash_gte?: InputMaybe<Scalars['Bytes']>;
  transactionHash_lte?: InputMaybe<Scalars['Bytes']>;
  transactionHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  transactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  transactionHash_contains?: InputMaybe<Scalars['Bytes']>;
  transactionHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  gasPrice?: InputMaybe<Scalars['BigInt']>;
  gasPrice_not?: InputMaybe<Scalars['BigInt']>;
  gasPrice_gt?: InputMaybe<Scalars['BigInt']>;
  gasPrice_lt?: InputMaybe<Scalars['BigInt']>;
  gasPrice_gte?: InputMaybe<Scalars['BigInt']>;
  gasPrice_lte?: InputMaybe<Scalars['BigInt']>;
  gasPrice_in?: InputMaybe<Array<Scalars['BigInt']>>;
  gasPrice_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  superToken?: InputMaybe<Scalars['Bytes']>;
  superToken_not?: InputMaybe<Scalars['Bytes']>;
  superToken_gt?: InputMaybe<Scalars['Bytes']>;
  superToken_lt?: InputMaybe<Scalars['Bytes']>;
  superToken_gte?: InputMaybe<Scalars['Bytes']>;
  superToken_lte?: InputMaybe<Scalars['Bytes']>;
  superToken_in?: InputMaybe<Array<Scalars['Bytes']>>;
  superToken_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  superToken_contains?: InputMaybe<Scalars['Bytes']>;
  superToken_not_contains?: InputMaybe<Scalars['Bytes']>;
  sender?: InputMaybe<Scalars['Bytes']>;
  sender_not?: InputMaybe<Scalars['Bytes']>;
  sender_gt?: InputMaybe<Scalars['Bytes']>;
  sender_lt?: InputMaybe<Scalars['Bytes']>;
  sender_gte?: InputMaybe<Scalars['Bytes']>;
  sender_lte?: InputMaybe<Scalars['Bytes']>;
  sender_in?: InputMaybe<Array<Scalars['Bytes']>>;
  sender_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  sender_contains?: InputMaybe<Scalars['Bytes']>;
  sender_not_contains?: InputMaybe<Scalars['Bytes']>;
  receiver?: InputMaybe<Scalars['Bytes']>;
  receiver_not?: InputMaybe<Scalars['Bytes']>;
  receiver_gt?: InputMaybe<Scalars['Bytes']>;
  receiver_lt?: InputMaybe<Scalars['Bytes']>;
  receiver_gte?: InputMaybe<Scalars['Bytes']>;
  receiver_lte?: InputMaybe<Scalars['Bytes']>;
  receiver_in?: InputMaybe<Array<Scalars['Bytes']>>;
  receiver_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  receiver_contains?: InputMaybe<Scalars['Bytes']>;
  receiver_not_contains?: InputMaybe<Scalars['Bytes']>;
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<VestingScheduleDeletedEvent_filter>>>;
  or?: InputMaybe<Array<InputMaybe<VestingScheduleDeletedEvent_filter>>>;
};

export type VestingScheduleDeletedEvent_orderBy =
  | 'id'
  | 'blockNumber'
  | 'logIndex'
  | 'order'
  | 'name'
  | 'addresses'
  | 'timestamp'
  | 'transactionHash'
  | 'gasPrice'
  | 'superToken'
  | 'sender'
  | 'receiver';

export type VestingScheduleEndDateUpdatedEvent = Event & {
  id: Scalars['ID'];
  blockNumber: Scalars['BigInt'];
  logIndex: Scalars['BigInt'];
  order: Scalars['BigInt'];
  name: Scalars['String'];
  /**
   * Holds the addresses for sender and receiver.
   *
   */
  addresses: Array<Scalars['Bytes']>;
  timestamp: Scalars['BigInt'];
  transactionHash: Scalars['Bytes'];
  gasPrice: Scalars['BigInt'];
  superToken: Scalars['Bytes'];
  sender: Scalars['Bytes'];
  receiver: Scalars['Bytes'];
  oldEndDate: Scalars['BigInt'];
  endDate: Scalars['BigInt'];
  previousFlowRate: Scalars['BigInt'];
  newFlowRate: Scalars['BigInt'];
  remainderAmount: Scalars['BigInt'];
};

export type VestingScheduleEndDateUpdatedEvent_filter = {
  id?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  blockNumber?: InputMaybe<Scalars['BigInt']>;
  blockNumber_not?: InputMaybe<Scalars['BigInt']>;
  blockNumber_gt?: InputMaybe<Scalars['BigInt']>;
  blockNumber_lt?: InputMaybe<Scalars['BigInt']>;
  blockNumber_gte?: InputMaybe<Scalars['BigInt']>;
  blockNumber_lte?: InputMaybe<Scalars['BigInt']>;
  blockNumber_in?: InputMaybe<Array<Scalars['BigInt']>>;
  blockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  logIndex?: InputMaybe<Scalars['BigInt']>;
  logIndex_not?: InputMaybe<Scalars['BigInt']>;
  logIndex_gt?: InputMaybe<Scalars['BigInt']>;
  logIndex_lt?: InputMaybe<Scalars['BigInt']>;
  logIndex_gte?: InputMaybe<Scalars['BigInt']>;
  logIndex_lte?: InputMaybe<Scalars['BigInt']>;
  logIndex_in?: InputMaybe<Array<Scalars['BigInt']>>;
  logIndex_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  order?: InputMaybe<Scalars['BigInt']>;
  order_not?: InputMaybe<Scalars['BigInt']>;
  order_gt?: InputMaybe<Scalars['BigInt']>;
  order_lt?: InputMaybe<Scalars['BigInt']>;
  order_gte?: InputMaybe<Scalars['BigInt']>;
  order_lte?: InputMaybe<Scalars['BigInt']>;
  order_in?: InputMaybe<Array<Scalars['BigInt']>>;
  order_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  name?: InputMaybe<Scalars['String']>;
  name_not?: InputMaybe<Scalars['String']>;
  name_gt?: InputMaybe<Scalars['String']>;
  name_lt?: InputMaybe<Scalars['String']>;
  name_gte?: InputMaybe<Scalars['String']>;
  name_lte?: InputMaybe<Scalars['String']>;
  name_in?: InputMaybe<Array<Scalars['String']>>;
  name_not_in?: InputMaybe<Array<Scalars['String']>>;
  name_contains?: InputMaybe<Scalars['String']>;
  name_contains_nocase?: InputMaybe<Scalars['String']>;
  name_not_contains?: InputMaybe<Scalars['String']>;
  name_not_contains_nocase?: InputMaybe<Scalars['String']>;
  name_starts_with?: InputMaybe<Scalars['String']>;
  name_starts_with_nocase?: InputMaybe<Scalars['String']>;
  name_not_starts_with?: InputMaybe<Scalars['String']>;
  name_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  name_ends_with?: InputMaybe<Scalars['String']>;
  name_ends_with_nocase?: InputMaybe<Scalars['String']>;
  name_not_ends_with?: InputMaybe<Scalars['String']>;
  name_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  addresses?: InputMaybe<Array<Scalars['Bytes']>>;
  addresses_not?: InputMaybe<Array<Scalars['Bytes']>>;
  addresses_contains?: InputMaybe<Array<Scalars['Bytes']>>;
  addresses_contains_nocase?: InputMaybe<Array<Scalars['Bytes']>>;
  addresses_not_contains?: InputMaybe<Array<Scalars['Bytes']>>;
  addresses_not_contains_nocase?: InputMaybe<Array<Scalars['Bytes']>>;
  timestamp?: InputMaybe<Scalars['BigInt']>;
  timestamp_not?: InputMaybe<Scalars['BigInt']>;
  timestamp_gt?: InputMaybe<Scalars['BigInt']>;
  timestamp_lt?: InputMaybe<Scalars['BigInt']>;
  timestamp_gte?: InputMaybe<Scalars['BigInt']>;
  timestamp_lte?: InputMaybe<Scalars['BigInt']>;
  timestamp_in?: InputMaybe<Array<Scalars['BigInt']>>;
  timestamp_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  transactionHash?: InputMaybe<Scalars['Bytes']>;
  transactionHash_not?: InputMaybe<Scalars['Bytes']>;
  transactionHash_gt?: InputMaybe<Scalars['Bytes']>;
  transactionHash_lt?: InputMaybe<Scalars['Bytes']>;
  transactionHash_gte?: InputMaybe<Scalars['Bytes']>;
  transactionHash_lte?: InputMaybe<Scalars['Bytes']>;
  transactionHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  transactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  transactionHash_contains?: InputMaybe<Scalars['Bytes']>;
  transactionHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  gasPrice?: InputMaybe<Scalars['BigInt']>;
  gasPrice_not?: InputMaybe<Scalars['BigInt']>;
  gasPrice_gt?: InputMaybe<Scalars['BigInt']>;
  gasPrice_lt?: InputMaybe<Scalars['BigInt']>;
  gasPrice_gte?: InputMaybe<Scalars['BigInt']>;
  gasPrice_lte?: InputMaybe<Scalars['BigInt']>;
  gasPrice_in?: InputMaybe<Array<Scalars['BigInt']>>;
  gasPrice_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  superToken?: InputMaybe<Scalars['Bytes']>;
  superToken_not?: InputMaybe<Scalars['Bytes']>;
  superToken_gt?: InputMaybe<Scalars['Bytes']>;
  superToken_lt?: InputMaybe<Scalars['Bytes']>;
  superToken_gte?: InputMaybe<Scalars['Bytes']>;
  superToken_lte?: InputMaybe<Scalars['Bytes']>;
  superToken_in?: InputMaybe<Array<Scalars['Bytes']>>;
  superToken_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  superToken_contains?: InputMaybe<Scalars['Bytes']>;
  superToken_not_contains?: InputMaybe<Scalars['Bytes']>;
  sender?: InputMaybe<Scalars['Bytes']>;
  sender_not?: InputMaybe<Scalars['Bytes']>;
  sender_gt?: InputMaybe<Scalars['Bytes']>;
  sender_lt?: InputMaybe<Scalars['Bytes']>;
  sender_gte?: InputMaybe<Scalars['Bytes']>;
  sender_lte?: InputMaybe<Scalars['Bytes']>;
  sender_in?: InputMaybe<Array<Scalars['Bytes']>>;
  sender_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  sender_contains?: InputMaybe<Scalars['Bytes']>;
  sender_not_contains?: InputMaybe<Scalars['Bytes']>;
  receiver?: InputMaybe<Scalars['Bytes']>;
  receiver_not?: InputMaybe<Scalars['Bytes']>;
  receiver_gt?: InputMaybe<Scalars['Bytes']>;
  receiver_lt?: InputMaybe<Scalars['Bytes']>;
  receiver_gte?: InputMaybe<Scalars['Bytes']>;
  receiver_lte?: InputMaybe<Scalars['Bytes']>;
  receiver_in?: InputMaybe<Array<Scalars['Bytes']>>;
  receiver_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  receiver_contains?: InputMaybe<Scalars['Bytes']>;
  receiver_not_contains?: InputMaybe<Scalars['Bytes']>;
  oldEndDate?: InputMaybe<Scalars['BigInt']>;
  oldEndDate_not?: InputMaybe<Scalars['BigInt']>;
  oldEndDate_gt?: InputMaybe<Scalars['BigInt']>;
  oldEndDate_lt?: InputMaybe<Scalars['BigInt']>;
  oldEndDate_gte?: InputMaybe<Scalars['BigInt']>;
  oldEndDate_lte?: InputMaybe<Scalars['BigInt']>;
  oldEndDate_in?: InputMaybe<Array<Scalars['BigInt']>>;
  oldEndDate_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  endDate?: InputMaybe<Scalars['BigInt']>;
  endDate_not?: InputMaybe<Scalars['BigInt']>;
  endDate_gt?: InputMaybe<Scalars['BigInt']>;
  endDate_lt?: InputMaybe<Scalars['BigInt']>;
  endDate_gte?: InputMaybe<Scalars['BigInt']>;
  endDate_lte?: InputMaybe<Scalars['BigInt']>;
  endDate_in?: InputMaybe<Array<Scalars['BigInt']>>;
  endDate_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  previousFlowRate?: InputMaybe<Scalars['BigInt']>;
  previousFlowRate_not?: InputMaybe<Scalars['BigInt']>;
  previousFlowRate_gt?: InputMaybe<Scalars['BigInt']>;
  previousFlowRate_lt?: InputMaybe<Scalars['BigInt']>;
  previousFlowRate_gte?: InputMaybe<Scalars['BigInt']>;
  previousFlowRate_lte?: InputMaybe<Scalars['BigInt']>;
  previousFlowRate_in?: InputMaybe<Array<Scalars['BigInt']>>;
  previousFlowRate_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  newFlowRate?: InputMaybe<Scalars['BigInt']>;
  newFlowRate_not?: InputMaybe<Scalars['BigInt']>;
  newFlowRate_gt?: InputMaybe<Scalars['BigInt']>;
  newFlowRate_lt?: InputMaybe<Scalars['BigInt']>;
  newFlowRate_gte?: InputMaybe<Scalars['BigInt']>;
  newFlowRate_lte?: InputMaybe<Scalars['BigInt']>;
  newFlowRate_in?: InputMaybe<Array<Scalars['BigInt']>>;
  newFlowRate_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  remainderAmount?: InputMaybe<Scalars['BigInt']>;
  remainderAmount_not?: InputMaybe<Scalars['BigInt']>;
  remainderAmount_gt?: InputMaybe<Scalars['BigInt']>;
  remainderAmount_lt?: InputMaybe<Scalars['BigInt']>;
  remainderAmount_gte?: InputMaybe<Scalars['BigInt']>;
  remainderAmount_lte?: InputMaybe<Scalars['BigInt']>;
  remainderAmount_in?: InputMaybe<Array<Scalars['BigInt']>>;
  remainderAmount_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<VestingScheduleEndDateUpdatedEvent_filter>>>;
  or?: InputMaybe<Array<InputMaybe<VestingScheduleEndDateUpdatedEvent_filter>>>;
};

export type VestingScheduleEndDateUpdatedEvent_orderBy =
  | 'id'
  | 'blockNumber'
  | 'logIndex'
  | 'order'
  | 'name'
  | 'addresses'
  | 'timestamp'
  | 'transactionHash'
  | 'gasPrice'
  | 'superToken'
  | 'sender'
  | 'receiver'
  | 'oldEndDate'
  | 'endDate'
  | 'previousFlowRate'
  | 'newFlowRate'
  | 'remainderAmount';

export type VestingScheduleUpdatedEvent = Event & {
  id: Scalars['ID'];
  blockNumber: Scalars['BigInt'];
  logIndex: Scalars['BigInt'];
  order: Scalars['BigInt'];
  name: Scalars['String'];
  /**
   * Holds the addresses for sender and receiver.
   *
   */
  addresses: Array<Scalars['Bytes']>;
  timestamp: Scalars['BigInt'];
  transactionHash: Scalars['Bytes'];
  gasPrice: Scalars['BigInt'];
  superToken: Scalars['Bytes'];
  sender: Scalars['Bytes'];
  receiver: Scalars['Bytes'];
  oldEndDate: Scalars['BigInt'];
  endDate: Scalars['BigInt'];
  remainderAmount: Scalars['BigInt'];
  oldRemainderAmount: Scalars['BigInt'];
  flowRate: Scalars['BigInt'];
  oldFlowRate: Scalars['BigInt'];
  totalAmount: Scalars['BigInt'];
  oldTotalAmount: Scalars['BigInt'];
  settledAmount: Scalars['BigInt'];
};

export type VestingScheduleUpdatedEvent_filter = {
  id?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  blockNumber?: InputMaybe<Scalars['BigInt']>;
  blockNumber_not?: InputMaybe<Scalars['BigInt']>;
  blockNumber_gt?: InputMaybe<Scalars['BigInt']>;
  blockNumber_lt?: InputMaybe<Scalars['BigInt']>;
  blockNumber_gte?: InputMaybe<Scalars['BigInt']>;
  blockNumber_lte?: InputMaybe<Scalars['BigInt']>;
  blockNumber_in?: InputMaybe<Array<Scalars['BigInt']>>;
  blockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  logIndex?: InputMaybe<Scalars['BigInt']>;
  logIndex_not?: InputMaybe<Scalars['BigInt']>;
  logIndex_gt?: InputMaybe<Scalars['BigInt']>;
  logIndex_lt?: InputMaybe<Scalars['BigInt']>;
  logIndex_gte?: InputMaybe<Scalars['BigInt']>;
  logIndex_lte?: InputMaybe<Scalars['BigInt']>;
  logIndex_in?: InputMaybe<Array<Scalars['BigInt']>>;
  logIndex_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  order?: InputMaybe<Scalars['BigInt']>;
  order_not?: InputMaybe<Scalars['BigInt']>;
  order_gt?: InputMaybe<Scalars['BigInt']>;
  order_lt?: InputMaybe<Scalars['BigInt']>;
  order_gte?: InputMaybe<Scalars['BigInt']>;
  order_lte?: InputMaybe<Scalars['BigInt']>;
  order_in?: InputMaybe<Array<Scalars['BigInt']>>;
  order_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  name?: InputMaybe<Scalars['String']>;
  name_not?: InputMaybe<Scalars['String']>;
  name_gt?: InputMaybe<Scalars['String']>;
  name_lt?: InputMaybe<Scalars['String']>;
  name_gte?: InputMaybe<Scalars['String']>;
  name_lte?: InputMaybe<Scalars['String']>;
  name_in?: InputMaybe<Array<Scalars['String']>>;
  name_not_in?: InputMaybe<Array<Scalars['String']>>;
  name_contains?: InputMaybe<Scalars['String']>;
  name_contains_nocase?: InputMaybe<Scalars['String']>;
  name_not_contains?: InputMaybe<Scalars['String']>;
  name_not_contains_nocase?: InputMaybe<Scalars['String']>;
  name_starts_with?: InputMaybe<Scalars['String']>;
  name_starts_with_nocase?: InputMaybe<Scalars['String']>;
  name_not_starts_with?: InputMaybe<Scalars['String']>;
  name_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  name_ends_with?: InputMaybe<Scalars['String']>;
  name_ends_with_nocase?: InputMaybe<Scalars['String']>;
  name_not_ends_with?: InputMaybe<Scalars['String']>;
  name_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  addresses?: InputMaybe<Array<Scalars['Bytes']>>;
  addresses_not?: InputMaybe<Array<Scalars['Bytes']>>;
  addresses_contains?: InputMaybe<Array<Scalars['Bytes']>>;
  addresses_contains_nocase?: InputMaybe<Array<Scalars['Bytes']>>;
  addresses_not_contains?: InputMaybe<Array<Scalars['Bytes']>>;
  addresses_not_contains_nocase?: InputMaybe<Array<Scalars['Bytes']>>;
  timestamp?: InputMaybe<Scalars['BigInt']>;
  timestamp_not?: InputMaybe<Scalars['BigInt']>;
  timestamp_gt?: InputMaybe<Scalars['BigInt']>;
  timestamp_lt?: InputMaybe<Scalars['BigInt']>;
  timestamp_gte?: InputMaybe<Scalars['BigInt']>;
  timestamp_lte?: InputMaybe<Scalars['BigInt']>;
  timestamp_in?: InputMaybe<Array<Scalars['BigInt']>>;
  timestamp_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  transactionHash?: InputMaybe<Scalars['Bytes']>;
  transactionHash_not?: InputMaybe<Scalars['Bytes']>;
  transactionHash_gt?: InputMaybe<Scalars['Bytes']>;
  transactionHash_lt?: InputMaybe<Scalars['Bytes']>;
  transactionHash_gte?: InputMaybe<Scalars['Bytes']>;
  transactionHash_lte?: InputMaybe<Scalars['Bytes']>;
  transactionHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  transactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  transactionHash_contains?: InputMaybe<Scalars['Bytes']>;
  transactionHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  gasPrice?: InputMaybe<Scalars['BigInt']>;
  gasPrice_not?: InputMaybe<Scalars['BigInt']>;
  gasPrice_gt?: InputMaybe<Scalars['BigInt']>;
  gasPrice_lt?: InputMaybe<Scalars['BigInt']>;
  gasPrice_gte?: InputMaybe<Scalars['BigInt']>;
  gasPrice_lte?: InputMaybe<Scalars['BigInt']>;
  gasPrice_in?: InputMaybe<Array<Scalars['BigInt']>>;
  gasPrice_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  superToken?: InputMaybe<Scalars['Bytes']>;
  superToken_not?: InputMaybe<Scalars['Bytes']>;
  superToken_gt?: InputMaybe<Scalars['Bytes']>;
  superToken_lt?: InputMaybe<Scalars['Bytes']>;
  superToken_gte?: InputMaybe<Scalars['Bytes']>;
  superToken_lte?: InputMaybe<Scalars['Bytes']>;
  superToken_in?: InputMaybe<Array<Scalars['Bytes']>>;
  superToken_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  superToken_contains?: InputMaybe<Scalars['Bytes']>;
  superToken_not_contains?: InputMaybe<Scalars['Bytes']>;
  sender?: InputMaybe<Scalars['Bytes']>;
  sender_not?: InputMaybe<Scalars['Bytes']>;
  sender_gt?: InputMaybe<Scalars['Bytes']>;
  sender_lt?: InputMaybe<Scalars['Bytes']>;
  sender_gte?: InputMaybe<Scalars['Bytes']>;
  sender_lte?: InputMaybe<Scalars['Bytes']>;
  sender_in?: InputMaybe<Array<Scalars['Bytes']>>;
  sender_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  sender_contains?: InputMaybe<Scalars['Bytes']>;
  sender_not_contains?: InputMaybe<Scalars['Bytes']>;
  receiver?: InputMaybe<Scalars['Bytes']>;
  receiver_not?: InputMaybe<Scalars['Bytes']>;
  receiver_gt?: InputMaybe<Scalars['Bytes']>;
  receiver_lt?: InputMaybe<Scalars['Bytes']>;
  receiver_gte?: InputMaybe<Scalars['Bytes']>;
  receiver_lte?: InputMaybe<Scalars['Bytes']>;
  receiver_in?: InputMaybe<Array<Scalars['Bytes']>>;
  receiver_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  receiver_contains?: InputMaybe<Scalars['Bytes']>;
  receiver_not_contains?: InputMaybe<Scalars['Bytes']>;
  oldEndDate?: InputMaybe<Scalars['BigInt']>;
  oldEndDate_not?: InputMaybe<Scalars['BigInt']>;
  oldEndDate_gt?: InputMaybe<Scalars['BigInt']>;
  oldEndDate_lt?: InputMaybe<Scalars['BigInt']>;
  oldEndDate_gte?: InputMaybe<Scalars['BigInt']>;
  oldEndDate_lte?: InputMaybe<Scalars['BigInt']>;
  oldEndDate_in?: InputMaybe<Array<Scalars['BigInt']>>;
  oldEndDate_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  endDate?: InputMaybe<Scalars['BigInt']>;
  endDate_not?: InputMaybe<Scalars['BigInt']>;
  endDate_gt?: InputMaybe<Scalars['BigInt']>;
  endDate_lt?: InputMaybe<Scalars['BigInt']>;
  endDate_gte?: InputMaybe<Scalars['BigInt']>;
  endDate_lte?: InputMaybe<Scalars['BigInt']>;
  endDate_in?: InputMaybe<Array<Scalars['BigInt']>>;
  endDate_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  remainderAmount?: InputMaybe<Scalars['BigInt']>;
  remainderAmount_not?: InputMaybe<Scalars['BigInt']>;
  remainderAmount_gt?: InputMaybe<Scalars['BigInt']>;
  remainderAmount_lt?: InputMaybe<Scalars['BigInt']>;
  remainderAmount_gte?: InputMaybe<Scalars['BigInt']>;
  remainderAmount_lte?: InputMaybe<Scalars['BigInt']>;
  remainderAmount_in?: InputMaybe<Array<Scalars['BigInt']>>;
  remainderAmount_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  oldRemainderAmount?: InputMaybe<Scalars['BigInt']>;
  oldRemainderAmount_not?: InputMaybe<Scalars['BigInt']>;
  oldRemainderAmount_gt?: InputMaybe<Scalars['BigInt']>;
  oldRemainderAmount_lt?: InputMaybe<Scalars['BigInt']>;
  oldRemainderAmount_gte?: InputMaybe<Scalars['BigInt']>;
  oldRemainderAmount_lte?: InputMaybe<Scalars['BigInt']>;
  oldRemainderAmount_in?: InputMaybe<Array<Scalars['BigInt']>>;
  oldRemainderAmount_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  flowRate?: InputMaybe<Scalars['BigInt']>;
  flowRate_not?: InputMaybe<Scalars['BigInt']>;
  flowRate_gt?: InputMaybe<Scalars['BigInt']>;
  flowRate_lt?: InputMaybe<Scalars['BigInt']>;
  flowRate_gte?: InputMaybe<Scalars['BigInt']>;
  flowRate_lte?: InputMaybe<Scalars['BigInt']>;
  flowRate_in?: InputMaybe<Array<Scalars['BigInt']>>;
  flowRate_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  oldFlowRate?: InputMaybe<Scalars['BigInt']>;
  oldFlowRate_not?: InputMaybe<Scalars['BigInt']>;
  oldFlowRate_gt?: InputMaybe<Scalars['BigInt']>;
  oldFlowRate_lt?: InputMaybe<Scalars['BigInt']>;
  oldFlowRate_gte?: InputMaybe<Scalars['BigInt']>;
  oldFlowRate_lte?: InputMaybe<Scalars['BigInt']>;
  oldFlowRate_in?: InputMaybe<Array<Scalars['BigInt']>>;
  oldFlowRate_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  totalAmount?: InputMaybe<Scalars['BigInt']>;
  totalAmount_not?: InputMaybe<Scalars['BigInt']>;
  totalAmount_gt?: InputMaybe<Scalars['BigInt']>;
  totalAmount_lt?: InputMaybe<Scalars['BigInt']>;
  totalAmount_gte?: InputMaybe<Scalars['BigInt']>;
  totalAmount_lte?: InputMaybe<Scalars['BigInt']>;
  totalAmount_in?: InputMaybe<Array<Scalars['BigInt']>>;
  totalAmount_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  oldTotalAmount?: InputMaybe<Scalars['BigInt']>;
  oldTotalAmount_not?: InputMaybe<Scalars['BigInt']>;
  oldTotalAmount_gt?: InputMaybe<Scalars['BigInt']>;
  oldTotalAmount_lt?: InputMaybe<Scalars['BigInt']>;
  oldTotalAmount_gte?: InputMaybe<Scalars['BigInt']>;
  oldTotalAmount_lte?: InputMaybe<Scalars['BigInt']>;
  oldTotalAmount_in?: InputMaybe<Array<Scalars['BigInt']>>;
  oldTotalAmount_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  settledAmount?: InputMaybe<Scalars['BigInt']>;
  settledAmount_not?: InputMaybe<Scalars['BigInt']>;
  settledAmount_gt?: InputMaybe<Scalars['BigInt']>;
  settledAmount_lt?: InputMaybe<Scalars['BigInt']>;
  settledAmount_gte?: InputMaybe<Scalars['BigInt']>;
  settledAmount_lte?: InputMaybe<Scalars['BigInt']>;
  settledAmount_in?: InputMaybe<Array<Scalars['BigInt']>>;
  settledAmount_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<VestingScheduleUpdatedEvent_filter>>>;
  or?: InputMaybe<Array<InputMaybe<VestingScheduleUpdatedEvent_filter>>>;
};

export type VestingScheduleUpdatedEvent_orderBy =
  | 'id'
  | 'blockNumber'
  | 'logIndex'
  | 'order'
  | 'name'
  | 'addresses'
  | 'timestamp'
  | 'transactionHash'
  | 'gasPrice'
  | 'superToken'
  | 'sender'
  | 'receiver'
  | 'oldEndDate'
  | 'endDate'
  | 'remainderAmount'
  | 'oldRemainderAmount'
  | 'flowRate'
  | 'oldFlowRate'
  | 'totalAmount'
  | 'oldTotalAmount'
  | 'settledAmount';

export type VestingSchedule_filter = {
  id?: InputMaybe<Scalars['String']>;
  id_not?: InputMaybe<Scalars['String']>;
  id_gt?: InputMaybe<Scalars['String']>;
  id_lt?: InputMaybe<Scalars['String']>;
  id_gte?: InputMaybe<Scalars['String']>;
  id_lte?: InputMaybe<Scalars['String']>;
  id_in?: InputMaybe<Array<Scalars['String']>>;
  id_not_in?: InputMaybe<Array<Scalars['String']>>;
  id_contains?: InputMaybe<Scalars['String']>;
  id_contains_nocase?: InputMaybe<Scalars['String']>;
  id_not_contains?: InputMaybe<Scalars['String']>;
  id_not_contains_nocase?: InputMaybe<Scalars['String']>;
  id_starts_with?: InputMaybe<Scalars['String']>;
  id_starts_with_nocase?: InputMaybe<Scalars['String']>;
  id_not_starts_with?: InputMaybe<Scalars['String']>;
  id_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  id_ends_with?: InputMaybe<Scalars['String']>;
  id_ends_with_nocase?: InputMaybe<Scalars['String']>;
  id_not_ends_with?: InputMaybe<Scalars['String']>;
  id_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  contractVersion?: InputMaybe<ContractVersion>;
  contractVersion_not?: InputMaybe<ContractVersion>;
  contractVersion_in?: InputMaybe<Array<ContractVersion>>;
  contractVersion_not_in?: InputMaybe<Array<ContractVersion>>;
  createdAt?: InputMaybe<Scalars['BigInt']>;
  createdAt_not?: InputMaybe<Scalars['BigInt']>;
  createdAt_gt?: InputMaybe<Scalars['BigInt']>;
  createdAt_lt?: InputMaybe<Scalars['BigInt']>;
  createdAt_gte?: InputMaybe<Scalars['BigInt']>;
  createdAt_lte?: InputMaybe<Scalars['BigInt']>;
  createdAt_in?: InputMaybe<Array<Scalars['BigInt']>>;
  createdAt_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  superToken?: InputMaybe<Scalars['Bytes']>;
  superToken_not?: InputMaybe<Scalars['Bytes']>;
  superToken_gt?: InputMaybe<Scalars['Bytes']>;
  superToken_lt?: InputMaybe<Scalars['Bytes']>;
  superToken_gte?: InputMaybe<Scalars['Bytes']>;
  superToken_lte?: InputMaybe<Scalars['Bytes']>;
  superToken_in?: InputMaybe<Array<Scalars['Bytes']>>;
  superToken_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  superToken_contains?: InputMaybe<Scalars['Bytes']>;
  superToken_not_contains?: InputMaybe<Scalars['Bytes']>;
  sender?: InputMaybe<Scalars['Bytes']>;
  sender_not?: InputMaybe<Scalars['Bytes']>;
  sender_gt?: InputMaybe<Scalars['Bytes']>;
  sender_lt?: InputMaybe<Scalars['Bytes']>;
  sender_gte?: InputMaybe<Scalars['Bytes']>;
  sender_lte?: InputMaybe<Scalars['Bytes']>;
  sender_in?: InputMaybe<Array<Scalars['Bytes']>>;
  sender_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  sender_contains?: InputMaybe<Scalars['Bytes']>;
  sender_not_contains?: InputMaybe<Scalars['Bytes']>;
  receiver?: InputMaybe<Scalars['Bytes']>;
  receiver_not?: InputMaybe<Scalars['Bytes']>;
  receiver_gt?: InputMaybe<Scalars['Bytes']>;
  receiver_lt?: InputMaybe<Scalars['Bytes']>;
  receiver_gte?: InputMaybe<Scalars['Bytes']>;
  receiver_lte?: InputMaybe<Scalars['Bytes']>;
  receiver_in?: InputMaybe<Array<Scalars['Bytes']>>;
  receiver_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  receiver_contains?: InputMaybe<Scalars['Bytes']>;
  receiver_not_contains?: InputMaybe<Scalars['Bytes']>;
  startDate?: InputMaybe<Scalars['BigInt']>;
  startDate_not?: InputMaybe<Scalars['BigInt']>;
  startDate_gt?: InputMaybe<Scalars['BigInt']>;
  startDate_lt?: InputMaybe<Scalars['BigInt']>;
  startDate_gte?: InputMaybe<Scalars['BigInt']>;
  startDate_lte?: InputMaybe<Scalars['BigInt']>;
  startDate_in?: InputMaybe<Array<Scalars['BigInt']>>;
  startDate_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  endDate?: InputMaybe<Scalars['BigInt']>;
  endDate_not?: InputMaybe<Scalars['BigInt']>;
  endDate_gt?: InputMaybe<Scalars['BigInt']>;
  endDate_lt?: InputMaybe<Scalars['BigInt']>;
  endDate_gte?: InputMaybe<Scalars['BigInt']>;
  endDate_lte?: InputMaybe<Scalars['BigInt']>;
  endDate_in?: InputMaybe<Array<Scalars['BigInt']>>;
  endDate_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  cliffDate?: InputMaybe<Scalars['BigInt']>;
  cliffDate_not?: InputMaybe<Scalars['BigInt']>;
  cliffDate_gt?: InputMaybe<Scalars['BigInt']>;
  cliffDate_lt?: InputMaybe<Scalars['BigInt']>;
  cliffDate_gte?: InputMaybe<Scalars['BigInt']>;
  cliffDate_lte?: InputMaybe<Scalars['BigInt']>;
  cliffDate_in?: InputMaybe<Array<Scalars['BigInt']>>;
  cliffDate_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  cliffAndFlowDate?: InputMaybe<Scalars['BigInt']>;
  cliffAndFlowDate_not?: InputMaybe<Scalars['BigInt']>;
  cliffAndFlowDate_gt?: InputMaybe<Scalars['BigInt']>;
  cliffAndFlowDate_lt?: InputMaybe<Scalars['BigInt']>;
  cliffAndFlowDate_gte?: InputMaybe<Scalars['BigInt']>;
  cliffAndFlowDate_lte?: InputMaybe<Scalars['BigInt']>;
  cliffAndFlowDate_in?: InputMaybe<Array<Scalars['BigInt']>>;
  cliffAndFlowDate_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  cliffAmount?: InputMaybe<Scalars['BigInt']>;
  cliffAmount_not?: InputMaybe<Scalars['BigInt']>;
  cliffAmount_gt?: InputMaybe<Scalars['BigInt']>;
  cliffAmount_lt?: InputMaybe<Scalars['BigInt']>;
  cliffAmount_gte?: InputMaybe<Scalars['BigInt']>;
  cliffAmount_lte?: InputMaybe<Scalars['BigInt']>;
  cliffAmount_in?: InputMaybe<Array<Scalars['BigInt']>>;
  cliffAmount_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  flowRate?: InputMaybe<Scalars['BigInt']>;
  flowRate_not?: InputMaybe<Scalars['BigInt']>;
  flowRate_gt?: InputMaybe<Scalars['BigInt']>;
  flowRate_lt?: InputMaybe<Scalars['BigInt']>;
  flowRate_gte?: InputMaybe<Scalars['BigInt']>;
  flowRate_lte?: InputMaybe<Scalars['BigInt']>;
  flowRate_in?: InputMaybe<Array<Scalars['BigInt']>>;
  flowRate_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  didEarlyEndCompensationFail?: InputMaybe<Scalars['Boolean']>;
  didEarlyEndCompensationFail_not?: InputMaybe<Scalars['Boolean']>;
  didEarlyEndCompensationFail_in?: InputMaybe<Array<Scalars['Boolean']>>;
  didEarlyEndCompensationFail_not_in?: InputMaybe<Array<Scalars['Boolean']>>;
  earlyEndCompensation?: InputMaybe<Scalars['BigInt']>;
  earlyEndCompensation_not?: InputMaybe<Scalars['BigInt']>;
  earlyEndCompensation_gt?: InputMaybe<Scalars['BigInt']>;
  earlyEndCompensation_lt?: InputMaybe<Scalars['BigInt']>;
  earlyEndCompensation_gte?: InputMaybe<Scalars['BigInt']>;
  earlyEndCompensation_lte?: InputMaybe<Scalars['BigInt']>;
  earlyEndCompensation_in?: InputMaybe<Array<Scalars['BigInt']>>;
  earlyEndCompensation_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  cliffAndFlowExpirationAt?: InputMaybe<Scalars['BigInt']>;
  cliffAndFlowExpirationAt_not?: InputMaybe<Scalars['BigInt']>;
  cliffAndFlowExpirationAt_gt?: InputMaybe<Scalars['BigInt']>;
  cliffAndFlowExpirationAt_lt?: InputMaybe<Scalars['BigInt']>;
  cliffAndFlowExpirationAt_gte?: InputMaybe<Scalars['BigInt']>;
  cliffAndFlowExpirationAt_lte?: InputMaybe<Scalars['BigInt']>;
  cliffAndFlowExpirationAt_in?: InputMaybe<Array<Scalars['BigInt']>>;
  cliffAndFlowExpirationAt_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  endDateValidAt?: InputMaybe<Scalars['BigInt']>;
  endDateValidAt_not?: InputMaybe<Scalars['BigInt']>;
  endDateValidAt_gt?: InputMaybe<Scalars['BigInt']>;
  endDateValidAt_lt?: InputMaybe<Scalars['BigInt']>;
  endDateValidAt_gte?: InputMaybe<Scalars['BigInt']>;
  endDateValidAt_lte?: InputMaybe<Scalars['BigInt']>;
  endDateValidAt_in?: InputMaybe<Array<Scalars['BigInt']>>;
  endDateValidAt_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  deletedAt?: InputMaybe<Scalars['BigInt']>;
  deletedAt_not?: InputMaybe<Scalars['BigInt']>;
  deletedAt_gt?: InputMaybe<Scalars['BigInt']>;
  deletedAt_lt?: InputMaybe<Scalars['BigInt']>;
  deletedAt_gte?: InputMaybe<Scalars['BigInt']>;
  deletedAt_lte?: InputMaybe<Scalars['BigInt']>;
  deletedAt_in?: InputMaybe<Array<Scalars['BigInt']>>;
  deletedAt_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  failedAt?: InputMaybe<Scalars['BigInt']>;
  failedAt_not?: InputMaybe<Scalars['BigInt']>;
  failedAt_gt?: InputMaybe<Scalars['BigInt']>;
  failedAt_lt?: InputMaybe<Scalars['BigInt']>;
  failedAt_gte?: InputMaybe<Scalars['BigInt']>;
  failedAt_lte?: InputMaybe<Scalars['BigInt']>;
  failedAt_in?: InputMaybe<Array<Scalars['BigInt']>>;
  failedAt_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  cliffAndFlowExecutedAt?: InputMaybe<Scalars['BigInt']>;
  cliffAndFlowExecutedAt_not?: InputMaybe<Scalars['BigInt']>;
  cliffAndFlowExecutedAt_gt?: InputMaybe<Scalars['BigInt']>;
  cliffAndFlowExecutedAt_lt?: InputMaybe<Scalars['BigInt']>;
  cliffAndFlowExecutedAt_gte?: InputMaybe<Scalars['BigInt']>;
  cliffAndFlowExecutedAt_lte?: InputMaybe<Scalars['BigInt']>;
  cliffAndFlowExecutedAt_in?: InputMaybe<Array<Scalars['BigInt']>>;
  cliffAndFlowExecutedAt_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  endExecutedAt?: InputMaybe<Scalars['BigInt']>;
  endExecutedAt_not?: InputMaybe<Scalars['BigInt']>;
  endExecutedAt_gt?: InputMaybe<Scalars['BigInt']>;
  endExecutedAt_lt?: InputMaybe<Scalars['BigInt']>;
  endExecutedAt_gte?: InputMaybe<Scalars['BigInt']>;
  endExecutedAt_lte?: InputMaybe<Scalars['BigInt']>;
  endExecutedAt_in?: InputMaybe<Array<Scalars['BigInt']>>;
  endExecutedAt_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  tasks_?: InputMaybe<Task_filter>;
  events?: InputMaybe<Array<Scalars['String']>>;
  events_not?: InputMaybe<Array<Scalars['String']>>;
  events_contains?: InputMaybe<Array<Scalars['String']>>;
  events_contains_nocase?: InputMaybe<Array<Scalars['String']>>;
  events_not_contains?: InputMaybe<Array<Scalars['String']>>;
  events_not_contains_nocase?: InputMaybe<Array<Scalars['String']>>;
  events_?: InputMaybe<Event_filter>;
  claimValidityDate?: InputMaybe<Scalars['BigInt']>;
  claimValidityDate_not?: InputMaybe<Scalars['BigInt']>;
  claimValidityDate_gt?: InputMaybe<Scalars['BigInt']>;
  claimValidityDate_lt?: InputMaybe<Scalars['BigInt']>;
  claimValidityDate_gte?: InputMaybe<Scalars['BigInt']>;
  claimValidityDate_lte?: InputMaybe<Scalars['BigInt']>;
  claimValidityDate_in?: InputMaybe<Array<Scalars['BigInt']>>;
  claimValidityDate_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  claimedAt?: InputMaybe<Scalars['BigInt']>;
  claimedAt_not?: InputMaybe<Scalars['BigInt']>;
  claimedAt_gt?: InputMaybe<Scalars['BigInt']>;
  claimedAt_lt?: InputMaybe<Scalars['BigInt']>;
  claimedAt_gte?: InputMaybe<Scalars['BigInt']>;
  claimedAt_lte?: InputMaybe<Scalars['BigInt']>;
  claimedAt_in?: InputMaybe<Array<Scalars['BigInt']>>;
  claimedAt_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  remainderAmount?: InputMaybe<Scalars['BigInt']>;
  remainderAmount_not?: InputMaybe<Scalars['BigInt']>;
  remainderAmount_gt?: InputMaybe<Scalars['BigInt']>;
  remainderAmount_lt?: InputMaybe<Scalars['BigInt']>;
  remainderAmount_gte?: InputMaybe<Scalars['BigInt']>;
  remainderAmount_lte?: InputMaybe<Scalars['BigInt']>;
  remainderAmount_in?: InputMaybe<Array<Scalars['BigInt']>>;
  remainderAmount_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  totalAmount?: InputMaybe<Scalars['BigInt']>;
  totalAmount_not?: InputMaybe<Scalars['BigInt']>;
  totalAmount_gt?: InputMaybe<Scalars['BigInt']>;
  totalAmount_lt?: InputMaybe<Scalars['BigInt']>;
  totalAmount_gte?: InputMaybe<Scalars['BigInt']>;
  totalAmount_lte?: InputMaybe<Scalars['BigInt']>;
  totalAmount_in?: InputMaybe<Array<Scalars['BigInt']>>;
  totalAmount_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  settledAmount?: InputMaybe<Scalars['BigInt']>;
  settledAmount_not?: InputMaybe<Scalars['BigInt']>;
  settledAmount_gt?: InputMaybe<Scalars['BigInt']>;
  settledAmount_lt?: InputMaybe<Scalars['BigInt']>;
  settledAmount_gte?: InputMaybe<Scalars['BigInt']>;
  settledAmount_lte?: InputMaybe<Scalars['BigInt']>;
  settledAmount_in?: InputMaybe<Array<Scalars['BigInt']>>;
  settledAmount_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  settledAt?: InputMaybe<Scalars['BigInt']>;
  settledAt_not?: InputMaybe<Scalars['BigInt']>;
  settledAt_gt?: InputMaybe<Scalars['BigInt']>;
  settledAt_lt?: InputMaybe<Scalars['BigInt']>;
  settledAt_gte?: InputMaybe<Scalars['BigInt']>;
  settledAt_lte?: InputMaybe<Scalars['BigInt']>;
  settledAt_in?: InputMaybe<Array<Scalars['BigInt']>>;
  settledAt_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<VestingSchedule_filter>>>;
  or?: InputMaybe<Array<InputMaybe<VestingSchedule_filter>>>;
};

export type VestingSchedule_orderBy =
  | 'id'
  | 'contractVersion'
  | 'createdAt'
  | 'superToken'
  | 'sender'
  | 'receiver'
  | 'startDate'
  | 'endDate'
  | 'cliffDate'
  | 'cliffAndFlowDate'
  | 'cliffAmount'
  | 'flowRate'
  | 'didEarlyEndCompensationFail'
  | 'earlyEndCompensation'
  | 'cliffAndFlowExpirationAt'
  | 'endDateValidAt'
  | 'deletedAt'
  | 'failedAt'
  | 'cliffAndFlowExecutedAt'
  | 'endExecutedAt'
  | 'tasks'
  | 'events'
  | 'claimValidityDate'
  | 'claimedAt'
  | 'remainderAmount'
  | 'totalAmount'
  | 'settledAmount'
  | 'settledAt';

export type _Block_ = {
  /** The hash of the block */
  hash?: Maybe<Scalars['Bytes']>;
  /** The block number */
  number: Scalars['Int'];
  /** Integer representation of the timestamp stored in blocks for the chain */
  timestamp?: Maybe<Scalars['Int']>;
  /** The hash of the parent block */
  parentHash?: Maybe<Scalars['Bytes']>;
};

/** The type for the top-level _meta field */
export type _Meta_ = {
  /**
   * Information about a specific subgraph block. The hash of the block
   * will be null if the _meta field has a block constraint that asks for
   * a block number. It will be filled if the _meta field has no block constraint
   * and therefore asks for the latest  block
   *
   */
  block: _Block_;
  /** The deployment ID */
  deployment: Scalars['String'];
  /** If `true`, the subgraph encountered indexing errors at some past block */
  hasIndexingErrors: Scalars['Boolean'];
};

export type _SubgraphErrorPolicy_ =
  /** Data will be returned even if the subgraph has indexing errors */
  | 'allow'
  /** If the subgraph has indexing errors, data will be omitted. The default. */
  | 'deny';

  export type QuerySdk = {
      /** null **/
  vestingCliffAndFlowExecutedEvent: InContextSdkMethod<Query['vestingCliffAndFlowExecutedEvent'], QueryvestingCliffAndFlowExecutedEventArgs, MeshContext>,
  /** null **/
  vestingCliffAndFlowExecutedEvents: InContextSdkMethod<Query['vestingCliffAndFlowExecutedEvents'], QueryvestingCliffAndFlowExecutedEventsArgs, MeshContext>,
  /** null **/
  vestingEndExecutedEvent: InContextSdkMethod<Query['vestingEndExecutedEvent'], QueryvestingEndExecutedEventArgs, MeshContext>,
  /** null **/
  vestingEndExecutedEvents: InContextSdkMethod<Query['vestingEndExecutedEvents'], QueryvestingEndExecutedEventsArgs, MeshContext>,
  /** null **/
  vestingEndFailedEvent: InContextSdkMethod<Query['vestingEndFailedEvent'], QueryvestingEndFailedEventArgs, MeshContext>,
  /** null **/
  vestingEndFailedEvents: InContextSdkMethod<Query['vestingEndFailedEvents'], QueryvestingEndFailedEventsArgs, MeshContext>,
  /** null **/
  vestingScheduleCreatedEvent: InContextSdkMethod<Query['vestingScheduleCreatedEvent'], QueryvestingScheduleCreatedEventArgs, MeshContext>,
  /** null **/
  vestingScheduleCreatedEvents: InContextSdkMethod<Query['vestingScheduleCreatedEvents'], QueryvestingScheduleCreatedEventsArgs, MeshContext>,
  /** null **/
  vestingScheduleDeletedEvent: InContextSdkMethod<Query['vestingScheduleDeletedEvent'], QueryvestingScheduleDeletedEventArgs, MeshContext>,
  /** null **/
  vestingScheduleDeletedEvents: InContextSdkMethod<Query['vestingScheduleDeletedEvents'], QueryvestingScheduleDeletedEventsArgs, MeshContext>,
  /** null **/
  vestingScheduleUpdatedEvent: InContextSdkMethod<Query['vestingScheduleUpdatedEvent'], QueryvestingScheduleUpdatedEventArgs, MeshContext>,
  /** null **/
  vestingScheduleUpdatedEvents: InContextSdkMethod<Query['vestingScheduleUpdatedEvents'], QueryvestingScheduleUpdatedEventsArgs, MeshContext>,
  /** null **/
  vestingClaimedEvent: InContextSdkMethod<Query['vestingClaimedEvent'], QueryvestingClaimedEventArgs, MeshContext>,
  /** null **/
  vestingClaimedEvents: InContextSdkMethod<Query['vestingClaimedEvents'], QueryvestingClaimedEventsArgs, MeshContext>,
  /** null **/
  vestingScheduleEndDateUpdatedEvent: InContextSdkMethod<Query['vestingScheduleEndDateUpdatedEvent'], QueryvestingScheduleEndDateUpdatedEventArgs, MeshContext>,
  /** null **/
  vestingScheduleEndDateUpdatedEvents: InContextSdkMethod<Query['vestingScheduleEndDateUpdatedEvents'], QueryvestingScheduleEndDateUpdatedEventsArgs, MeshContext>,
  /** null **/
  vestingSchedule: InContextSdkMethod<Query['vestingSchedule'], QueryvestingScheduleArgs, MeshContext>,
  /** null **/
  vestingSchedules: InContextSdkMethod<Query['vestingSchedules'], QueryvestingSchedulesArgs, MeshContext>,
  /** null **/
  tokenSenderReceiverCursor: InContextSdkMethod<Query['tokenSenderReceiverCursor'], QuerytokenSenderReceiverCursorArgs, MeshContext>,
  /** null **/
  tokenSenderReceiverCursors: InContextSdkMethod<Query['tokenSenderReceiverCursors'], QuerytokenSenderReceiverCursorsArgs, MeshContext>,
  /** null **/
  task: InContextSdkMethod<Query['task'], QuerytaskArgs, MeshContext>,
  /** null **/
  tasks: InContextSdkMethod<Query['tasks'], QuerytasksArgs, MeshContext>,
  /** null **/
  event: InContextSdkMethod<Query['event'], QueryeventArgs, MeshContext>,
  /** null **/
  events: InContextSdkMethod<Query['events'], QueryeventsArgs, MeshContext>,
  /** Access to subgraph metadata **/
  _meta: InContextSdkMethod<Query['_meta'], Query_metaArgs, MeshContext>
  };

  export type MutationSdk = {
    
  };

  export type SubscriptionSdk = {
      /** null **/
  vestingCliffAndFlowExecutedEvent: InContextSdkMethod<Subscription['vestingCliffAndFlowExecutedEvent'], SubscriptionvestingCliffAndFlowExecutedEventArgs, MeshContext>,
  /** null **/
  vestingCliffAndFlowExecutedEvents: InContextSdkMethod<Subscription['vestingCliffAndFlowExecutedEvents'], SubscriptionvestingCliffAndFlowExecutedEventsArgs, MeshContext>,
  /** null **/
  vestingEndExecutedEvent: InContextSdkMethod<Subscription['vestingEndExecutedEvent'], SubscriptionvestingEndExecutedEventArgs, MeshContext>,
  /** null **/
  vestingEndExecutedEvents: InContextSdkMethod<Subscription['vestingEndExecutedEvents'], SubscriptionvestingEndExecutedEventsArgs, MeshContext>,
  /** null **/
  vestingEndFailedEvent: InContextSdkMethod<Subscription['vestingEndFailedEvent'], SubscriptionvestingEndFailedEventArgs, MeshContext>,
  /** null **/
  vestingEndFailedEvents: InContextSdkMethod<Subscription['vestingEndFailedEvents'], SubscriptionvestingEndFailedEventsArgs, MeshContext>,
  /** null **/
  vestingScheduleCreatedEvent: InContextSdkMethod<Subscription['vestingScheduleCreatedEvent'], SubscriptionvestingScheduleCreatedEventArgs, MeshContext>,
  /** null **/
  vestingScheduleCreatedEvents: InContextSdkMethod<Subscription['vestingScheduleCreatedEvents'], SubscriptionvestingScheduleCreatedEventsArgs, MeshContext>,
  /** null **/
  vestingScheduleDeletedEvent: InContextSdkMethod<Subscription['vestingScheduleDeletedEvent'], SubscriptionvestingScheduleDeletedEventArgs, MeshContext>,
  /** null **/
  vestingScheduleDeletedEvents: InContextSdkMethod<Subscription['vestingScheduleDeletedEvents'], SubscriptionvestingScheduleDeletedEventsArgs, MeshContext>,
  /** null **/
  vestingScheduleUpdatedEvent: InContextSdkMethod<Subscription['vestingScheduleUpdatedEvent'], SubscriptionvestingScheduleUpdatedEventArgs, MeshContext>,
  /** null **/
  vestingScheduleUpdatedEvents: InContextSdkMethod<Subscription['vestingScheduleUpdatedEvents'], SubscriptionvestingScheduleUpdatedEventsArgs, MeshContext>,
  /** null **/
  vestingClaimedEvent: InContextSdkMethod<Subscription['vestingClaimedEvent'], SubscriptionvestingClaimedEventArgs, MeshContext>,
  /** null **/
  vestingClaimedEvents: InContextSdkMethod<Subscription['vestingClaimedEvents'], SubscriptionvestingClaimedEventsArgs, MeshContext>,
  /** null **/
  vestingScheduleEndDateUpdatedEvent: InContextSdkMethod<Subscription['vestingScheduleEndDateUpdatedEvent'], SubscriptionvestingScheduleEndDateUpdatedEventArgs, MeshContext>,
  /** null **/
  vestingScheduleEndDateUpdatedEvents: InContextSdkMethod<Subscription['vestingScheduleEndDateUpdatedEvents'], SubscriptionvestingScheduleEndDateUpdatedEventsArgs, MeshContext>,
  /** null **/
  vestingSchedule: InContextSdkMethod<Subscription['vestingSchedule'], SubscriptionvestingScheduleArgs, MeshContext>,
  /** null **/
  vestingSchedules: InContextSdkMethod<Subscription['vestingSchedules'], SubscriptionvestingSchedulesArgs, MeshContext>,
  /** null **/
  tokenSenderReceiverCursor: InContextSdkMethod<Subscription['tokenSenderReceiverCursor'], SubscriptiontokenSenderReceiverCursorArgs, MeshContext>,
  /** null **/
  tokenSenderReceiverCursors: InContextSdkMethod<Subscription['tokenSenderReceiverCursors'], SubscriptiontokenSenderReceiverCursorsArgs, MeshContext>,
  /** null **/
  task: InContextSdkMethod<Subscription['task'], SubscriptiontaskArgs, MeshContext>,
  /** null **/
  tasks: InContextSdkMethod<Subscription['tasks'], SubscriptiontasksArgs, MeshContext>,
  /** null **/
  event: InContextSdkMethod<Subscription['event'], SubscriptioneventArgs, MeshContext>,
  /** null **/
  events: InContextSdkMethod<Subscription['events'], SubscriptioneventsArgs, MeshContext>,
  /** Access to subgraph metadata **/
  _meta: InContextSdkMethod<Subscription['_meta'], Subscription_metaArgs, MeshContext>
  };

  export type Context = {
      ["vesting"]: { Query: QuerySdk, Mutation: MutationSdk, Subscription: SubscriptionSdk },
      ["url"]: Scalars['ID']
    };
}
