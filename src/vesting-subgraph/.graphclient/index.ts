// @ts-nocheck
import { GraphQLResolveInfo, SelectionSetNode, FieldNode, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
import { gql } from '@graphql-mesh/utils';

import type { GetMeshOptions } from '@graphql-mesh/runtime';
import type { YamlConfig } from '@graphql-mesh/types';
import { PubSub } from '@graphql-mesh/utils';
import { DefaultLogger } from '@graphql-mesh/utils';
import MeshCache from "@graphql-mesh/cache-localforage";
import { fetch as fetchFn } from '@whatwg-node/fetch';

import { MeshResolvedSource } from '@graphql-mesh/runtime';
import { MeshTransform, MeshPlugin } from '@graphql-mesh/types';
import GraphqlHandler from "@graphql-mesh/graphql"
import BareMerger from "@graphql-mesh/merger-bare";
import { printWithCache } from '@graphql-mesh/utils';
import { createMeshHTTPHandler, MeshHTTPHandler } from '@graphql-mesh/http';
import { getMesh, ExecuteMeshFn, SubscribeMeshFn, MeshContext as BaseMeshContext, MeshInstance } from '@graphql-mesh/runtime';
import { MeshStore, FsStoreStorageAdapter } from '@graphql-mesh/store';
import { path as pathModule } from '@graphql-mesh/cross-helpers';
import { ImportFn } from '@graphql-mesh/types';
import type { VestingTypes } from './sources/vesting/types';
import * as importedModule$0 from "./sources/vesting/introspectionSchema";
export type Maybe<T> = T | undefined;
export type InputMaybe<T> = T | undefined;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };



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
  Int8: any;
  Timestamp: any;
};

export type Aggregation_Interval =
  | 'hour'
  | 'day';

export type BlockChangedFilter = {
  number_gte: Scalars['Int'];
};

export type Block_Height = {
  hash?: InputMaybe<Scalars['Bytes']>;
  number?: InputMaybe<Scalars['Int']>;
  number_gte?: InputMaybe<Scalars['Int']>;
};

export type ContractVersion =
  | 'v1'
  | 'v2';

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

export type Event_Filter = {
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
  and?: InputMaybe<Array<InputMaybe<Event_Filter>>>;
  or?: InputMaybe<Array<InputMaybe<Event_Filter>>>;
};

export type Event_OrderBy =
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


export type QueryVestingCliffAndFlowExecutedEventArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_Height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryVestingCliffAndFlowExecutedEventsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<VestingCliffAndFlowExecutedEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<VestingCliffAndFlowExecutedEvent_Filter>;
  block?: InputMaybe<Block_Height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryVestingEndExecutedEventArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_Height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryVestingEndExecutedEventsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<VestingEndExecutedEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<VestingEndExecutedEvent_Filter>;
  block?: InputMaybe<Block_Height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryVestingEndFailedEventArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_Height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryVestingEndFailedEventsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<VestingEndFailedEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<VestingEndFailedEvent_Filter>;
  block?: InputMaybe<Block_Height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryVestingScheduleCreatedEventArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_Height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryVestingScheduleCreatedEventsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<VestingScheduleCreatedEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<VestingScheduleCreatedEvent_Filter>;
  block?: InputMaybe<Block_Height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryVestingScheduleDeletedEventArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_Height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryVestingScheduleDeletedEventsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<VestingScheduleDeletedEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<VestingScheduleDeletedEvent_Filter>;
  block?: InputMaybe<Block_Height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryVestingScheduleUpdatedEventArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_Height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryVestingScheduleUpdatedEventsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<VestingScheduleUpdatedEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<VestingScheduleUpdatedEvent_Filter>;
  block?: InputMaybe<Block_Height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryVestingClaimedEventArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_Height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryVestingClaimedEventsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<VestingClaimedEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<VestingClaimedEvent_Filter>;
  block?: InputMaybe<Block_Height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryVestingScheduleArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_Height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryVestingSchedulesArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<VestingSchedule_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<VestingSchedule_Filter>;
  block?: InputMaybe<Block_Height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryTokenSenderReceiverCursorArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_Height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryTokenSenderReceiverCursorsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<TokenSenderReceiverCursor_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<TokenSenderReceiverCursor_Filter>;
  block?: InputMaybe<Block_Height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryTaskArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_Height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryTasksArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Task_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<Task_Filter>;
  block?: InputMaybe<Block_Height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryEventArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_Height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryEventsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Event_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<Event_Filter>;
  block?: InputMaybe<Block_Height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type Query_MetaArgs = {
  block?: InputMaybe<Block_Height>;
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


export type SubscriptionVestingCliffAndFlowExecutedEventArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_Height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionVestingCliffAndFlowExecutedEventsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<VestingCliffAndFlowExecutedEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<VestingCliffAndFlowExecutedEvent_Filter>;
  block?: InputMaybe<Block_Height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionVestingEndExecutedEventArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_Height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionVestingEndExecutedEventsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<VestingEndExecutedEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<VestingEndExecutedEvent_Filter>;
  block?: InputMaybe<Block_Height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionVestingEndFailedEventArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_Height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionVestingEndFailedEventsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<VestingEndFailedEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<VestingEndFailedEvent_Filter>;
  block?: InputMaybe<Block_Height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionVestingScheduleCreatedEventArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_Height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionVestingScheduleCreatedEventsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<VestingScheduleCreatedEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<VestingScheduleCreatedEvent_Filter>;
  block?: InputMaybe<Block_Height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionVestingScheduleDeletedEventArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_Height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionVestingScheduleDeletedEventsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<VestingScheduleDeletedEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<VestingScheduleDeletedEvent_Filter>;
  block?: InputMaybe<Block_Height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionVestingScheduleUpdatedEventArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_Height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionVestingScheduleUpdatedEventsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<VestingScheduleUpdatedEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<VestingScheduleUpdatedEvent_Filter>;
  block?: InputMaybe<Block_Height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionVestingClaimedEventArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_Height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionVestingClaimedEventsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<VestingClaimedEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<VestingClaimedEvent_Filter>;
  block?: InputMaybe<Block_Height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionVestingScheduleArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_Height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionVestingSchedulesArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<VestingSchedule_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<VestingSchedule_Filter>;
  block?: InputMaybe<Block_Height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionTokenSenderReceiverCursorArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_Height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionTokenSenderReceiverCursorsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<TokenSenderReceiverCursor_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<TokenSenderReceiverCursor_Filter>;
  block?: InputMaybe<Block_Height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionTaskArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_Height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionTasksArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Task_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<Task_Filter>;
  block?: InputMaybe<Block_Height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionEventArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_Height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionEventsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Event_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<Event_Filter>;
  block?: InputMaybe<Block_Height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type Subscription_MetaArgs = {
  block?: InputMaybe<Block_Height>;
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

export type Task_Filter = {
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
  vestingSchedule_?: InputMaybe<VestingSchedule_Filter>;
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<Task_Filter>>>;
  or?: InputMaybe<Array<InputMaybe<Task_Filter>>>;
};

export type Task_OrderBy =
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
  | 'vestingSchedule__remainderAmount';

export type TokenSenderReceiverCursor = {
  id: Scalars['String'];
  currentVestingSchedule?: Maybe<VestingSchedule>;
  currentCliffAndFlowTask?: Maybe<Task>;
  currentEndVestingTask?: Maybe<Task>;
};

export type TokenSenderReceiverCursor_Filter = {
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
  currentVestingSchedule_?: InputMaybe<VestingSchedule_Filter>;
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
  currentCliffAndFlowTask_?: InputMaybe<Task_Filter>;
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
  currentEndVestingTask_?: InputMaybe<Task_Filter>;
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<TokenSenderReceiverCursor_Filter>>>;
  or?: InputMaybe<Array<InputMaybe<TokenSenderReceiverCursor_Filter>>>;
};

export type TokenSenderReceiverCursor_OrderBy =
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

export type VestingClaimedEvent_Filter = {
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
  and?: InputMaybe<Array<InputMaybe<VestingClaimedEvent_Filter>>>;
  or?: InputMaybe<Array<InputMaybe<VestingClaimedEvent_Filter>>>;
};

export type VestingClaimedEvent_OrderBy =
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

export type VestingCliffAndFlowExecutedEvent_Filter = {
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
  and?: InputMaybe<Array<InputMaybe<VestingCliffAndFlowExecutedEvent_Filter>>>;
  or?: InputMaybe<Array<InputMaybe<VestingCliffAndFlowExecutedEvent_Filter>>>;
};

export type VestingCliffAndFlowExecutedEvent_OrderBy =
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

export type VestingEndExecutedEvent_Filter = {
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
  and?: InputMaybe<Array<InputMaybe<VestingEndExecutedEvent_Filter>>>;
  or?: InputMaybe<Array<InputMaybe<VestingEndExecutedEvent_Filter>>>;
};

export type VestingEndExecutedEvent_OrderBy =
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

export type VestingEndFailedEvent_Filter = {
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
  and?: InputMaybe<Array<InputMaybe<VestingEndFailedEvent_Filter>>>;
  or?: InputMaybe<Array<InputMaybe<VestingEndFailedEvent_Filter>>>;
};

export type VestingEndFailedEvent_OrderBy =
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
};


export type VestingScheduleTasksArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Task_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<Task_Filter>;
};


export type VestingScheduleEventsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Event_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<Event_Filter>;
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

export type VestingScheduleCreatedEvent_Filter = {
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
  and?: InputMaybe<Array<InputMaybe<VestingScheduleCreatedEvent_Filter>>>;
  or?: InputMaybe<Array<InputMaybe<VestingScheduleCreatedEvent_Filter>>>;
};

export type VestingScheduleCreatedEvent_OrderBy =
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

export type VestingScheduleDeletedEvent_Filter = {
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
  and?: InputMaybe<Array<InputMaybe<VestingScheduleDeletedEvent_Filter>>>;
  or?: InputMaybe<Array<InputMaybe<VestingScheduleDeletedEvent_Filter>>>;
};

export type VestingScheduleDeletedEvent_OrderBy =
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
};

export type VestingScheduleUpdatedEvent_Filter = {
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
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<VestingScheduleUpdatedEvent_Filter>>>;
  or?: InputMaybe<Array<InputMaybe<VestingScheduleUpdatedEvent_Filter>>>;
};

export type VestingScheduleUpdatedEvent_OrderBy =
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
  | 'remainderAmount';

export type VestingSchedule_Filter = {
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
  tasks_?: InputMaybe<Task_Filter>;
  events?: InputMaybe<Array<Scalars['String']>>;
  events_not?: InputMaybe<Array<Scalars['String']>>;
  events_contains?: InputMaybe<Array<Scalars['String']>>;
  events_contains_nocase?: InputMaybe<Array<Scalars['String']>>;
  events_not_contains?: InputMaybe<Array<Scalars['String']>>;
  events_not_contains_nocase?: InputMaybe<Array<Scalars['String']>>;
  events_?: InputMaybe<Event_Filter>;
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
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<VestingSchedule_Filter>>>;
  or?: InputMaybe<Array<InputMaybe<VestingSchedule_Filter>>>;
};

export type VestingSchedule_OrderBy =
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
  | 'remainderAmount';

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

export type WithIndex<TObject> = TObject & Record<string, any>;
export type ResolversObject<TObject> = WithIndex<TObject>;

export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};

export type LegacyStitchingResolver<TResult, TParent, TContext, TArgs> = {
  fragment: string;
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};

export type NewStitchingResolver<TResult, TParent, TContext, TArgs> = {
  selectionSet: string | ((fieldNode: FieldNode) => SelectionSetNode);
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type StitchingResolver<TResult, TParent, TContext, TArgs> = LegacyStitchingResolver<TResult, TParent, TContext, TArgs> | NewStitchingResolver<TResult, TParent, TContext, TArgs>;
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> =
  | ResolverFn<TResult, TParent, TContext, TArgs>
  | ResolverWithResolve<TResult, TParent, TContext, TArgs>
  | StitchingResolver<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;



/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = ResolversObject<{
  Aggregation_interval: Aggregation_Interval;
  BigDecimal: ResolverTypeWrapper<Scalars['BigDecimal']>;
  BigInt: ResolverTypeWrapper<Scalars['BigInt']>;
  BlockChangedFilter: BlockChangedFilter;
  Block_height: Block_Height;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
  Bytes: ResolverTypeWrapper<Scalars['Bytes']>;
  ContractVersion: ContractVersion;
  Event: ResolversTypes['VestingClaimedEvent'] | ResolversTypes['VestingCliffAndFlowExecutedEvent'] | ResolversTypes['VestingEndExecutedEvent'] | ResolversTypes['VestingEndFailedEvent'] | ResolversTypes['VestingScheduleCreatedEvent'] | ResolversTypes['VestingScheduleDeletedEvent'] | ResolversTypes['VestingScheduleUpdatedEvent'];
  Event_filter: Event_Filter;
  Event_orderBy: Event_OrderBy;
  Float: ResolverTypeWrapper<Scalars['Float']>;
  ID: ResolverTypeWrapper<Scalars['ID']>;
  Int: ResolverTypeWrapper<Scalars['Int']>;
  Int8: ResolverTypeWrapper<Scalars['Int8']>;
  OrderDirection: OrderDirection;
  Query: ResolverTypeWrapper<{}>;
  String: ResolverTypeWrapper<Scalars['String']>;
  Subscription: ResolverTypeWrapper<{}>;
  Task: ResolverTypeWrapper<Task>;
  TaskType: TaskType;
  Task_filter: Task_Filter;
  Task_orderBy: Task_OrderBy;
  Timestamp: ResolverTypeWrapper<Scalars['Timestamp']>;
  TokenSenderReceiverCursor: ResolverTypeWrapper<TokenSenderReceiverCursor>;
  TokenSenderReceiverCursor_filter: TokenSenderReceiverCursor_Filter;
  TokenSenderReceiverCursor_orderBy: TokenSenderReceiverCursor_OrderBy;
  VestingClaimedEvent: ResolverTypeWrapper<VestingClaimedEvent>;
  VestingClaimedEvent_filter: VestingClaimedEvent_Filter;
  VestingClaimedEvent_orderBy: VestingClaimedEvent_OrderBy;
  VestingCliffAndFlowExecutedEvent: ResolverTypeWrapper<VestingCliffAndFlowExecutedEvent>;
  VestingCliffAndFlowExecutedEvent_filter: VestingCliffAndFlowExecutedEvent_Filter;
  VestingCliffAndFlowExecutedEvent_orderBy: VestingCliffAndFlowExecutedEvent_OrderBy;
  VestingEndExecutedEvent: ResolverTypeWrapper<VestingEndExecutedEvent>;
  VestingEndExecutedEvent_filter: VestingEndExecutedEvent_Filter;
  VestingEndExecutedEvent_orderBy: VestingEndExecutedEvent_OrderBy;
  VestingEndFailedEvent: ResolverTypeWrapper<VestingEndFailedEvent>;
  VestingEndFailedEvent_filter: VestingEndFailedEvent_Filter;
  VestingEndFailedEvent_orderBy: VestingEndFailedEvent_OrderBy;
  VestingSchedule: ResolverTypeWrapper<VestingSchedule>;
  VestingScheduleCreatedEvent: ResolverTypeWrapper<VestingScheduleCreatedEvent>;
  VestingScheduleCreatedEvent_filter: VestingScheduleCreatedEvent_Filter;
  VestingScheduleCreatedEvent_orderBy: VestingScheduleCreatedEvent_OrderBy;
  VestingScheduleDeletedEvent: ResolverTypeWrapper<VestingScheduleDeletedEvent>;
  VestingScheduleDeletedEvent_filter: VestingScheduleDeletedEvent_Filter;
  VestingScheduleDeletedEvent_orderBy: VestingScheduleDeletedEvent_OrderBy;
  VestingScheduleUpdatedEvent: ResolverTypeWrapper<VestingScheduleUpdatedEvent>;
  VestingScheduleUpdatedEvent_filter: VestingScheduleUpdatedEvent_Filter;
  VestingScheduleUpdatedEvent_orderBy: VestingScheduleUpdatedEvent_OrderBy;
  VestingSchedule_filter: VestingSchedule_Filter;
  VestingSchedule_orderBy: VestingSchedule_OrderBy;
  _Block_: ResolverTypeWrapper<_Block_>;
  _Meta_: ResolverTypeWrapper<_Meta_>;
  _SubgraphErrorPolicy_: _SubgraphErrorPolicy_;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  BigDecimal: Scalars['BigDecimal'];
  BigInt: Scalars['BigInt'];
  BlockChangedFilter: BlockChangedFilter;
  Block_height: Block_Height;
  Boolean: Scalars['Boolean'];
  Bytes: Scalars['Bytes'];
  Event: ResolversParentTypes['VestingClaimedEvent'] | ResolversParentTypes['VestingCliffAndFlowExecutedEvent'] | ResolversParentTypes['VestingEndExecutedEvent'] | ResolversParentTypes['VestingEndFailedEvent'] | ResolversParentTypes['VestingScheduleCreatedEvent'] | ResolversParentTypes['VestingScheduleDeletedEvent'] | ResolversParentTypes['VestingScheduleUpdatedEvent'];
  Event_filter: Event_Filter;
  Float: Scalars['Float'];
  ID: Scalars['ID'];
  Int: Scalars['Int'];
  Int8: Scalars['Int8'];
  Query: {};
  String: Scalars['String'];
  Subscription: {};
  Task: Task;
  Task_filter: Task_Filter;
  Timestamp: Scalars['Timestamp'];
  TokenSenderReceiverCursor: TokenSenderReceiverCursor;
  TokenSenderReceiverCursor_filter: TokenSenderReceiverCursor_Filter;
  VestingClaimedEvent: VestingClaimedEvent;
  VestingClaimedEvent_filter: VestingClaimedEvent_Filter;
  VestingCliffAndFlowExecutedEvent: VestingCliffAndFlowExecutedEvent;
  VestingCliffAndFlowExecutedEvent_filter: VestingCliffAndFlowExecutedEvent_Filter;
  VestingEndExecutedEvent: VestingEndExecutedEvent;
  VestingEndExecutedEvent_filter: VestingEndExecutedEvent_Filter;
  VestingEndFailedEvent: VestingEndFailedEvent;
  VestingEndFailedEvent_filter: VestingEndFailedEvent_Filter;
  VestingSchedule: VestingSchedule;
  VestingScheduleCreatedEvent: VestingScheduleCreatedEvent;
  VestingScheduleCreatedEvent_filter: VestingScheduleCreatedEvent_Filter;
  VestingScheduleDeletedEvent: VestingScheduleDeletedEvent;
  VestingScheduleDeletedEvent_filter: VestingScheduleDeletedEvent_Filter;
  VestingScheduleUpdatedEvent: VestingScheduleUpdatedEvent;
  VestingScheduleUpdatedEvent_filter: VestingScheduleUpdatedEvent_Filter;
  VestingSchedule_filter: VestingSchedule_Filter;
  _Block_: _Block_;
  _Meta_: _Meta_;
}>;

export type EntityDirectiveArgs = { };

export type EntityDirectiveResolver<Result, Parent, ContextType = MeshContext, Args = EntityDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type SubgraphIdDirectiveArgs = {
  id: Scalars['String'];
};

export type SubgraphIdDirectiveResolver<Result, Parent, ContextType = MeshContext, Args = SubgraphIdDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type DerivedFromDirectiveArgs = {
  field: Scalars['String'];
};

export type DerivedFromDirectiveResolver<Result, Parent, ContextType = MeshContext, Args = DerivedFromDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export interface BigDecimalScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['BigDecimal'], any> {
  name: 'BigDecimal';
}

export interface BigIntScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['BigInt'], any> {
  name: 'BigInt';
}

export interface BytesScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Bytes'], any> {
  name: 'Bytes';
}

export type EventResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['Event'] = ResolversParentTypes['Event']> = ResolversObject<{
  __resolveType: TypeResolveFn<'VestingClaimedEvent' | 'VestingCliffAndFlowExecutedEvent' | 'VestingEndExecutedEvent' | 'VestingEndFailedEvent' | 'VestingScheduleCreatedEvent' | 'VestingScheduleDeletedEvent' | 'VestingScheduleUpdatedEvent', ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  blockNumber?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  logIndex?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  order?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  addresses?: Resolver<Array<ResolversTypes['Bytes']>, ParentType, ContextType>;
  timestamp?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  transactionHash?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  gasPrice?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
}>;

export interface Int8ScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Int8'], any> {
  name: 'Int8';
}

export type QueryResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = ResolversObject<{
  vestingCliffAndFlowExecutedEvent?: Resolver<Maybe<ResolversTypes['VestingCliffAndFlowExecutedEvent']>, ParentType, ContextType, RequireFields<QueryVestingCliffAndFlowExecutedEventArgs, 'id' | 'subgraphError'>>;
  vestingCliffAndFlowExecutedEvents?: Resolver<Array<ResolversTypes['VestingCliffAndFlowExecutedEvent']>, ParentType, ContextType, RequireFields<QueryVestingCliffAndFlowExecutedEventsArgs, 'skip' | 'first' | 'subgraphError'>>;
  vestingEndExecutedEvent?: Resolver<Maybe<ResolversTypes['VestingEndExecutedEvent']>, ParentType, ContextType, RequireFields<QueryVestingEndExecutedEventArgs, 'id' | 'subgraphError'>>;
  vestingEndExecutedEvents?: Resolver<Array<ResolversTypes['VestingEndExecutedEvent']>, ParentType, ContextType, RequireFields<QueryVestingEndExecutedEventsArgs, 'skip' | 'first' | 'subgraphError'>>;
  vestingEndFailedEvent?: Resolver<Maybe<ResolversTypes['VestingEndFailedEvent']>, ParentType, ContextType, RequireFields<QueryVestingEndFailedEventArgs, 'id' | 'subgraphError'>>;
  vestingEndFailedEvents?: Resolver<Array<ResolversTypes['VestingEndFailedEvent']>, ParentType, ContextType, RequireFields<QueryVestingEndFailedEventsArgs, 'skip' | 'first' | 'subgraphError'>>;
  vestingScheduleCreatedEvent?: Resolver<Maybe<ResolversTypes['VestingScheduleCreatedEvent']>, ParentType, ContextType, RequireFields<QueryVestingScheduleCreatedEventArgs, 'id' | 'subgraphError'>>;
  vestingScheduleCreatedEvents?: Resolver<Array<ResolversTypes['VestingScheduleCreatedEvent']>, ParentType, ContextType, RequireFields<QueryVestingScheduleCreatedEventsArgs, 'skip' | 'first' | 'subgraphError'>>;
  vestingScheduleDeletedEvent?: Resolver<Maybe<ResolversTypes['VestingScheduleDeletedEvent']>, ParentType, ContextType, RequireFields<QueryVestingScheduleDeletedEventArgs, 'id' | 'subgraphError'>>;
  vestingScheduleDeletedEvents?: Resolver<Array<ResolversTypes['VestingScheduleDeletedEvent']>, ParentType, ContextType, RequireFields<QueryVestingScheduleDeletedEventsArgs, 'skip' | 'first' | 'subgraphError'>>;
  vestingScheduleUpdatedEvent?: Resolver<Maybe<ResolversTypes['VestingScheduleUpdatedEvent']>, ParentType, ContextType, RequireFields<QueryVestingScheduleUpdatedEventArgs, 'id' | 'subgraphError'>>;
  vestingScheduleUpdatedEvents?: Resolver<Array<ResolversTypes['VestingScheduleUpdatedEvent']>, ParentType, ContextType, RequireFields<QueryVestingScheduleUpdatedEventsArgs, 'skip' | 'first' | 'subgraphError'>>;
  vestingClaimedEvent?: Resolver<Maybe<ResolversTypes['VestingClaimedEvent']>, ParentType, ContextType, RequireFields<QueryVestingClaimedEventArgs, 'id' | 'subgraphError'>>;
  vestingClaimedEvents?: Resolver<Array<ResolversTypes['VestingClaimedEvent']>, ParentType, ContextType, RequireFields<QueryVestingClaimedEventsArgs, 'skip' | 'first' | 'subgraphError'>>;
  vestingSchedule?: Resolver<Maybe<ResolversTypes['VestingSchedule']>, ParentType, ContextType, RequireFields<QueryVestingScheduleArgs, 'id' | 'subgraphError'>>;
  vestingSchedules?: Resolver<Array<ResolversTypes['VestingSchedule']>, ParentType, ContextType, RequireFields<QueryVestingSchedulesArgs, 'skip' | 'first' | 'subgraphError'>>;
  tokenSenderReceiverCursor?: Resolver<Maybe<ResolversTypes['TokenSenderReceiverCursor']>, ParentType, ContextType, RequireFields<QueryTokenSenderReceiverCursorArgs, 'id' | 'subgraphError'>>;
  tokenSenderReceiverCursors?: Resolver<Array<ResolversTypes['TokenSenderReceiverCursor']>, ParentType, ContextType, RequireFields<QueryTokenSenderReceiverCursorsArgs, 'skip' | 'first' | 'subgraphError'>>;
  task?: Resolver<Maybe<ResolversTypes['Task']>, ParentType, ContextType, RequireFields<QueryTaskArgs, 'id' | 'subgraphError'>>;
  tasks?: Resolver<Array<ResolversTypes['Task']>, ParentType, ContextType, RequireFields<QueryTasksArgs, 'skip' | 'first' | 'subgraphError'>>;
  event?: Resolver<Maybe<ResolversTypes['Event']>, ParentType, ContextType, RequireFields<QueryEventArgs, 'id' | 'subgraphError'>>;
  events?: Resolver<Array<ResolversTypes['Event']>, ParentType, ContextType, RequireFields<QueryEventsArgs, 'skip' | 'first' | 'subgraphError'>>;
  _meta?: Resolver<Maybe<ResolversTypes['_Meta_']>, ParentType, ContextType, Partial<Query_MetaArgs>>;
}>;

export type SubscriptionResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['Subscription'] = ResolversParentTypes['Subscription']> = ResolversObject<{
  vestingCliffAndFlowExecutedEvent?: SubscriptionResolver<Maybe<ResolversTypes['VestingCliffAndFlowExecutedEvent']>, "vestingCliffAndFlowExecutedEvent", ParentType, ContextType, RequireFields<SubscriptionVestingCliffAndFlowExecutedEventArgs, 'id' | 'subgraphError'>>;
  vestingCliffAndFlowExecutedEvents?: SubscriptionResolver<Array<ResolversTypes['VestingCliffAndFlowExecutedEvent']>, "vestingCliffAndFlowExecutedEvents", ParentType, ContextType, RequireFields<SubscriptionVestingCliffAndFlowExecutedEventsArgs, 'skip' | 'first' | 'subgraphError'>>;
  vestingEndExecutedEvent?: SubscriptionResolver<Maybe<ResolversTypes['VestingEndExecutedEvent']>, "vestingEndExecutedEvent", ParentType, ContextType, RequireFields<SubscriptionVestingEndExecutedEventArgs, 'id' | 'subgraphError'>>;
  vestingEndExecutedEvents?: SubscriptionResolver<Array<ResolversTypes['VestingEndExecutedEvent']>, "vestingEndExecutedEvents", ParentType, ContextType, RequireFields<SubscriptionVestingEndExecutedEventsArgs, 'skip' | 'first' | 'subgraphError'>>;
  vestingEndFailedEvent?: SubscriptionResolver<Maybe<ResolversTypes['VestingEndFailedEvent']>, "vestingEndFailedEvent", ParentType, ContextType, RequireFields<SubscriptionVestingEndFailedEventArgs, 'id' | 'subgraphError'>>;
  vestingEndFailedEvents?: SubscriptionResolver<Array<ResolversTypes['VestingEndFailedEvent']>, "vestingEndFailedEvents", ParentType, ContextType, RequireFields<SubscriptionVestingEndFailedEventsArgs, 'skip' | 'first' | 'subgraphError'>>;
  vestingScheduleCreatedEvent?: SubscriptionResolver<Maybe<ResolversTypes['VestingScheduleCreatedEvent']>, "vestingScheduleCreatedEvent", ParentType, ContextType, RequireFields<SubscriptionVestingScheduleCreatedEventArgs, 'id' | 'subgraphError'>>;
  vestingScheduleCreatedEvents?: SubscriptionResolver<Array<ResolversTypes['VestingScheduleCreatedEvent']>, "vestingScheduleCreatedEvents", ParentType, ContextType, RequireFields<SubscriptionVestingScheduleCreatedEventsArgs, 'skip' | 'first' | 'subgraphError'>>;
  vestingScheduleDeletedEvent?: SubscriptionResolver<Maybe<ResolversTypes['VestingScheduleDeletedEvent']>, "vestingScheduleDeletedEvent", ParentType, ContextType, RequireFields<SubscriptionVestingScheduleDeletedEventArgs, 'id' | 'subgraphError'>>;
  vestingScheduleDeletedEvents?: SubscriptionResolver<Array<ResolversTypes['VestingScheduleDeletedEvent']>, "vestingScheduleDeletedEvents", ParentType, ContextType, RequireFields<SubscriptionVestingScheduleDeletedEventsArgs, 'skip' | 'first' | 'subgraphError'>>;
  vestingScheduleUpdatedEvent?: SubscriptionResolver<Maybe<ResolversTypes['VestingScheduleUpdatedEvent']>, "vestingScheduleUpdatedEvent", ParentType, ContextType, RequireFields<SubscriptionVestingScheduleUpdatedEventArgs, 'id' | 'subgraphError'>>;
  vestingScheduleUpdatedEvents?: SubscriptionResolver<Array<ResolversTypes['VestingScheduleUpdatedEvent']>, "vestingScheduleUpdatedEvents", ParentType, ContextType, RequireFields<SubscriptionVestingScheduleUpdatedEventsArgs, 'skip' | 'first' | 'subgraphError'>>;
  vestingClaimedEvent?: SubscriptionResolver<Maybe<ResolversTypes['VestingClaimedEvent']>, "vestingClaimedEvent", ParentType, ContextType, RequireFields<SubscriptionVestingClaimedEventArgs, 'id' | 'subgraphError'>>;
  vestingClaimedEvents?: SubscriptionResolver<Array<ResolversTypes['VestingClaimedEvent']>, "vestingClaimedEvents", ParentType, ContextType, RequireFields<SubscriptionVestingClaimedEventsArgs, 'skip' | 'first' | 'subgraphError'>>;
  vestingSchedule?: SubscriptionResolver<Maybe<ResolversTypes['VestingSchedule']>, "vestingSchedule", ParentType, ContextType, RequireFields<SubscriptionVestingScheduleArgs, 'id' | 'subgraphError'>>;
  vestingSchedules?: SubscriptionResolver<Array<ResolversTypes['VestingSchedule']>, "vestingSchedules", ParentType, ContextType, RequireFields<SubscriptionVestingSchedulesArgs, 'skip' | 'first' | 'subgraphError'>>;
  tokenSenderReceiverCursor?: SubscriptionResolver<Maybe<ResolversTypes['TokenSenderReceiverCursor']>, "tokenSenderReceiverCursor", ParentType, ContextType, RequireFields<SubscriptionTokenSenderReceiverCursorArgs, 'id' | 'subgraphError'>>;
  tokenSenderReceiverCursors?: SubscriptionResolver<Array<ResolversTypes['TokenSenderReceiverCursor']>, "tokenSenderReceiverCursors", ParentType, ContextType, RequireFields<SubscriptionTokenSenderReceiverCursorsArgs, 'skip' | 'first' | 'subgraphError'>>;
  task?: SubscriptionResolver<Maybe<ResolversTypes['Task']>, "task", ParentType, ContextType, RequireFields<SubscriptionTaskArgs, 'id' | 'subgraphError'>>;
  tasks?: SubscriptionResolver<Array<ResolversTypes['Task']>, "tasks", ParentType, ContextType, RequireFields<SubscriptionTasksArgs, 'skip' | 'first' | 'subgraphError'>>;
  event?: SubscriptionResolver<Maybe<ResolversTypes['Event']>, "event", ParentType, ContextType, RequireFields<SubscriptionEventArgs, 'id' | 'subgraphError'>>;
  events?: SubscriptionResolver<Array<ResolversTypes['Event']>, "events", ParentType, ContextType, RequireFields<SubscriptionEventsArgs, 'skip' | 'first' | 'subgraphError'>>;
  _meta?: SubscriptionResolver<Maybe<ResolversTypes['_Meta_']>, "_meta", ParentType, ContextType, Partial<Subscription_MetaArgs>>;
}>;

export type TaskResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['Task'] = ResolversParentTypes['Task']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['TaskType'], ParentType, ContextType>;
  executedAt?: Resolver<Maybe<ResolversTypes['BigInt']>, ParentType, ContextType>;
  executionAt?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  expirationAt?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  cancelledAt?: Resolver<Maybe<ResolversTypes['BigInt']>, ParentType, ContextType>;
  failedAt?: Resolver<Maybe<ResolversTypes['BigInt']>, ParentType, ContextType>;
  vestingSchedule?: Resolver<ResolversTypes['VestingSchedule'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export interface TimestampScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Timestamp'], any> {
  name: 'Timestamp';
}

export type TokenSenderReceiverCursorResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['TokenSenderReceiverCursor'] = ResolversParentTypes['TokenSenderReceiverCursor']> = ResolversObject<{
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  currentVestingSchedule?: Resolver<Maybe<ResolversTypes['VestingSchedule']>, ParentType, ContextType>;
  currentCliffAndFlowTask?: Resolver<Maybe<ResolversTypes['Task']>, ParentType, ContextType>;
  currentEndVestingTask?: Resolver<Maybe<ResolversTypes['Task']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type VestingClaimedEventResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['VestingClaimedEvent'] = ResolversParentTypes['VestingClaimedEvent']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  blockNumber?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  logIndex?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  order?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  addresses?: Resolver<Array<ResolversTypes['Bytes']>, ParentType, ContextType>;
  timestamp?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  transactionHash?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  gasPrice?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  superToken?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  sender?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  receiver?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  claimer?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type VestingCliffAndFlowExecutedEventResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['VestingCliffAndFlowExecutedEvent'] = ResolversParentTypes['VestingCliffAndFlowExecutedEvent']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  blockNumber?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  logIndex?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  order?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  addresses?: Resolver<Array<ResolversTypes['Bytes']>, ParentType, ContextType>;
  timestamp?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  transactionHash?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  gasPrice?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  gasUsed?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  superToken?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  sender?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  receiver?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  cliffAndFlowDate?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  flowRate?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  cliffAmount?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  flowDelayCompensation?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type VestingEndExecutedEventResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['VestingEndExecutedEvent'] = ResolversParentTypes['VestingEndExecutedEvent']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  blockNumber?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  logIndex?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  order?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  addresses?: Resolver<Array<ResolversTypes['Bytes']>, ParentType, ContextType>;
  timestamp?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  transactionHash?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  gasPrice?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  gasUsed?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  superToken?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  sender?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  receiver?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  endDate?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  earlyEndCompensation?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  didCompensationFail?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type VestingEndFailedEventResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['VestingEndFailedEvent'] = ResolversParentTypes['VestingEndFailedEvent']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  blockNumber?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  logIndex?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  order?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  addresses?: Resolver<Array<ResolversTypes['Bytes']>, ParentType, ContextType>;
  timestamp?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  transactionHash?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  gasPrice?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  gasUsed?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  superToken?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  sender?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  receiver?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  endDate?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type VestingScheduleResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['VestingSchedule'] = ResolversParentTypes['VestingSchedule']> = ResolversObject<{
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  contractVersion?: Resolver<ResolversTypes['ContractVersion'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  superToken?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  sender?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  receiver?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  startDate?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  endDate?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  cliffDate?: Resolver<Maybe<ResolversTypes['BigInt']>, ParentType, ContextType>;
  cliffAndFlowDate?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  cliffAmount?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  flowRate?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  didEarlyEndCompensationFail?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  earlyEndCompensation?: Resolver<Maybe<ResolversTypes['BigInt']>, ParentType, ContextType>;
  cliffAndFlowExpirationAt?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  endDateValidAt?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  deletedAt?: Resolver<Maybe<ResolversTypes['BigInt']>, ParentType, ContextType>;
  failedAt?: Resolver<Maybe<ResolversTypes['BigInt']>, ParentType, ContextType>;
  cliffAndFlowExecutedAt?: Resolver<Maybe<ResolversTypes['BigInt']>, ParentType, ContextType>;
  endExecutedAt?: Resolver<Maybe<ResolversTypes['BigInt']>, ParentType, ContextType>;
  tasks?: Resolver<Array<ResolversTypes['Task']>, ParentType, ContextType, RequireFields<VestingScheduleTasksArgs, 'skip' | 'first'>>;
  events?: Resolver<Array<ResolversTypes['Event']>, ParentType, ContextType, RequireFields<VestingScheduleEventsArgs, 'skip' | 'first'>>;
  claimValidityDate?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  claimedAt?: Resolver<Maybe<ResolversTypes['BigInt']>, ParentType, ContextType>;
  remainderAmount?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type VestingScheduleCreatedEventResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['VestingScheduleCreatedEvent'] = ResolversParentTypes['VestingScheduleCreatedEvent']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  blockNumber?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  logIndex?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  order?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  addresses?: Resolver<Array<ResolversTypes['Bytes']>, ParentType, ContextType>;
  timestamp?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  transactionHash?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  gasPrice?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  superToken?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  sender?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  receiver?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  startDate?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  cliffDate?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  flowRate?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  endDate?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  cliffAmount?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  claimValidityDate?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  remainderAmount?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type VestingScheduleDeletedEventResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['VestingScheduleDeletedEvent'] = ResolversParentTypes['VestingScheduleDeletedEvent']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  blockNumber?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  logIndex?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  order?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  addresses?: Resolver<Array<ResolversTypes['Bytes']>, ParentType, ContextType>;
  timestamp?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  transactionHash?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  gasPrice?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  superToken?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  sender?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  receiver?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type VestingScheduleUpdatedEventResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['VestingScheduleUpdatedEvent'] = ResolversParentTypes['VestingScheduleUpdatedEvent']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  blockNumber?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  logIndex?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  order?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  addresses?: Resolver<Array<ResolversTypes['Bytes']>, ParentType, ContextType>;
  timestamp?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  transactionHash?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  gasPrice?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  superToken?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  sender?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  receiver?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  oldEndDate?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  endDate?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  remainderAmount?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type _Block_Resolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['_Block_'] = ResolversParentTypes['_Block_']> = ResolversObject<{
  hash?: Resolver<Maybe<ResolversTypes['Bytes']>, ParentType, ContextType>;
  number?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  timestamp?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  parentHash?: Resolver<Maybe<ResolversTypes['Bytes']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type _Meta_Resolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['_Meta_'] = ResolversParentTypes['_Meta_']> = ResolversObject<{
  block?: Resolver<ResolversTypes['_Block_'], ParentType, ContextType>;
  deployment?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  hasIndexingErrors?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type Resolvers<ContextType = MeshContext> = ResolversObject<{
  BigDecimal?: GraphQLScalarType;
  BigInt?: GraphQLScalarType;
  Bytes?: GraphQLScalarType;
  Event?: EventResolvers<ContextType>;
  Int8?: GraphQLScalarType;
  Query?: QueryResolvers<ContextType>;
  Subscription?: SubscriptionResolvers<ContextType>;
  Task?: TaskResolvers<ContextType>;
  Timestamp?: GraphQLScalarType;
  TokenSenderReceiverCursor?: TokenSenderReceiverCursorResolvers<ContextType>;
  VestingClaimedEvent?: VestingClaimedEventResolvers<ContextType>;
  VestingCliffAndFlowExecutedEvent?: VestingCliffAndFlowExecutedEventResolvers<ContextType>;
  VestingEndExecutedEvent?: VestingEndExecutedEventResolvers<ContextType>;
  VestingEndFailedEvent?: VestingEndFailedEventResolvers<ContextType>;
  VestingSchedule?: VestingScheduleResolvers<ContextType>;
  VestingScheduleCreatedEvent?: VestingScheduleCreatedEventResolvers<ContextType>;
  VestingScheduleDeletedEvent?: VestingScheduleDeletedEventResolvers<ContextType>;
  VestingScheduleUpdatedEvent?: VestingScheduleUpdatedEventResolvers<ContextType>;
  _Block_?: _Block_Resolvers<ContextType>;
  _Meta_?: _Meta_Resolvers<ContextType>;
}>;

export type DirectiveResolvers<ContextType = MeshContext> = ResolversObject<{
  entity?: EntityDirectiveResolver<any, any, ContextType>;
  subgraphId?: SubgraphIdDirectiveResolver<any, any, ContextType>;
  derivedFrom?: DerivedFromDirectiveResolver<any, any, ContextType>;
}>;

export type MeshContext = VestingTypes.Context & BaseMeshContext;


import { fileURLToPath } from '@graphql-mesh/utils';
const baseDir = pathModule.join(pathModule.dirname(fileURLToPath(import.meta.url)), '..');

const importFn: ImportFn = <T>(moduleId: string) => {
  const relativeModuleId = (pathModule.isAbsolute(moduleId) ? pathModule.relative(baseDir, moduleId) : moduleId).split('\\').join('/').replace(baseDir + '/', '');
  switch(relativeModuleId) {
    case ".graphclient/sources/vesting/introspectionSchema":
      return Promise.resolve(importedModule$0) as T;
    
    default:
      return Promise.reject(new Error(`Cannot find module '${relativeModuleId}'.`));
  }
};

const rootStore = new MeshStore('.graphclient', new FsStoreStorageAdapter({
  cwd: baseDir,
  importFn,
  fileType: "ts",
}), {
  readonly: true,
  validate: false
});

export const rawServeConfig: YamlConfig.Config['serve'] = undefined as any
export async function getMeshOptions(): Promise<GetMeshOptions> {
const pubsub = new PubSub();
const sourcesStore = rootStore.child('sources');
const logger = new DefaultLogger("GraphClient");
const cache = new (MeshCache as any)({
      ...({} as any),
      importFn,
      store: rootStore.child('cache'),
      pubsub,
      logger,
    } as any)

const sources: MeshResolvedSource[] = [];
const transforms: MeshTransform[] = [];
const additionalEnvelopPlugins: MeshPlugin<any>[] = [];
const vestingTransforms = [];
const additionalTypeDefs = [] as any[];
const vestingHandler = new GraphqlHandler({
              name: "vesting",
              config: {"endpoint":"{context.url:https://subgraph-endpoints.superfluid.dev/optimism-sepolia/vesting-scheduler}","retry":5},
              baseDir,
              cache,
              pubsub,
              store: sourcesStore.child("vesting"),
              logger: logger.child("vesting"),
              importFn,
            });
sources[0] = {
          name: 'vesting',
          handler: vestingHandler,
          transforms: vestingTransforms
        }
const additionalResolvers = [] as any[]
const merger = new(BareMerger as any)({
        cache,
        pubsub,
        logger: logger.child('bareMerger'),
        store: rootStore.child('bareMerger')
      })

  return {
    sources,
    transforms,
    additionalTypeDefs,
    additionalResolvers,
    cache,
    pubsub,
    merger,
    logger,
    additionalEnvelopPlugins,
    get documents() {
      return [
      {
        document: PollDocument,
        get rawSDL() {
          return printWithCache(PollDocument);
        },
        location: 'PollDocument.graphql'
      },{
        document: GetVestingScheduleDocument,
        get rawSDL() {
          return printWithCache(GetVestingScheduleDocument);
        },
        location: 'GetVestingScheduleDocument.graphql'
      },{
        document: GetVestingSchedulesDocument,
        get rawSDL() {
          return printWithCache(GetVestingSchedulesDocument);
        },
        location: 'GetVestingSchedulesDocument.graphql'
      }
    ];
    },
    fetchFn,
  };
}

export function createBuiltMeshHTTPHandler<TServerContext = {}>(): MeshHTTPHandler<TServerContext> {
  return createMeshHTTPHandler<TServerContext>({
    baseDir,
    getBuiltMesh: getBuiltGraphClient,
    rawServeConfig: undefined,
  })
}


let meshInstance$: Promise<MeshInstance> | undefined;

export function getBuiltGraphClient(): Promise<MeshInstance> {
  if (meshInstance$ == null) {
    meshInstance$ = getMeshOptions().then(meshOptions => getMesh(meshOptions)).then(mesh => {
      const id = mesh.pubsub.subscribe('destroy', () => {
        meshInstance$ = undefined;
        mesh.pubsub.unsubscribe(id);
      });
      return mesh;
    });
  }
  return meshInstance$;
}

export const execute: ExecuteMeshFn = (...args) => getBuiltGraphClient().then(({ execute }) => execute(...args));

export const subscribe: SubscribeMeshFn = (...args) => getBuiltGraphClient().then(({ subscribe }) => subscribe(...args));
export function getBuiltGraphSDK<TGlobalContext = any, TOperationContext = any>(globalContext?: TGlobalContext) {
  const sdkRequester$ = getBuiltGraphClient().then(({ sdkRequesterFactory }) => sdkRequesterFactory(globalContext));
  return getSdk<TOperationContext, TGlobalContext>((...args) => sdkRequester$.then(sdkRequester => sdkRequester(...args)));
}
export type PollQueryVariables = Exact<{
  block: Block_Height;
}>;


export type PollQuery = { events: Array<Pick<VestingClaimedEvent, 'order'> | Pick<VestingCliffAndFlowExecutedEvent, 'order'> | Pick<VestingEndExecutedEvent, 'order'> | Pick<VestingEndFailedEvent, 'order'> | Pick<VestingScheduleCreatedEvent, 'order'> | Pick<VestingScheduleDeletedEvent, 'order'> | Pick<VestingScheduleUpdatedEvent, 'order'>> };

export type GetVestingScheduleQueryVariables = Exact<{
  id: Scalars['ID'];
}>;


export type GetVestingScheduleQuery = { vestingSchedule?: Maybe<Pick<VestingSchedule, 'id' | 'superToken' | 'sender' | 'receiver' | 'flowRate' | 'createdAt' | 'deletedAt' | 'startDate' | 'claimedAt' | 'cliffDate' | 'cliffAndFlowExecutedAt' | 'cliffAndFlowExpirationAt' | 'cliffAndFlowDate' | 'cliffAmount' | 'endDate' | 'endDateValidAt' | 'endExecutedAt' | 'failedAt' | 'didEarlyEndCompensationFail' | 'earlyEndCompensation' | 'claimValidityDate' | 'remainderAmount' | 'contractVersion'>> };

export type GetVestingSchedulesQueryVariables = Exact<{
  where?: InputMaybe<VestingSchedule_Filter>;
  orderBy?: InputMaybe<VestingSchedule_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
}>;


export type GetVestingSchedulesQuery = { vestingSchedules: Array<Pick<VestingSchedule, 'id' | 'superToken' | 'sender' | 'receiver' | 'flowRate' | 'createdAt' | 'deletedAt' | 'startDate' | 'claimedAt' | 'cliffDate' | 'cliffAndFlowExecutedAt' | 'cliffAndFlowExpirationAt' | 'cliffAndFlowDate' | 'cliffAmount' | 'endDate' | 'endDateValidAt' | 'endExecutedAt' | 'failedAt' | 'didEarlyEndCompensationFail' | 'earlyEndCompensation' | 'claimValidityDate' | 'remainderAmount' | 'contractVersion'>> };

export type VestingSchedulePartFragment = Pick<VestingSchedule, 'id' | 'superToken' | 'sender' | 'receiver' | 'flowRate' | 'createdAt' | 'deletedAt' | 'startDate' | 'claimedAt' | 'cliffDate' | 'cliffAndFlowExecutedAt' | 'cliffAndFlowExpirationAt' | 'cliffAndFlowDate' | 'cliffAmount' | 'endDate' | 'endDateValidAt' | 'endExecutedAt' | 'failedAt' | 'didEarlyEndCompensationFail' | 'earlyEndCompensation' | 'claimValidityDate' | 'remainderAmount' | 'contractVersion'>;

export const VestingSchedulePartFragmentDoc = gql`
    fragment VestingSchedulePart on VestingSchedule {
  id
  superToken
  sender
  receiver
  flowRate
  createdAt
  deletedAt
  startDate
  claimedAt
  cliffDate
  cliffAndFlowExecutedAt
  cliffAndFlowExpirationAt
  cliffAndFlowDate
  cliffAmount
  endDate
  endDateValidAt
  endExecutedAt
  failedAt
  didEarlyEndCompensationFail
  earlyEndCompensation
  claimValidityDate
  remainderAmount
  contractVersion
}
    ` as unknown as DocumentNode<VestingSchedulePartFragment, unknown>;
export const PollDocument = gql`
    query poll($block: Block_height!) {
  events(block: $block, first: 1) {
    order
  }
}
    ` as unknown as DocumentNode<PollQuery, PollQueryVariables>;
export const GetVestingScheduleDocument = gql`
    query getVestingSchedule($id: ID!) {
  vestingSchedule(id: $id) {
    ...VestingSchedulePart
  }
}
    ${VestingSchedulePartFragmentDoc}` as unknown as DocumentNode<GetVestingScheduleQuery, GetVestingScheduleQueryVariables>;
export const GetVestingSchedulesDocument = gql`
    query getVestingSchedules($where: VestingSchedule_filter = {}, $orderBy: VestingSchedule_orderBy = id, $orderDirection: OrderDirection = asc) {
  vestingSchedules(
    first: 1000
    where: $where
    orderBy: $orderBy
    orderDirection: $orderDirection
  ) {
    ...VestingSchedulePart
  }
}
    ${VestingSchedulePartFragmentDoc}` as unknown as DocumentNode<GetVestingSchedulesQuery, GetVestingSchedulesQueryVariables>;




export type Requester<C = {}, E = unknown> = <R, V>(doc: DocumentNode, vars?: V, options?: C) => Promise<R> | AsyncIterable<R>
export function getSdk<C, E>(requester: Requester<C, E>) {
  return {
    poll(variables: PollQueryVariables, options?: C): Promise<PollQuery> {
      return requester<PollQuery, PollQueryVariables>(PollDocument, variables, options) as Promise<PollQuery>;
    },
    getVestingSchedule(variables: GetVestingScheduleQueryVariables, options?: C): Promise<GetVestingScheduleQuery> {
      return requester<GetVestingScheduleQuery, GetVestingScheduleQueryVariables>(GetVestingScheduleDocument, variables, options) as Promise<GetVestingScheduleQuery>;
    },
    getVestingSchedules(variables?: GetVestingSchedulesQueryVariables, options?: C): Promise<GetVestingSchedulesQuery> {
      return requester<GetVestingSchedulesQuery, GetVestingSchedulesQueryVariables>(GetVestingSchedulesDocument, variables, options) as Promise<GetVestingSchedulesQuery>;
    }
  };
}
export type Sdk = ReturnType<typeof getSdk>;