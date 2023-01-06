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
  BigDecimal: string;
  BigInt: string;
  Bytes: string;
};

export type BlockChangedFilter = {
  number_gte: Scalars['Int'];
};

export type Block_Height = {
  hash?: InputMaybe<Scalars['Bytes']>;
  number?: InputMaybe<Scalars['Int']>;
  number_gte?: InputMaybe<Scalars['Int']>;
};

/**
 * Event: An interface which is shared by all
 * event entities and contains basic transaction
 * data.
 */
export type Event = {
  /** Holds the addresses for accounts that were impacted by the event. */
  addresses: Array<Scalars['Bytes']>;
  blockNumber: Scalars['BigInt'];
  gasPrice: Scalars['BigInt'];
  id: Scalars['ID'];
  logIndex: Scalars['BigInt'];
  name: Scalars['String'];
  order: Scalars['BigInt'];
  timestamp: Scalars['BigInt'];
  transactionHash: Scalars['Bytes'];
};

export type Event_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  addresses?: InputMaybe<Array<Scalars['Bytes']>>;
  addresses_contains?: InputMaybe<Array<Scalars['Bytes']>>;
  addresses_contains_nocase?: InputMaybe<Array<Scalars['Bytes']>>;
  addresses_not?: InputMaybe<Array<Scalars['Bytes']>>;
  addresses_not_contains?: InputMaybe<Array<Scalars['Bytes']>>;
  addresses_not_contains_nocase?: InputMaybe<Array<Scalars['Bytes']>>;
  blockNumber?: InputMaybe<Scalars['BigInt']>;
  blockNumber_gt?: InputMaybe<Scalars['BigInt']>;
  blockNumber_gte?: InputMaybe<Scalars['BigInt']>;
  blockNumber_in?: InputMaybe<Array<Scalars['BigInt']>>;
  blockNumber_lt?: InputMaybe<Scalars['BigInt']>;
  blockNumber_lte?: InputMaybe<Scalars['BigInt']>;
  blockNumber_not?: InputMaybe<Scalars['BigInt']>;
  blockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  gasPrice?: InputMaybe<Scalars['BigInt']>;
  gasPrice_gt?: InputMaybe<Scalars['BigInt']>;
  gasPrice_gte?: InputMaybe<Scalars['BigInt']>;
  gasPrice_in?: InputMaybe<Array<Scalars['BigInt']>>;
  gasPrice_lt?: InputMaybe<Scalars['BigInt']>;
  gasPrice_lte?: InputMaybe<Scalars['BigInt']>;
  gasPrice_not?: InputMaybe<Scalars['BigInt']>;
  gasPrice_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  logIndex?: InputMaybe<Scalars['BigInt']>;
  logIndex_gt?: InputMaybe<Scalars['BigInt']>;
  logIndex_gte?: InputMaybe<Scalars['BigInt']>;
  logIndex_in?: InputMaybe<Array<Scalars['BigInt']>>;
  logIndex_lt?: InputMaybe<Scalars['BigInt']>;
  logIndex_lte?: InputMaybe<Scalars['BigInt']>;
  logIndex_not?: InputMaybe<Scalars['BigInt']>;
  logIndex_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  name?: InputMaybe<Scalars['String']>;
  name_contains?: InputMaybe<Scalars['String']>;
  name_contains_nocase?: InputMaybe<Scalars['String']>;
  name_ends_with?: InputMaybe<Scalars['String']>;
  name_ends_with_nocase?: InputMaybe<Scalars['String']>;
  name_gt?: InputMaybe<Scalars['String']>;
  name_gte?: InputMaybe<Scalars['String']>;
  name_in?: InputMaybe<Array<Scalars['String']>>;
  name_lt?: InputMaybe<Scalars['String']>;
  name_lte?: InputMaybe<Scalars['String']>;
  name_not?: InputMaybe<Scalars['String']>;
  name_not_contains?: InputMaybe<Scalars['String']>;
  name_not_contains_nocase?: InputMaybe<Scalars['String']>;
  name_not_ends_with?: InputMaybe<Scalars['String']>;
  name_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  name_not_in?: InputMaybe<Array<Scalars['String']>>;
  name_not_starts_with?: InputMaybe<Scalars['String']>;
  name_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  name_starts_with?: InputMaybe<Scalars['String']>;
  name_starts_with_nocase?: InputMaybe<Scalars['String']>;
  order?: InputMaybe<Scalars['BigInt']>;
  order_gt?: InputMaybe<Scalars['BigInt']>;
  order_gte?: InputMaybe<Scalars['BigInt']>;
  order_in?: InputMaybe<Array<Scalars['BigInt']>>;
  order_lt?: InputMaybe<Scalars['BigInt']>;
  order_lte?: InputMaybe<Scalars['BigInt']>;
  order_not?: InputMaybe<Scalars['BigInt']>;
  order_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  timestamp?: InputMaybe<Scalars['BigInt']>;
  timestamp_gt?: InputMaybe<Scalars['BigInt']>;
  timestamp_gte?: InputMaybe<Scalars['BigInt']>;
  timestamp_in?: InputMaybe<Array<Scalars['BigInt']>>;
  timestamp_lt?: InputMaybe<Scalars['BigInt']>;
  timestamp_lte?: InputMaybe<Scalars['BigInt']>;
  timestamp_not?: InputMaybe<Scalars['BigInt']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  transactionHash?: InputMaybe<Scalars['Bytes']>;
  transactionHash_contains?: InputMaybe<Scalars['Bytes']>;
  transactionHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  transactionHash_not?: InputMaybe<Scalars['Bytes']>;
  transactionHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  transactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
};

export enum Event_OrderBy {
  Addresses = 'addresses',
  BlockNumber = 'blockNumber',
  GasPrice = 'gasPrice',
  Id = 'id',
  LogIndex = 'logIndex',
  Name = 'name',
  Order = 'order',
  Timestamp = 'timestamp',
  TransactionHash = 'transactionHash'
}

/** Defines the order direction, either ascending or descending */
export enum OrderDirection {
  Asc = 'asc',
  Desc = 'desc'
}

export type Query = {
  __typename?: 'Query';
  /** Access to subgraph metadata */
  _meta?: Maybe<_Meta_>;
  event?: Maybe<Event>;
  events: Array<Event>;
  tokenSenderReceiverCursor?: Maybe<TokenSenderReceiverCursor>;
  tokenSenderReceiverCursors: Array<TokenSenderReceiverCursor>;
  vestingCliffAndFlowExecutedEvent?: Maybe<VestingCliffAndFlowExecutedEvent>;
  vestingCliffAndFlowExecutedEvents: Array<VestingCliffAndFlowExecutedEvent>;
  vestingEndExecutedEvent?: Maybe<VestingEndExecutedEvent>;
  vestingEndExecutedEvents: Array<VestingEndExecutedEvent>;
  vestingEndFailedEvent?: Maybe<VestingEndFailedEvent>;
  vestingEndFailedEvents: Array<VestingEndFailedEvent>;
  vestingSchedule?: Maybe<VestingSchedule>;
  vestingScheduleCreatedEvent?: Maybe<VestingScheduleCreatedEvent>;
  vestingScheduleCreatedEvents: Array<VestingScheduleCreatedEvent>;
  vestingScheduleDeletedEvent?: Maybe<VestingScheduleDeletedEvent>;
  vestingScheduleDeletedEvents: Array<VestingScheduleDeletedEvent>;
  vestingScheduleUpdatedEvent?: Maybe<VestingScheduleUpdatedEvent>;
  vestingScheduleUpdatedEvents: Array<VestingScheduleUpdatedEvent>;
  vestingSchedules: Array<VestingSchedule>;
};


export type Query_MetaArgs = {
  block?: InputMaybe<Block_Height>;
};


export type QueryEventArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryEventsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Event_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Event_Filter>;
};


export type QueryTokenSenderReceiverCursorArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryTokenSenderReceiverCursorsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<TokenSenderReceiverCursor_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<TokenSenderReceiverCursor_Filter>;
};


export type QueryVestingCliffAndFlowExecutedEventArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryVestingCliffAndFlowExecutedEventsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<VestingCliffAndFlowExecutedEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<VestingCliffAndFlowExecutedEvent_Filter>;
};


export type QueryVestingEndExecutedEventArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryVestingEndExecutedEventsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<VestingEndExecutedEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<VestingEndExecutedEvent_Filter>;
};


export type QueryVestingEndFailedEventArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryVestingEndFailedEventsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<VestingEndFailedEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<VestingEndFailedEvent_Filter>;
};


export type QueryVestingScheduleArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryVestingScheduleCreatedEventArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryVestingScheduleCreatedEventsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<VestingScheduleCreatedEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<VestingScheduleCreatedEvent_Filter>;
};


export type QueryVestingScheduleDeletedEventArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryVestingScheduleDeletedEventsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<VestingScheduleDeletedEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<VestingScheduleDeletedEvent_Filter>;
};


export type QueryVestingScheduleUpdatedEventArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryVestingScheduleUpdatedEventsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<VestingScheduleUpdatedEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<VestingScheduleUpdatedEvent_Filter>;
};


export type QueryVestingSchedulesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<VestingSchedule_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<VestingSchedule_Filter>;
};

export type Subscription = {
  __typename?: 'Subscription';
  /** Access to subgraph metadata */
  _meta?: Maybe<_Meta_>;
  event?: Maybe<Event>;
  events: Array<Event>;
  tokenSenderReceiverCursor?: Maybe<TokenSenderReceiverCursor>;
  tokenSenderReceiverCursors: Array<TokenSenderReceiverCursor>;
  vestingCliffAndFlowExecutedEvent?: Maybe<VestingCliffAndFlowExecutedEvent>;
  vestingCliffAndFlowExecutedEvents: Array<VestingCliffAndFlowExecutedEvent>;
  vestingEndExecutedEvent?: Maybe<VestingEndExecutedEvent>;
  vestingEndExecutedEvents: Array<VestingEndExecutedEvent>;
  vestingEndFailedEvent?: Maybe<VestingEndFailedEvent>;
  vestingEndFailedEvents: Array<VestingEndFailedEvent>;
  vestingSchedule?: Maybe<VestingSchedule>;
  vestingScheduleCreatedEvent?: Maybe<VestingScheduleCreatedEvent>;
  vestingScheduleCreatedEvents: Array<VestingScheduleCreatedEvent>;
  vestingScheduleDeletedEvent?: Maybe<VestingScheduleDeletedEvent>;
  vestingScheduleDeletedEvents: Array<VestingScheduleDeletedEvent>;
  vestingScheduleUpdatedEvent?: Maybe<VestingScheduleUpdatedEvent>;
  vestingScheduleUpdatedEvents: Array<VestingScheduleUpdatedEvent>;
  vestingSchedules: Array<VestingSchedule>;
};


export type Subscription_MetaArgs = {
  block?: InputMaybe<Block_Height>;
};


export type SubscriptionEventArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionEventsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Event_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Event_Filter>;
};


export type SubscriptionTokenSenderReceiverCursorArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionTokenSenderReceiverCursorsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<TokenSenderReceiverCursor_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<TokenSenderReceiverCursor_Filter>;
};


export type SubscriptionVestingCliffAndFlowExecutedEventArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionVestingCliffAndFlowExecutedEventsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<VestingCliffAndFlowExecutedEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<VestingCliffAndFlowExecutedEvent_Filter>;
};


export type SubscriptionVestingEndExecutedEventArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionVestingEndExecutedEventsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<VestingEndExecutedEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<VestingEndExecutedEvent_Filter>;
};


export type SubscriptionVestingEndFailedEventArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionVestingEndFailedEventsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<VestingEndFailedEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<VestingEndFailedEvent_Filter>;
};


export type SubscriptionVestingScheduleArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionVestingScheduleCreatedEventArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionVestingScheduleCreatedEventsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<VestingScheduleCreatedEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<VestingScheduleCreatedEvent_Filter>;
};


export type SubscriptionVestingScheduleDeletedEventArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionVestingScheduleDeletedEventsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<VestingScheduleDeletedEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<VestingScheduleDeletedEvent_Filter>;
};


export type SubscriptionVestingScheduleUpdatedEventArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionVestingScheduleUpdatedEventsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<VestingScheduleUpdatedEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<VestingScheduleUpdatedEvent_Filter>;
};


export type SubscriptionVestingSchedulesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<VestingSchedule_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<VestingSchedule_Filter>;
};

export type TokenSenderReceiverCursor = {
  __typename?: 'TokenSenderReceiverCursor';
  currentVestingSchedule?: Maybe<VestingSchedule>;
  id: Scalars['String'];
};

export type TokenSenderReceiverCursor_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  currentVestingSchedule?: InputMaybe<Scalars['String']>;
  currentVestingSchedule_?: InputMaybe<VestingSchedule_Filter>;
  currentVestingSchedule_contains?: InputMaybe<Scalars['String']>;
  currentVestingSchedule_contains_nocase?: InputMaybe<Scalars['String']>;
  currentVestingSchedule_ends_with?: InputMaybe<Scalars['String']>;
  currentVestingSchedule_ends_with_nocase?: InputMaybe<Scalars['String']>;
  currentVestingSchedule_gt?: InputMaybe<Scalars['String']>;
  currentVestingSchedule_gte?: InputMaybe<Scalars['String']>;
  currentVestingSchedule_in?: InputMaybe<Array<Scalars['String']>>;
  currentVestingSchedule_lt?: InputMaybe<Scalars['String']>;
  currentVestingSchedule_lte?: InputMaybe<Scalars['String']>;
  currentVestingSchedule_not?: InputMaybe<Scalars['String']>;
  currentVestingSchedule_not_contains?: InputMaybe<Scalars['String']>;
  currentVestingSchedule_not_contains_nocase?: InputMaybe<Scalars['String']>;
  currentVestingSchedule_not_ends_with?: InputMaybe<Scalars['String']>;
  currentVestingSchedule_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  currentVestingSchedule_not_in?: InputMaybe<Array<Scalars['String']>>;
  currentVestingSchedule_not_starts_with?: InputMaybe<Scalars['String']>;
  currentVestingSchedule_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  currentVestingSchedule_starts_with?: InputMaybe<Scalars['String']>;
  currentVestingSchedule_starts_with_nocase?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['String']>;
  id_contains?: InputMaybe<Scalars['String']>;
  id_contains_nocase?: InputMaybe<Scalars['String']>;
  id_ends_with?: InputMaybe<Scalars['String']>;
  id_ends_with_nocase?: InputMaybe<Scalars['String']>;
  id_gt?: InputMaybe<Scalars['String']>;
  id_gte?: InputMaybe<Scalars['String']>;
  id_in?: InputMaybe<Array<Scalars['String']>>;
  id_lt?: InputMaybe<Scalars['String']>;
  id_lte?: InputMaybe<Scalars['String']>;
  id_not?: InputMaybe<Scalars['String']>;
  id_not_contains?: InputMaybe<Scalars['String']>;
  id_not_contains_nocase?: InputMaybe<Scalars['String']>;
  id_not_ends_with?: InputMaybe<Scalars['String']>;
  id_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  id_not_in?: InputMaybe<Array<Scalars['String']>>;
  id_not_starts_with?: InputMaybe<Scalars['String']>;
  id_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  id_starts_with?: InputMaybe<Scalars['String']>;
  id_starts_with_nocase?: InputMaybe<Scalars['String']>;
};

export enum TokenSenderReceiverCursor_OrderBy {
  CurrentVestingSchedule = 'currentVestingSchedule',
  Id = 'id'
}

export type VestingCliffAndFlowExecutedEvent = Event & {
  __typename?: 'VestingCliffAndFlowExecutedEvent';
  /** Holds the addresses for sender and receiver. */
  addresses: Array<Scalars['Bytes']>;
  blockNumber: Scalars['BigInt'];
  cliffAmount: Scalars['BigInt'];
  cliffAndFlowDate: Scalars['BigInt'];
  flowDelayCompensation: Scalars['BigInt'];
  flowRate: Scalars['BigInt'];
  gasPrice: Scalars['BigInt'];
  id: Scalars['ID'];
  logIndex: Scalars['BigInt'];
  name: Scalars['String'];
  order: Scalars['BigInt'];
  receiver: Scalars['Bytes'];
  sender: Scalars['Bytes'];
  superToken: Scalars['Bytes'];
  timestamp: Scalars['BigInt'];
  transactionHash: Scalars['Bytes'];
};

export type VestingCliffAndFlowExecutedEvent_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  addresses?: InputMaybe<Array<Scalars['Bytes']>>;
  addresses_contains?: InputMaybe<Array<Scalars['Bytes']>>;
  addresses_contains_nocase?: InputMaybe<Array<Scalars['Bytes']>>;
  addresses_not?: InputMaybe<Array<Scalars['Bytes']>>;
  addresses_not_contains?: InputMaybe<Array<Scalars['Bytes']>>;
  addresses_not_contains_nocase?: InputMaybe<Array<Scalars['Bytes']>>;
  blockNumber?: InputMaybe<Scalars['BigInt']>;
  blockNumber_gt?: InputMaybe<Scalars['BigInt']>;
  blockNumber_gte?: InputMaybe<Scalars['BigInt']>;
  blockNumber_in?: InputMaybe<Array<Scalars['BigInt']>>;
  blockNumber_lt?: InputMaybe<Scalars['BigInt']>;
  blockNumber_lte?: InputMaybe<Scalars['BigInt']>;
  blockNumber_not?: InputMaybe<Scalars['BigInt']>;
  blockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  cliffAmount?: InputMaybe<Scalars['BigInt']>;
  cliffAmount_gt?: InputMaybe<Scalars['BigInt']>;
  cliffAmount_gte?: InputMaybe<Scalars['BigInt']>;
  cliffAmount_in?: InputMaybe<Array<Scalars['BigInt']>>;
  cliffAmount_lt?: InputMaybe<Scalars['BigInt']>;
  cliffAmount_lte?: InputMaybe<Scalars['BigInt']>;
  cliffAmount_not?: InputMaybe<Scalars['BigInt']>;
  cliffAmount_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  cliffAndFlowDate?: InputMaybe<Scalars['BigInt']>;
  cliffAndFlowDate_gt?: InputMaybe<Scalars['BigInt']>;
  cliffAndFlowDate_gte?: InputMaybe<Scalars['BigInt']>;
  cliffAndFlowDate_in?: InputMaybe<Array<Scalars['BigInt']>>;
  cliffAndFlowDate_lt?: InputMaybe<Scalars['BigInt']>;
  cliffAndFlowDate_lte?: InputMaybe<Scalars['BigInt']>;
  cliffAndFlowDate_not?: InputMaybe<Scalars['BigInt']>;
  cliffAndFlowDate_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  flowDelayCompensation?: InputMaybe<Scalars['BigInt']>;
  flowDelayCompensation_gt?: InputMaybe<Scalars['BigInt']>;
  flowDelayCompensation_gte?: InputMaybe<Scalars['BigInt']>;
  flowDelayCompensation_in?: InputMaybe<Array<Scalars['BigInt']>>;
  flowDelayCompensation_lt?: InputMaybe<Scalars['BigInt']>;
  flowDelayCompensation_lte?: InputMaybe<Scalars['BigInt']>;
  flowDelayCompensation_not?: InputMaybe<Scalars['BigInt']>;
  flowDelayCompensation_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  flowRate?: InputMaybe<Scalars['BigInt']>;
  flowRate_gt?: InputMaybe<Scalars['BigInt']>;
  flowRate_gte?: InputMaybe<Scalars['BigInt']>;
  flowRate_in?: InputMaybe<Array<Scalars['BigInt']>>;
  flowRate_lt?: InputMaybe<Scalars['BigInt']>;
  flowRate_lte?: InputMaybe<Scalars['BigInt']>;
  flowRate_not?: InputMaybe<Scalars['BigInt']>;
  flowRate_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  gasPrice?: InputMaybe<Scalars['BigInt']>;
  gasPrice_gt?: InputMaybe<Scalars['BigInt']>;
  gasPrice_gte?: InputMaybe<Scalars['BigInt']>;
  gasPrice_in?: InputMaybe<Array<Scalars['BigInt']>>;
  gasPrice_lt?: InputMaybe<Scalars['BigInt']>;
  gasPrice_lte?: InputMaybe<Scalars['BigInt']>;
  gasPrice_not?: InputMaybe<Scalars['BigInt']>;
  gasPrice_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  logIndex?: InputMaybe<Scalars['BigInt']>;
  logIndex_gt?: InputMaybe<Scalars['BigInt']>;
  logIndex_gte?: InputMaybe<Scalars['BigInt']>;
  logIndex_in?: InputMaybe<Array<Scalars['BigInt']>>;
  logIndex_lt?: InputMaybe<Scalars['BigInt']>;
  logIndex_lte?: InputMaybe<Scalars['BigInt']>;
  logIndex_not?: InputMaybe<Scalars['BigInt']>;
  logIndex_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  name?: InputMaybe<Scalars['String']>;
  name_contains?: InputMaybe<Scalars['String']>;
  name_contains_nocase?: InputMaybe<Scalars['String']>;
  name_ends_with?: InputMaybe<Scalars['String']>;
  name_ends_with_nocase?: InputMaybe<Scalars['String']>;
  name_gt?: InputMaybe<Scalars['String']>;
  name_gte?: InputMaybe<Scalars['String']>;
  name_in?: InputMaybe<Array<Scalars['String']>>;
  name_lt?: InputMaybe<Scalars['String']>;
  name_lte?: InputMaybe<Scalars['String']>;
  name_not?: InputMaybe<Scalars['String']>;
  name_not_contains?: InputMaybe<Scalars['String']>;
  name_not_contains_nocase?: InputMaybe<Scalars['String']>;
  name_not_ends_with?: InputMaybe<Scalars['String']>;
  name_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  name_not_in?: InputMaybe<Array<Scalars['String']>>;
  name_not_starts_with?: InputMaybe<Scalars['String']>;
  name_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  name_starts_with?: InputMaybe<Scalars['String']>;
  name_starts_with_nocase?: InputMaybe<Scalars['String']>;
  order?: InputMaybe<Scalars['BigInt']>;
  order_gt?: InputMaybe<Scalars['BigInt']>;
  order_gte?: InputMaybe<Scalars['BigInt']>;
  order_in?: InputMaybe<Array<Scalars['BigInt']>>;
  order_lt?: InputMaybe<Scalars['BigInt']>;
  order_lte?: InputMaybe<Scalars['BigInt']>;
  order_not?: InputMaybe<Scalars['BigInt']>;
  order_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  receiver?: InputMaybe<Scalars['Bytes']>;
  receiver_contains?: InputMaybe<Scalars['Bytes']>;
  receiver_in?: InputMaybe<Array<Scalars['Bytes']>>;
  receiver_not?: InputMaybe<Scalars['Bytes']>;
  receiver_not_contains?: InputMaybe<Scalars['Bytes']>;
  receiver_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  sender?: InputMaybe<Scalars['Bytes']>;
  sender_contains?: InputMaybe<Scalars['Bytes']>;
  sender_in?: InputMaybe<Array<Scalars['Bytes']>>;
  sender_not?: InputMaybe<Scalars['Bytes']>;
  sender_not_contains?: InputMaybe<Scalars['Bytes']>;
  sender_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  superToken?: InputMaybe<Scalars['Bytes']>;
  superToken_contains?: InputMaybe<Scalars['Bytes']>;
  superToken_in?: InputMaybe<Array<Scalars['Bytes']>>;
  superToken_not?: InputMaybe<Scalars['Bytes']>;
  superToken_not_contains?: InputMaybe<Scalars['Bytes']>;
  superToken_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  timestamp?: InputMaybe<Scalars['BigInt']>;
  timestamp_gt?: InputMaybe<Scalars['BigInt']>;
  timestamp_gte?: InputMaybe<Scalars['BigInt']>;
  timestamp_in?: InputMaybe<Array<Scalars['BigInt']>>;
  timestamp_lt?: InputMaybe<Scalars['BigInt']>;
  timestamp_lte?: InputMaybe<Scalars['BigInt']>;
  timestamp_not?: InputMaybe<Scalars['BigInt']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  transactionHash?: InputMaybe<Scalars['Bytes']>;
  transactionHash_contains?: InputMaybe<Scalars['Bytes']>;
  transactionHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  transactionHash_not?: InputMaybe<Scalars['Bytes']>;
  transactionHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  transactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
};

export enum VestingCliffAndFlowExecutedEvent_OrderBy {
  Addresses = 'addresses',
  BlockNumber = 'blockNumber',
  CliffAmount = 'cliffAmount',
  CliffAndFlowDate = 'cliffAndFlowDate',
  FlowDelayCompensation = 'flowDelayCompensation',
  FlowRate = 'flowRate',
  GasPrice = 'gasPrice',
  Id = 'id',
  LogIndex = 'logIndex',
  Name = 'name',
  Order = 'order',
  Receiver = 'receiver',
  Sender = 'sender',
  SuperToken = 'superToken',
  Timestamp = 'timestamp',
  TransactionHash = 'transactionHash'
}

export type VestingEndExecutedEvent = Event & {
  __typename?: 'VestingEndExecutedEvent';
  /** Holds the addresses for sender and receiver. */
  addresses: Array<Scalars['Bytes']>;
  blockNumber: Scalars['BigInt'];
  didCompensationFail: Scalars['Boolean'];
  earlyEndCompensation: Scalars['BigInt'];
  endDate: Scalars['BigInt'];
  gasPrice: Scalars['BigInt'];
  id: Scalars['ID'];
  logIndex: Scalars['BigInt'];
  name: Scalars['String'];
  order: Scalars['BigInt'];
  receiver: Scalars['Bytes'];
  sender: Scalars['Bytes'];
  superToken: Scalars['Bytes'];
  timestamp: Scalars['BigInt'];
  transactionHash: Scalars['Bytes'];
};

export type VestingEndExecutedEvent_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  addresses?: InputMaybe<Array<Scalars['Bytes']>>;
  addresses_contains?: InputMaybe<Array<Scalars['Bytes']>>;
  addresses_contains_nocase?: InputMaybe<Array<Scalars['Bytes']>>;
  addresses_not?: InputMaybe<Array<Scalars['Bytes']>>;
  addresses_not_contains?: InputMaybe<Array<Scalars['Bytes']>>;
  addresses_not_contains_nocase?: InputMaybe<Array<Scalars['Bytes']>>;
  blockNumber?: InputMaybe<Scalars['BigInt']>;
  blockNumber_gt?: InputMaybe<Scalars['BigInt']>;
  blockNumber_gte?: InputMaybe<Scalars['BigInt']>;
  blockNumber_in?: InputMaybe<Array<Scalars['BigInt']>>;
  blockNumber_lt?: InputMaybe<Scalars['BigInt']>;
  blockNumber_lte?: InputMaybe<Scalars['BigInt']>;
  blockNumber_not?: InputMaybe<Scalars['BigInt']>;
  blockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  didCompensationFail?: InputMaybe<Scalars['Boolean']>;
  didCompensationFail_in?: InputMaybe<Array<Scalars['Boolean']>>;
  didCompensationFail_not?: InputMaybe<Scalars['Boolean']>;
  didCompensationFail_not_in?: InputMaybe<Array<Scalars['Boolean']>>;
  earlyEndCompensation?: InputMaybe<Scalars['BigInt']>;
  earlyEndCompensation_gt?: InputMaybe<Scalars['BigInt']>;
  earlyEndCompensation_gte?: InputMaybe<Scalars['BigInt']>;
  earlyEndCompensation_in?: InputMaybe<Array<Scalars['BigInt']>>;
  earlyEndCompensation_lt?: InputMaybe<Scalars['BigInt']>;
  earlyEndCompensation_lte?: InputMaybe<Scalars['BigInt']>;
  earlyEndCompensation_not?: InputMaybe<Scalars['BigInt']>;
  earlyEndCompensation_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  endDate?: InputMaybe<Scalars['BigInt']>;
  endDate_gt?: InputMaybe<Scalars['BigInt']>;
  endDate_gte?: InputMaybe<Scalars['BigInt']>;
  endDate_in?: InputMaybe<Array<Scalars['BigInt']>>;
  endDate_lt?: InputMaybe<Scalars['BigInt']>;
  endDate_lte?: InputMaybe<Scalars['BigInt']>;
  endDate_not?: InputMaybe<Scalars['BigInt']>;
  endDate_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  gasPrice?: InputMaybe<Scalars['BigInt']>;
  gasPrice_gt?: InputMaybe<Scalars['BigInt']>;
  gasPrice_gte?: InputMaybe<Scalars['BigInt']>;
  gasPrice_in?: InputMaybe<Array<Scalars['BigInt']>>;
  gasPrice_lt?: InputMaybe<Scalars['BigInt']>;
  gasPrice_lte?: InputMaybe<Scalars['BigInt']>;
  gasPrice_not?: InputMaybe<Scalars['BigInt']>;
  gasPrice_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  logIndex?: InputMaybe<Scalars['BigInt']>;
  logIndex_gt?: InputMaybe<Scalars['BigInt']>;
  logIndex_gte?: InputMaybe<Scalars['BigInt']>;
  logIndex_in?: InputMaybe<Array<Scalars['BigInt']>>;
  logIndex_lt?: InputMaybe<Scalars['BigInt']>;
  logIndex_lte?: InputMaybe<Scalars['BigInt']>;
  logIndex_not?: InputMaybe<Scalars['BigInt']>;
  logIndex_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  name?: InputMaybe<Scalars['String']>;
  name_contains?: InputMaybe<Scalars['String']>;
  name_contains_nocase?: InputMaybe<Scalars['String']>;
  name_ends_with?: InputMaybe<Scalars['String']>;
  name_ends_with_nocase?: InputMaybe<Scalars['String']>;
  name_gt?: InputMaybe<Scalars['String']>;
  name_gte?: InputMaybe<Scalars['String']>;
  name_in?: InputMaybe<Array<Scalars['String']>>;
  name_lt?: InputMaybe<Scalars['String']>;
  name_lte?: InputMaybe<Scalars['String']>;
  name_not?: InputMaybe<Scalars['String']>;
  name_not_contains?: InputMaybe<Scalars['String']>;
  name_not_contains_nocase?: InputMaybe<Scalars['String']>;
  name_not_ends_with?: InputMaybe<Scalars['String']>;
  name_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  name_not_in?: InputMaybe<Array<Scalars['String']>>;
  name_not_starts_with?: InputMaybe<Scalars['String']>;
  name_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  name_starts_with?: InputMaybe<Scalars['String']>;
  name_starts_with_nocase?: InputMaybe<Scalars['String']>;
  order?: InputMaybe<Scalars['BigInt']>;
  order_gt?: InputMaybe<Scalars['BigInt']>;
  order_gte?: InputMaybe<Scalars['BigInt']>;
  order_in?: InputMaybe<Array<Scalars['BigInt']>>;
  order_lt?: InputMaybe<Scalars['BigInt']>;
  order_lte?: InputMaybe<Scalars['BigInt']>;
  order_not?: InputMaybe<Scalars['BigInt']>;
  order_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  receiver?: InputMaybe<Scalars['Bytes']>;
  receiver_contains?: InputMaybe<Scalars['Bytes']>;
  receiver_in?: InputMaybe<Array<Scalars['Bytes']>>;
  receiver_not?: InputMaybe<Scalars['Bytes']>;
  receiver_not_contains?: InputMaybe<Scalars['Bytes']>;
  receiver_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  sender?: InputMaybe<Scalars['Bytes']>;
  sender_contains?: InputMaybe<Scalars['Bytes']>;
  sender_in?: InputMaybe<Array<Scalars['Bytes']>>;
  sender_not?: InputMaybe<Scalars['Bytes']>;
  sender_not_contains?: InputMaybe<Scalars['Bytes']>;
  sender_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  superToken?: InputMaybe<Scalars['Bytes']>;
  superToken_contains?: InputMaybe<Scalars['Bytes']>;
  superToken_in?: InputMaybe<Array<Scalars['Bytes']>>;
  superToken_not?: InputMaybe<Scalars['Bytes']>;
  superToken_not_contains?: InputMaybe<Scalars['Bytes']>;
  superToken_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  timestamp?: InputMaybe<Scalars['BigInt']>;
  timestamp_gt?: InputMaybe<Scalars['BigInt']>;
  timestamp_gte?: InputMaybe<Scalars['BigInt']>;
  timestamp_in?: InputMaybe<Array<Scalars['BigInt']>>;
  timestamp_lt?: InputMaybe<Scalars['BigInt']>;
  timestamp_lte?: InputMaybe<Scalars['BigInt']>;
  timestamp_not?: InputMaybe<Scalars['BigInt']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  transactionHash?: InputMaybe<Scalars['Bytes']>;
  transactionHash_contains?: InputMaybe<Scalars['Bytes']>;
  transactionHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  transactionHash_not?: InputMaybe<Scalars['Bytes']>;
  transactionHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  transactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
};

export enum VestingEndExecutedEvent_OrderBy {
  Addresses = 'addresses',
  BlockNumber = 'blockNumber',
  DidCompensationFail = 'didCompensationFail',
  EarlyEndCompensation = 'earlyEndCompensation',
  EndDate = 'endDate',
  GasPrice = 'gasPrice',
  Id = 'id',
  LogIndex = 'logIndex',
  Name = 'name',
  Order = 'order',
  Receiver = 'receiver',
  Sender = 'sender',
  SuperToken = 'superToken',
  Timestamp = 'timestamp',
  TransactionHash = 'transactionHash'
}

export type VestingEndFailedEvent = Event & {
  __typename?: 'VestingEndFailedEvent';
  /** Holds the addresses for sender and receiver. */
  addresses: Array<Scalars['Bytes']>;
  blockNumber: Scalars['BigInt'];
  endDate: Scalars['BigInt'];
  gasPrice: Scalars['BigInt'];
  id: Scalars['ID'];
  logIndex: Scalars['BigInt'];
  name: Scalars['String'];
  order: Scalars['BigInt'];
  receiver: Scalars['Bytes'];
  sender: Scalars['Bytes'];
  superToken: Scalars['Bytes'];
  timestamp: Scalars['BigInt'];
  transactionHash: Scalars['Bytes'];
};

export type VestingEndFailedEvent_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  addresses?: InputMaybe<Array<Scalars['Bytes']>>;
  addresses_contains?: InputMaybe<Array<Scalars['Bytes']>>;
  addresses_contains_nocase?: InputMaybe<Array<Scalars['Bytes']>>;
  addresses_not?: InputMaybe<Array<Scalars['Bytes']>>;
  addresses_not_contains?: InputMaybe<Array<Scalars['Bytes']>>;
  addresses_not_contains_nocase?: InputMaybe<Array<Scalars['Bytes']>>;
  blockNumber?: InputMaybe<Scalars['BigInt']>;
  blockNumber_gt?: InputMaybe<Scalars['BigInt']>;
  blockNumber_gte?: InputMaybe<Scalars['BigInt']>;
  blockNumber_in?: InputMaybe<Array<Scalars['BigInt']>>;
  blockNumber_lt?: InputMaybe<Scalars['BigInt']>;
  blockNumber_lte?: InputMaybe<Scalars['BigInt']>;
  blockNumber_not?: InputMaybe<Scalars['BigInt']>;
  blockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  endDate?: InputMaybe<Scalars['BigInt']>;
  endDate_gt?: InputMaybe<Scalars['BigInt']>;
  endDate_gte?: InputMaybe<Scalars['BigInt']>;
  endDate_in?: InputMaybe<Array<Scalars['BigInt']>>;
  endDate_lt?: InputMaybe<Scalars['BigInt']>;
  endDate_lte?: InputMaybe<Scalars['BigInt']>;
  endDate_not?: InputMaybe<Scalars['BigInt']>;
  endDate_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  gasPrice?: InputMaybe<Scalars['BigInt']>;
  gasPrice_gt?: InputMaybe<Scalars['BigInt']>;
  gasPrice_gte?: InputMaybe<Scalars['BigInt']>;
  gasPrice_in?: InputMaybe<Array<Scalars['BigInt']>>;
  gasPrice_lt?: InputMaybe<Scalars['BigInt']>;
  gasPrice_lte?: InputMaybe<Scalars['BigInt']>;
  gasPrice_not?: InputMaybe<Scalars['BigInt']>;
  gasPrice_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  logIndex?: InputMaybe<Scalars['BigInt']>;
  logIndex_gt?: InputMaybe<Scalars['BigInt']>;
  logIndex_gte?: InputMaybe<Scalars['BigInt']>;
  logIndex_in?: InputMaybe<Array<Scalars['BigInt']>>;
  logIndex_lt?: InputMaybe<Scalars['BigInt']>;
  logIndex_lte?: InputMaybe<Scalars['BigInt']>;
  logIndex_not?: InputMaybe<Scalars['BigInt']>;
  logIndex_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  name?: InputMaybe<Scalars['String']>;
  name_contains?: InputMaybe<Scalars['String']>;
  name_contains_nocase?: InputMaybe<Scalars['String']>;
  name_ends_with?: InputMaybe<Scalars['String']>;
  name_ends_with_nocase?: InputMaybe<Scalars['String']>;
  name_gt?: InputMaybe<Scalars['String']>;
  name_gte?: InputMaybe<Scalars['String']>;
  name_in?: InputMaybe<Array<Scalars['String']>>;
  name_lt?: InputMaybe<Scalars['String']>;
  name_lte?: InputMaybe<Scalars['String']>;
  name_not?: InputMaybe<Scalars['String']>;
  name_not_contains?: InputMaybe<Scalars['String']>;
  name_not_contains_nocase?: InputMaybe<Scalars['String']>;
  name_not_ends_with?: InputMaybe<Scalars['String']>;
  name_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  name_not_in?: InputMaybe<Array<Scalars['String']>>;
  name_not_starts_with?: InputMaybe<Scalars['String']>;
  name_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  name_starts_with?: InputMaybe<Scalars['String']>;
  name_starts_with_nocase?: InputMaybe<Scalars['String']>;
  order?: InputMaybe<Scalars['BigInt']>;
  order_gt?: InputMaybe<Scalars['BigInt']>;
  order_gte?: InputMaybe<Scalars['BigInt']>;
  order_in?: InputMaybe<Array<Scalars['BigInt']>>;
  order_lt?: InputMaybe<Scalars['BigInt']>;
  order_lte?: InputMaybe<Scalars['BigInt']>;
  order_not?: InputMaybe<Scalars['BigInt']>;
  order_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  receiver?: InputMaybe<Scalars['Bytes']>;
  receiver_contains?: InputMaybe<Scalars['Bytes']>;
  receiver_in?: InputMaybe<Array<Scalars['Bytes']>>;
  receiver_not?: InputMaybe<Scalars['Bytes']>;
  receiver_not_contains?: InputMaybe<Scalars['Bytes']>;
  receiver_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  sender?: InputMaybe<Scalars['Bytes']>;
  sender_contains?: InputMaybe<Scalars['Bytes']>;
  sender_in?: InputMaybe<Array<Scalars['Bytes']>>;
  sender_not?: InputMaybe<Scalars['Bytes']>;
  sender_not_contains?: InputMaybe<Scalars['Bytes']>;
  sender_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  superToken?: InputMaybe<Scalars['Bytes']>;
  superToken_contains?: InputMaybe<Scalars['Bytes']>;
  superToken_in?: InputMaybe<Array<Scalars['Bytes']>>;
  superToken_not?: InputMaybe<Scalars['Bytes']>;
  superToken_not_contains?: InputMaybe<Scalars['Bytes']>;
  superToken_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  timestamp?: InputMaybe<Scalars['BigInt']>;
  timestamp_gt?: InputMaybe<Scalars['BigInt']>;
  timestamp_gte?: InputMaybe<Scalars['BigInt']>;
  timestamp_in?: InputMaybe<Array<Scalars['BigInt']>>;
  timestamp_lt?: InputMaybe<Scalars['BigInt']>;
  timestamp_lte?: InputMaybe<Scalars['BigInt']>;
  timestamp_not?: InputMaybe<Scalars['BigInt']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  transactionHash?: InputMaybe<Scalars['Bytes']>;
  transactionHash_contains?: InputMaybe<Scalars['Bytes']>;
  transactionHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  transactionHash_not?: InputMaybe<Scalars['Bytes']>;
  transactionHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  transactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
};

export enum VestingEndFailedEvent_OrderBy {
  Addresses = 'addresses',
  BlockNumber = 'blockNumber',
  EndDate = 'endDate',
  GasPrice = 'gasPrice',
  Id = 'id',
  LogIndex = 'logIndex',
  Name = 'name',
  Order = 'order',
  Receiver = 'receiver',
  Sender = 'sender',
  SuperToken = 'superToken',
  Timestamp = 'timestamp',
  TransactionHash = 'transactionHash'
}

export type VestingSchedule = {
  __typename?: 'VestingSchedule';
  cliffAmount: Scalars['BigInt'];
  cliffAndFlowExecutedAt?: Maybe<Scalars['BigInt']>;
  cliffDate: Scalars['BigInt'];
  deletedAt?: Maybe<Scalars['BigInt']>;
  endDate: Scalars['BigInt'];
  endExecutedAt?: Maybe<Scalars['BigInt']>;
  flowRate: Scalars['BigInt'];
  id: Scalars['String'];
  nextExecutionAt?: Maybe<Scalars['BigInt']>;
  receiver: Scalars['Bytes'];
  sender: Scalars['Bytes'];
  startDate: Scalars['BigInt'];
  superToken: Scalars['Bytes'];
};

export type VestingScheduleCreatedEvent = Event & {
  __typename?: 'VestingScheduleCreatedEvent';
  /** Holds the addresses for sender and receiver. */
  addresses: Array<Scalars['Bytes']>;
  blockNumber: Scalars['BigInt'];
  cliffAmount: Scalars['BigInt'];
  cliffDate: Scalars['BigInt'];
  endDate: Scalars['BigInt'];
  flowRate: Scalars['BigInt'];
  gasPrice: Scalars['BigInt'];
  id: Scalars['ID'];
  logIndex: Scalars['BigInt'];
  name: Scalars['String'];
  order: Scalars['BigInt'];
  receiver: Scalars['Bytes'];
  sender: Scalars['Bytes'];
  startDate: Scalars['BigInt'];
  superToken: Scalars['Bytes'];
  timestamp: Scalars['BigInt'];
  transactionHash: Scalars['Bytes'];
};

export type VestingScheduleCreatedEvent_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  addresses?: InputMaybe<Array<Scalars['Bytes']>>;
  addresses_contains?: InputMaybe<Array<Scalars['Bytes']>>;
  addresses_contains_nocase?: InputMaybe<Array<Scalars['Bytes']>>;
  addresses_not?: InputMaybe<Array<Scalars['Bytes']>>;
  addresses_not_contains?: InputMaybe<Array<Scalars['Bytes']>>;
  addresses_not_contains_nocase?: InputMaybe<Array<Scalars['Bytes']>>;
  blockNumber?: InputMaybe<Scalars['BigInt']>;
  blockNumber_gt?: InputMaybe<Scalars['BigInt']>;
  blockNumber_gte?: InputMaybe<Scalars['BigInt']>;
  blockNumber_in?: InputMaybe<Array<Scalars['BigInt']>>;
  blockNumber_lt?: InputMaybe<Scalars['BigInt']>;
  blockNumber_lte?: InputMaybe<Scalars['BigInt']>;
  blockNumber_not?: InputMaybe<Scalars['BigInt']>;
  blockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  cliffAmount?: InputMaybe<Scalars['BigInt']>;
  cliffAmount_gt?: InputMaybe<Scalars['BigInt']>;
  cliffAmount_gte?: InputMaybe<Scalars['BigInt']>;
  cliffAmount_in?: InputMaybe<Array<Scalars['BigInt']>>;
  cliffAmount_lt?: InputMaybe<Scalars['BigInt']>;
  cliffAmount_lte?: InputMaybe<Scalars['BigInt']>;
  cliffAmount_not?: InputMaybe<Scalars['BigInt']>;
  cliffAmount_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  cliffDate?: InputMaybe<Scalars['BigInt']>;
  cliffDate_gt?: InputMaybe<Scalars['BigInt']>;
  cliffDate_gte?: InputMaybe<Scalars['BigInt']>;
  cliffDate_in?: InputMaybe<Array<Scalars['BigInt']>>;
  cliffDate_lt?: InputMaybe<Scalars['BigInt']>;
  cliffDate_lte?: InputMaybe<Scalars['BigInt']>;
  cliffDate_not?: InputMaybe<Scalars['BigInt']>;
  cliffDate_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  endDate?: InputMaybe<Scalars['BigInt']>;
  endDate_gt?: InputMaybe<Scalars['BigInt']>;
  endDate_gte?: InputMaybe<Scalars['BigInt']>;
  endDate_in?: InputMaybe<Array<Scalars['BigInt']>>;
  endDate_lt?: InputMaybe<Scalars['BigInt']>;
  endDate_lte?: InputMaybe<Scalars['BigInt']>;
  endDate_not?: InputMaybe<Scalars['BigInt']>;
  endDate_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  flowRate?: InputMaybe<Scalars['BigInt']>;
  flowRate_gt?: InputMaybe<Scalars['BigInt']>;
  flowRate_gte?: InputMaybe<Scalars['BigInt']>;
  flowRate_in?: InputMaybe<Array<Scalars['BigInt']>>;
  flowRate_lt?: InputMaybe<Scalars['BigInt']>;
  flowRate_lte?: InputMaybe<Scalars['BigInt']>;
  flowRate_not?: InputMaybe<Scalars['BigInt']>;
  flowRate_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  gasPrice?: InputMaybe<Scalars['BigInt']>;
  gasPrice_gt?: InputMaybe<Scalars['BigInt']>;
  gasPrice_gte?: InputMaybe<Scalars['BigInt']>;
  gasPrice_in?: InputMaybe<Array<Scalars['BigInt']>>;
  gasPrice_lt?: InputMaybe<Scalars['BigInt']>;
  gasPrice_lte?: InputMaybe<Scalars['BigInt']>;
  gasPrice_not?: InputMaybe<Scalars['BigInt']>;
  gasPrice_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  logIndex?: InputMaybe<Scalars['BigInt']>;
  logIndex_gt?: InputMaybe<Scalars['BigInt']>;
  logIndex_gte?: InputMaybe<Scalars['BigInt']>;
  logIndex_in?: InputMaybe<Array<Scalars['BigInt']>>;
  logIndex_lt?: InputMaybe<Scalars['BigInt']>;
  logIndex_lte?: InputMaybe<Scalars['BigInt']>;
  logIndex_not?: InputMaybe<Scalars['BigInt']>;
  logIndex_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  name?: InputMaybe<Scalars['String']>;
  name_contains?: InputMaybe<Scalars['String']>;
  name_contains_nocase?: InputMaybe<Scalars['String']>;
  name_ends_with?: InputMaybe<Scalars['String']>;
  name_ends_with_nocase?: InputMaybe<Scalars['String']>;
  name_gt?: InputMaybe<Scalars['String']>;
  name_gte?: InputMaybe<Scalars['String']>;
  name_in?: InputMaybe<Array<Scalars['String']>>;
  name_lt?: InputMaybe<Scalars['String']>;
  name_lte?: InputMaybe<Scalars['String']>;
  name_not?: InputMaybe<Scalars['String']>;
  name_not_contains?: InputMaybe<Scalars['String']>;
  name_not_contains_nocase?: InputMaybe<Scalars['String']>;
  name_not_ends_with?: InputMaybe<Scalars['String']>;
  name_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  name_not_in?: InputMaybe<Array<Scalars['String']>>;
  name_not_starts_with?: InputMaybe<Scalars['String']>;
  name_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  name_starts_with?: InputMaybe<Scalars['String']>;
  name_starts_with_nocase?: InputMaybe<Scalars['String']>;
  order?: InputMaybe<Scalars['BigInt']>;
  order_gt?: InputMaybe<Scalars['BigInt']>;
  order_gte?: InputMaybe<Scalars['BigInt']>;
  order_in?: InputMaybe<Array<Scalars['BigInt']>>;
  order_lt?: InputMaybe<Scalars['BigInt']>;
  order_lte?: InputMaybe<Scalars['BigInt']>;
  order_not?: InputMaybe<Scalars['BigInt']>;
  order_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  receiver?: InputMaybe<Scalars['Bytes']>;
  receiver_contains?: InputMaybe<Scalars['Bytes']>;
  receiver_in?: InputMaybe<Array<Scalars['Bytes']>>;
  receiver_not?: InputMaybe<Scalars['Bytes']>;
  receiver_not_contains?: InputMaybe<Scalars['Bytes']>;
  receiver_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  sender?: InputMaybe<Scalars['Bytes']>;
  sender_contains?: InputMaybe<Scalars['Bytes']>;
  sender_in?: InputMaybe<Array<Scalars['Bytes']>>;
  sender_not?: InputMaybe<Scalars['Bytes']>;
  sender_not_contains?: InputMaybe<Scalars['Bytes']>;
  sender_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  startDate?: InputMaybe<Scalars['BigInt']>;
  startDate_gt?: InputMaybe<Scalars['BigInt']>;
  startDate_gte?: InputMaybe<Scalars['BigInt']>;
  startDate_in?: InputMaybe<Array<Scalars['BigInt']>>;
  startDate_lt?: InputMaybe<Scalars['BigInt']>;
  startDate_lte?: InputMaybe<Scalars['BigInt']>;
  startDate_not?: InputMaybe<Scalars['BigInt']>;
  startDate_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  superToken?: InputMaybe<Scalars['Bytes']>;
  superToken_contains?: InputMaybe<Scalars['Bytes']>;
  superToken_in?: InputMaybe<Array<Scalars['Bytes']>>;
  superToken_not?: InputMaybe<Scalars['Bytes']>;
  superToken_not_contains?: InputMaybe<Scalars['Bytes']>;
  superToken_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  timestamp?: InputMaybe<Scalars['BigInt']>;
  timestamp_gt?: InputMaybe<Scalars['BigInt']>;
  timestamp_gte?: InputMaybe<Scalars['BigInt']>;
  timestamp_in?: InputMaybe<Array<Scalars['BigInt']>>;
  timestamp_lt?: InputMaybe<Scalars['BigInt']>;
  timestamp_lte?: InputMaybe<Scalars['BigInt']>;
  timestamp_not?: InputMaybe<Scalars['BigInt']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  transactionHash?: InputMaybe<Scalars['Bytes']>;
  transactionHash_contains?: InputMaybe<Scalars['Bytes']>;
  transactionHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  transactionHash_not?: InputMaybe<Scalars['Bytes']>;
  transactionHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  transactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
};

export enum VestingScheduleCreatedEvent_OrderBy {
  Addresses = 'addresses',
  BlockNumber = 'blockNumber',
  CliffAmount = 'cliffAmount',
  CliffDate = 'cliffDate',
  EndDate = 'endDate',
  FlowRate = 'flowRate',
  GasPrice = 'gasPrice',
  Id = 'id',
  LogIndex = 'logIndex',
  Name = 'name',
  Order = 'order',
  Receiver = 'receiver',
  Sender = 'sender',
  StartDate = 'startDate',
  SuperToken = 'superToken',
  Timestamp = 'timestamp',
  TransactionHash = 'transactionHash'
}

export type VestingScheduleDeletedEvent = Event & {
  __typename?: 'VestingScheduleDeletedEvent';
  /** Holds the addresses for sender and receiver. */
  addresses: Array<Scalars['Bytes']>;
  blockNumber: Scalars['BigInt'];
  gasPrice: Scalars['BigInt'];
  id: Scalars['ID'];
  logIndex: Scalars['BigInt'];
  name: Scalars['String'];
  order: Scalars['BigInt'];
  receiver: Scalars['Bytes'];
  sender: Scalars['Bytes'];
  superToken: Scalars['Bytes'];
  timestamp: Scalars['BigInt'];
  transactionHash: Scalars['Bytes'];
};

export type VestingScheduleDeletedEvent_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  addresses?: InputMaybe<Array<Scalars['Bytes']>>;
  addresses_contains?: InputMaybe<Array<Scalars['Bytes']>>;
  addresses_contains_nocase?: InputMaybe<Array<Scalars['Bytes']>>;
  addresses_not?: InputMaybe<Array<Scalars['Bytes']>>;
  addresses_not_contains?: InputMaybe<Array<Scalars['Bytes']>>;
  addresses_not_contains_nocase?: InputMaybe<Array<Scalars['Bytes']>>;
  blockNumber?: InputMaybe<Scalars['BigInt']>;
  blockNumber_gt?: InputMaybe<Scalars['BigInt']>;
  blockNumber_gte?: InputMaybe<Scalars['BigInt']>;
  blockNumber_in?: InputMaybe<Array<Scalars['BigInt']>>;
  blockNumber_lt?: InputMaybe<Scalars['BigInt']>;
  blockNumber_lte?: InputMaybe<Scalars['BigInt']>;
  blockNumber_not?: InputMaybe<Scalars['BigInt']>;
  blockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  gasPrice?: InputMaybe<Scalars['BigInt']>;
  gasPrice_gt?: InputMaybe<Scalars['BigInt']>;
  gasPrice_gte?: InputMaybe<Scalars['BigInt']>;
  gasPrice_in?: InputMaybe<Array<Scalars['BigInt']>>;
  gasPrice_lt?: InputMaybe<Scalars['BigInt']>;
  gasPrice_lte?: InputMaybe<Scalars['BigInt']>;
  gasPrice_not?: InputMaybe<Scalars['BigInt']>;
  gasPrice_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  logIndex?: InputMaybe<Scalars['BigInt']>;
  logIndex_gt?: InputMaybe<Scalars['BigInt']>;
  logIndex_gte?: InputMaybe<Scalars['BigInt']>;
  logIndex_in?: InputMaybe<Array<Scalars['BigInt']>>;
  logIndex_lt?: InputMaybe<Scalars['BigInt']>;
  logIndex_lte?: InputMaybe<Scalars['BigInt']>;
  logIndex_not?: InputMaybe<Scalars['BigInt']>;
  logIndex_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  name?: InputMaybe<Scalars['String']>;
  name_contains?: InputMaybe<Scalars['String']>;
  name_contains_nocase?: InputMaybe<Scalars['String']>;
  name_ends_with?: InputMaybe<Scalars['String']>;
  name_ends_with_nocase?: InputMaybe<Scalars['String']>;
  name_gt?: InputMaybe<Scalars['String']>;
  name_gte?: InputMaybe<Scalars['String']>;
  name_in?: InputMaybe<Array<Scalars['String']>>;
  name_lt?: InputMaybe<Scalars['String']>;
  name_lte?: InputMaybe<Scalars['String']>;
  name_not?: InputMaybe<Scalars['String']>;
  name_not_contains?: InputMaybe<Scalars['String']>;
  name_not_contains_nocase?: InputMaybe<Scalars['String']>;
  name_not_ends_with?: InputMaybe<Scalars['String']>;
  name_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  name_not_in?: InputMaybe<Array<Scalars['String']>>;
  name_not_starts_with?: InputMaybe<Scalars['String']>;
  name_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  name_starts_with?: InputMaybe<Scalars['String']>;
  name_starts_with_nocase?: InputMaybe<Scalars['String']>;
  order?: InputMaybe<Scalars['BigInt']>;
  order_gt?: InputMaybe<Scalars['BigInt']>;
  order_gte?: InputMaybe<Scalars['BigInt']>;
  order_in?: InputMaybe<Array<Scalars['BigInt']>>;
  order_lt?: InputMaybe<Scalars['BigInt']>;
  order_lte?: InputMaybe<Scalars['BigInt']>;
  order_not?: InputMaybe<Scalars['BigInt']>;
  order_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  receiver?: InputMaybe<Scalars['Bytes']>;
  receiver_contains?: InputMaybe<Scalars['Bytes']>;
  receiver_in?: InputMaybe<Array<Scalars['Bytes']>>;
  receiver_not?: InputMaybe<Scalars['Bytes']>;
  receiver_not_contains?: InputMaybe<Scalars['Bytes']>;
  receiver_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  sender?: InputMaybe<Scalars['Bytes']>;
  sender_contains?: InputMaybe<Scalars['Bytes']>;
  sender_in?: InputMaybe<Array<Scalars['Bytes']>>;
  sender_not?: InputMaybe<Scalars['Bytes']>;
  sender_not_contains?: InputMaybe<Scalars['Bytes']>;
  sender_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  superToken?: InputMaybe<Scalars['Bytes']>;
  superToken_contains?: InputMaybe<Scalars['Bytes']>;
  superToken_in?: InputMaybe<Array<Scalars['Bytes']>>;
  superToken_not?: InputMaybe<Scalars['Bytes']>;
  superToken_not_contains?: InputMaybe<Scalars['Bytes']>;
  superToken_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  timestamp?: InputMaybe<Scalars['BigInt']>;
  timestamp_gt?: InputMaybe<Scalars['BigInt']>;
  timestamp_gte?: InputMaybe<Scalars['BigInt']>;
  timestamp_in?: InputMaybe<Array<Scalars['BigInt']>>;
  timestamp_lt?: InputMaybe<Scalars['BigInt']>;
  timestamp_lte?: InputMaybe<Scalars['BigInt']>;
  timestamp_not?: InputMaybe<Scalars['BigInt']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  transactionHash?: InputMaybe<Scalars['Bytes']>;
  transactionHash_contains?: InputMaybe<Scalars['Bytes']>;
  transactionHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  transactionHash_not?: InputMaybe<Scalars['Bytes']>;
  transactionHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  transactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
};

export enum VestingScheduleDeletedEvent_OrderBy {
  Addresses = 'addresses',
  BlockNumber = 'blockNumber',
  GasPrice = 'gasPrice',
  Id = 'id',
  LogIndex = 'logIndex',
  Name = 'name',
  Order = 'order',
  Receiver = 'receiver',
  Sender = 'sender',
  SuperToken = 'superToken',
  Timestamp = 'timestamp',
  TransactionHash = 'transactionHash'
}

export type VestingScheduleUpdatedEvent = Event & {
  __typename?: 'VestingScheduleUpdatedEvent';
  /** Holds the addresses for sender and receiver. */
  addresses: Array<Scalars['Bytes']>;
  blockNumber: Scalars['BigInt'];
  endDate: Scalars['BigInt'];
  gasPrice: Scalars['BigInt'];
  id: Scalars['ID'];
  logIndex: Scalars['BigInt'];
  name: Scalars['String'];
  oldEndDate: Scalars['BigInt'];
  order: Scalars['BigInt'];
  receiver: Scalars['Bytes'];
  sender: Scalars['Bytes'];
  superToken: Scalars['Bytes'];
  timestamp: Scalars['BigInt'];
  transactionHash: Scalars['Bytes'];
};

export type VestingScheduleUpdatedEvent_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  addresses?: InputMaybe<Array<Scalars['Bytes']>>;
  addresses_contains?: InputMaybe<Array<Scalars['Bytes']>>;
  addresses_contains_nocase?: InputMaybe<Array<Scalars['Bytes']>>;
  addresses_not?: InputMaybe<Array<Scalars['Bytes']>>;
  addresses_not_contains?: InputMaybe<Array<Scalars['Bytes']>>;
  addresses_not_contains_nocase?: InputMaybe<Array<Scalars['Bytes']>>;
  blockNumber?: InputMaybe<Scalars['BigInt']>;
  blockNumber_gt?: InputMaybe<Scalars['BigInt']>;
  blockNumber_gte?: InputMaybe<Scalars['BigInt']>;
  blockNumber_in?: InputMaybe<Array<Scalars['BigInt']>>;
  blockNumber_lt?: InputMaybe<Scalars['BigInt']>;
  blockNumber_lte?: InputMaybe<Scalars['BigInt']>;
  blockNumber_not?: InputMaybe<Scalars['BigInt']>;
  blockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  endDate?: InputMaybe<Scalars['BigInt']>;
  endDate_gt?: InputMaybe<Scalars['BigInt']>;
  endDate_gte?: InputMaybe<Scalars['BigInt']>;
  endDate_in?: InputMaybe<Array<Scalars['BigInt']>>;
  endDate_lt?: InputMaybe<Scalars['BigInt']>;
  endDate_lte?: InputMaybe<Scalars['BigInt']>;
  endDate_not?: InputMaybe<Scalars['BigInt']>;
  endDate_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  gasPrice?: InputMaybe<Scalars['BigInt']>;
  gasPrice_gt?: InputMaybe<Scalars['BigInt']>;
  gasPrice_gte?: InputMaybe<Scalars['BigInt']>;
  gasPrice_in?: InputMaybe<Array<Scalars['BigInt']>>;
  gasPrice_lt?: InputMaybe<Scalars['BigInt']>;
  gasPrice_lte?: InputMaybe<Scalars['BigInt']>;
  gasPrice_not?: InputMaybe<Scalars['BigInt']>;
  gasPrice_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  logIndex?: InputMaybe<Scalars['BigInt']>;
  logIndex_gt?: InputMaybe<Scalars['BigInt']>;
  logIndex_gte?: InputMaybe<Scalars['BigInt']>;
  logIndex_in?: InputMaybe<Array<Scalars['BigInt']>>;
  logIndex_lt?: InputMaybe<Scalars['BigInt']>;
  logIndex_lte?: InputMaybe<Scalars['BigInt']>;
  logIndex_not?: InputMaybe<Scalars['BigInt']>;
  logIndex_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  name?: InputMaybe<Scalars['String']>;
  name_contains?: InputMaybe<Scalars['String']>;
  name_contains_nocase?: InputMaybe<Scalars['String']>;
  name_ends_with?: InputMaybe<Scalars['String']>;
  name_ends_with_nocase?: InputMaybe<Scalars['String']>;
  name_gt?: InputMaybe<Scalars['String']>;
  name_gte?: InputMaybe<Scalars['String']>;
  name_in?: InputMaybe<Array<Scalars['String']>>;
  name_lt?: InputMaybe<Scalars['String']>;
  name_lte?: InputMaybe<Scalars['String']>;
  name_not?: InputMaybe<Scalars['String']>;
  name_not_contains?: InputMaybe<Scalars['String']>;
  name_not_contains_nocase?: InputMaybe<Scalars['String']>;
  name_not_ends_with?: InputMaybe<Scalars['String']>;
  name_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  name_not_in?: InputMaybe<Array<Scalars['String']>>;
  name_not_starts_with?: InputMaybe<Scalars['String']>;
  name_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  name_starts_with?: InputMaybe<Scalars['String']>;
  name_starts_with_nocase?: InputMaybe<Scalars['String']>;
  oldEndDate?: InputMaybe<Scalars['BigInt']>;
  oldEndDate_gt?: InputMaybe<Scalars['BigInt']>;
  oldEndDate_gte?: InputMaybe<Scalars['BigInt']>;
  oldEndDate_in?: InputMaybe<Array<Scalars['BigInt']>>;
  oldEndDate_lt?: InputMaybe<Scalars['BigInt']>;
  oldEndDate_lte?: InputMaybe<Scalars['BigInt']>;
  oldEndDate_not?: InputMaybe<Scalars['BigInt']>;
  oldEndDate_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  order?: InputMaybe<Scalars['BigInt']>;
  order_gt?: InputMaybe<Scalars['BigInt']>;
  order_gte?: InputMaybe<Scalars['BigInt']>;
  order_in?: InputMaybe<Array<Scalars['BigInt']>>;
  order_lt?: InputMaybe<Scalars['BigInt']>;
  order_lte?: InputMaybe<Scalars['BigInt']>;
  order_not?: InputMaybe<Scalars['BigInt']>;
  order_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  receiver?: InputMaybe<Scalars['Bytes']>;
  receiver_contains?: InputMaybe<Scalars['Bytes']>;
  receiver_in?: InputMaybe<Array<Scalars['Bytes']>>;
  receiver_not?: InputMaybe<Scalars['Bytes']>;
  receiver_not_contains?: InputMaybe<Scalars['Bytes']>;
  receiver_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  sender?: InputMaybe<Scalars['Bytes']>;
  sender_contains?: InputMaybe<Scalars['Bytes']>;
  sender_in?: InputMaybe<Array<Scalars['Bytes']>>;
  sender_not?: InputMaybe<Scalars['Bytes']>;
  sender_not_contains?: InputMaybe<Scalars['Bytes']>;
  sender_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  superToken?: InputMaybe<Scalars['Bytes']>;
  superToken_contains?: InputMaybe<Scalars['Bytes']>;
  superToken_in?: InputMaybe<Array<Scalars['Bytes']>>;
  superToken_not?: InputMaybe<Scalars['Bytes']>;
  superToken_not_contains?: InputMaybe<Scalars['Bytes']>;
  superToken_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  timestamp?: InputMaybe<Scalars['BigInt']>;
  timestamp_gt?: InputMaybe<Scalars['BigInt']>;
  timestamp_gte?: InputMaybe<Scalars['BigInt']>;
  timestamp_in?: InputMaybe<Array<Scalars['BigInt']>>;
  timestamp_lt?: InputMaybe<Scalars['BigInt']>;
  timestamp_lte?: InputMaybe<Scalars['BigInt']>;
  timestamp_not?: InputMaybe<Scalars['BigInt']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  transactionHash?: InputMaybe<Scalars['Bytes']>;
  transactionHash_contains?: InputMaybe<Scalars['Bytes']>;
  transactionHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  transactionHash_not?: InputMaybe<Scalars['Bytes']>;
  transactionHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  transactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
};

export enum VestingScheduleUpdatedEvent_OrderBy {
  Addresses = 'addresses',
  BlockNumber = 'blockNumber',
  EndDate = 'endDate',
  GasPrice = 'gasPrice',
  Id = 'id',
  LogIndex = 'logIndex',
  Name = 'name',
  OldEndDate = 'oldEndDate',
  Order = 'order',
  Receiver = 'receiver',
  Sender = 'sender',
  SuperToken = 'superToken',
  Timestamp = 'timestamp',
  TransactionHash = 'transactionHash'
}

export type VestingSchedule_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  cliffAmount?: InputMaybe<Scalars['BigInt']>;
  cliffAmount_gt?: InputMaybe<Scalars['BigInt']>;
  cliffAmount_gte?: InputMaybe<Scalars['BigInt']>;
  cliffAmount_in?: InputMaybe<Array<Scalars['BigInt']>>;
  cliffAmount_lt?: InputMaybe<Scalars['BigInt']>;
  cliffAmount_lte?: InputMaybe<Scalars['BigInt']>;
  cliffAmount_not?: InputMaybe<Scalars['BigInt']>;
  cliffAmount_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  cliffAndFlowExecutedAt?: InputMaybe<Scalars['BigInt']>;
  cliffAndFlowExecutedAt_gt?: InputMaybe<Scalars['BigInt']>;
  cliffAndFlowExecutedAt_gte?: InputMaybe<Scalars['BigInt']>;
  cliffAndFlowExecutedAt_in?: InputMaybe<Array<Scalars['BigInt']>>;
  cliffAndFlowExecutedAt_lt?: InputMaybe<Scalars['BigInt']>;
  cliffAndFlowExecutedAt_lte?: InputMaybe<Scalars['BigInt']>;
  cliffAndFlowExecutedAt_not?: InputMaybe<Scalars['BigInt']>;
  cliffAndFlowExecutedAt_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  cliffDate?: InputMaybe<Scalars['BigInt']>;
  cliffDate_gt?: InputMaybe<Scalars['BigInt']>;
  cliffDate_gte?: InputMaybe<Scalars['BigInt']>;
  cliffDate_in?: InputMaybe<Array<Scalars['BigInt']>>;
  cliffDate_lt?: InputMaybe<Scalars['BigInt']>;
  cliffDate_lte?: InputMaybe<Scalars['BigInt']>;
  cliffDate_not?: InputMaybe<Scalars['BigInt']>;
  cliffDate_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  deletedAt?: InputMaybe<Scalars['BigInt']>;
  deletedAt_gt?: InputMaybe<Scalars['BigInt']>;
  deletedAt_gte?: InputMaybe<Scalars['BigInt']>;
  deletedAt_in?: InputMaybe<Array<Scalars['BigInt']>>;
  deletedAt_lt?: InputMaybe<Scalars['BigInt']>;
  deletedAt_lte?: InputMaybe<Scalars['BigInt']>;
  deletedAt_not?: InputMaybe<Scalars['BigInt']>;
  deletedAt_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  endDate?: InputMaybe<Scalars['BigInt']>;
  endDate_gt?: InputMaybe<Scalars['BigInt']>;
  endDate_gte?: InputMaybe<Scalars['BigInt']>;
  endDate_in?: InputMaybe<Array<Scalars['BigInt']>>;
  endDate_lt?: InputMaybe<Scalars['BigInt']>;
  endDate_lte?: InputMaybe<Scalars['BigInt']>;
  endDate_not?: InputMaybe<Scalars['BigInt']>;
  endDate_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  endExecutedAt?: InputMaybe<Scalars['BigInt']>;
  endExecutedAt_gt?: InputMaybe<Scalars['BigInt']>;
  endExecutedAt_gte?: InputMaybe<Scalars['BigInt']>;
  endExecutedAt_in?: InputMaybe<Array<Scalars['BigInt']>>;
  endExecutedAt_lt?: InputMaybe<Scalars['BigInt']>;
  endExecutedAt_lte?: InputMaybe<Scalars['BigInt']>;
  endExecutedAt_not?: InputMaybe<Scalars['BigInt']>;
  endExecutedAt_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  flowRate?: InputMaybe<Scalars['BigInt']>;
  flowRate_gt?: InputMaybe<Scalars['BigInt']>;
  flowRate_gte?: InputMaybe<Scalars['BigInt']>;
  flowRate_in?: InputMaybe<Array<Scalars['BigInt']>>;
  flowRate_lt?: InputMaybe<Scalars['BigInt']>;
  flowRate_lte?: InputMaybe<Scalars['BigInt']>;
  flowRate_not?: InputMaybe<Scalars['BigInt']>;
  flowRate_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  id?: InputMaybe<Scalars['String']>;
  id_contains?: InputMaybe<Scalars['String']>;
  id_contains_nocase?: InputMaybe<Scalars['String']>;
  id_ends_with?: InputMaybe<Scalars['String']>;
  id_ends_with_nocase?: InputMaybe<Scalars['String']>;
  id_gt?: InputMaybe<Scalars['String']>;
  id_gte?: InputMaybe<Scalars['String']>;
  id_in?: InputMaybe<Array<Scalars['String']>>;
  id_lt?: InputMaybe<Scalars['String']>;
  id_lte?: InputMaybe<Scalars['String']>;
  id_not?: InputMaybe<Scalars['String']>;
  id_not_contains?: InputMaybe<Scalars['String']>;
  id_not_contains_nocase?: InputMaybe<Scalars['String']>;
  id_not_ends_with?: InputMaybe<Scalars['String']>;
  id_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  id_not_in?: InputMaybe<Array<Scalars['String']>>;
  id_not_starts_with?: InputMaybe<Scalars['String']>;
  id_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  id_starts_with?: InputMaybe<Scalars['String']>;
  id_starts_with_nocase?: InputMaybe<Scalars['String']>;
  nextExecutionAt?: InputMaybe<Scalars['BigInt']>;
  nextExecutionAt_gt?: InputMaybe<Scalars['BigInt']>;
  nextExecutionAt_gte?: InputMaybe<Scalars['BigInt']>;
  nextExecutionAt_in?: InputMaybe<Array<Scalars['BigInt']>>;
  nextExecutionAt_lt?: InputMaybe<Scalars['BigInt']>;
  nextExecutionAt_lte?: InputMaybe<Scalars['BigInt']>;
  nextExecutionAt_not?: InputMaybe<Scalars['BigInt']>;
  nextExecutionAt_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  receiver?: InputMaybe<Scalars['Bytes']>;
  receiver_contains?: InputMaybe<Scalars['Bytes']>;
  receiver_in?: InputMaybe<Array<Scalars['Bytes']>>;
  receiver_not?: InputMaybe<Scalars['Bytes']>;
  receiver_not_contains?: InputMaybe<Scalars['Bytes']>;
  receiver_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  sender?: InputMaybe<Scalars['Bytes']>;
  sender_contains?: InputMaybe<Scalars['Bytes']>;
  sender_in?: InputMaybe<Array<Scalars['Bytes']>>;
  sender_not?: InputMaybe<Scalars['Bytes']>;
  sender_not_contains?: InputMaybe<Scalars['Bytes']>;
  sender_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  startDate?: InputMaybe<Scalars['BigInt']>;
  startDate_gt?: InputMaybe<Scalars['BigInt']>;
  startDate_gte?: InputMaybe<Scalars['BigInt']>;
  startDate_in?: InputMaybe<Array<Scalars['BigInt']>>;
  startDate_lt?: InputMaybe<Scalars['BigInt']>;
  startDate_lte?: InputMaybe<Scalars['BigInt']>;
  startDate_not?: InputMaybe<Scalars['BigInt']>;
  startDate_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  superToken?: InputMaybe<Scalars['Bytes']>;
  superToken_contains?: InputMaybe<Scalars['Bytes']>;
  superToken_in?: InputMaybe<Array<Scalars['Bytes']>>;
  superToken_not?: InputMaybe<Scalars['Bytes']>;
  superToken_not_contains?: InputMaybe<Scalars['Bytes']>;
  superToken_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
};

export enum VestingSchedule_OrderBy {
  CliffAmount = 'cliffAmount',
  CliffAndFlowExecutedAt = 'cliffAndFlowExecutedAt',
  CliffDate = 'cliffDate',
  DeletedAt = 'deletedAt',
  EndDate = 'endDate',
  EndExecutedAt = 'endExecutedAt',
  FlowRate = 'flowRate',
  Id = 'id',
  NextExecutionAt = 'nextExecutionAt',
  Receiver = 'receiver',
  Sender = 'sender',
  StartDate = 'startDate',
  SuperToken = 'superToken'
}

export type _Block_ = {
  __typename?: '_Block_';
  /** The hash of the block */
  hash?: Maybe<Scalars['Bytes']>;
  /** The block number */
  number: Scalars['Int'];
  /** Integer representation of the timestamp stored in blocks for the chain */
  timestamp?: Maybe<Scalars['Int']>;
};

/** The type for the top-level _meta field */
export type _Meta_ = {
  __typename?: '_Meta_';
  /**
   * Information about a specific subgraph block. The hash of the block
   * will be null if the _meta field has a block constraint that asks for
   * a block number. It will be filled if the _meta field has no block constraint
   * and therefore asks for the latest  block
   */
  block: _Block_;
  /** The deployment ID */
  deployment: Scalars['String'];
  /** If `true`, the subgraph encountered indexing errors at some past block */
  hasIndexingErrors: Scalars['Boolean'];
};

export enum _SubgraphErrorPolicy_ {
  /** Data will be returned even if the subgraph has indexing errors */
  Allow = 'allow',
  /** If the subgraph has indexing errors, data will be omitted. The default. */
  Deny = 'deny'
}
