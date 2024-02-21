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
import type { AutowrapTypes } from './sources/autowrap/types';
import * as importedModule$0 from "./sources/autowrap/introspectionSchema";
export type Maybe<T> = T | null | undefined;
export type InputMaybe<T> = T | null | undefined;
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
};

export type AddedApprovedStrategyEvent = Event & {
  id: Scalars['ID'];
  blockNumber: Scalars['BigInt'];
  logIndex: Scalars['BigInt'];
  order: Scalars['BigInt'];
  name: Scalars['String'];
  /**
   * Holds the addresses for strategy.
   *
   */
  addresses: Array<Scalars['Bytes']>;
  timestamp: Scalars['BigInt'];
  transactionHash: Scalars['Bytes'];
  gasPrice: Scalars['BigInt'];
  strategy: Scalars['Bytes'];
};

export type AddedApprovedStrategyEvent_Filter = {
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
  strategy?: InputMaybe<Scalars['Bytes']>;
  strategy_not?: InputMaybe<Scalars['Bytes']>;
  strategy_gt?: InputMaybe<Scalars['Bytes']>;
  strategy_lt?: InputMaybe<Scalars['Bytes']>;
  strategy_gte?: InputMaybe<Scalars['Bytes']>;
  strategy_lte?: InputMaybe<Scalars['Bytes']>;
  strategy_in?: InputMaybe<Array<Scalars['Bytes']>>;
  strategy_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  strategy_contains?: InputMaybe<Scalars['Bytes']>;
  strategy_not_contains?: InputMaybe<Scalars['Bytes']>;
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<AddedApprovedStrategyEvent_Filter>>>;
  or?: InputMaybe<Array<InputMaybe<AddedApprovedStrategyEvent_Filter>>>;
};

export type AddedApprovedStrategyEvent_OrderBy =
  | 'id'
  | 'blockNumber'
  | 'logIndex'
  | 'order'
  | 'name'
  | 'addresses'
  | 'timestamp'
  | 'transactionHash'
  | 'gasPrice'
  | 'strategy';

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

export type LimitsChangedEvent = Event & {
  id: Scalars['ID'];
  blockNumber: Scalars['BigInt'];
  logIndex: Scalars['BigInt'];
  order: Scalars['BigInt'];
  name: Scalars['String'];
  /**
   * Holds the addresses for manager.
   *
   */
  addresses: Array<Scalars['Bytes']>;
  timestamp: Scalars['BigInt'];
  transactionHash: Scalars['Bytes'];
  gasPrice: Scalars['BigInt'];
  upperLimit: Scalars['BigInt'];
  lowerLimit: Scalars['BigInt'];
};

export type LimitsChangedEvent_Filter = {
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
  upperLimit?: InputMaybe<Scalars['BigInt']>;
  upperLimit_not?: InputMaybe<Scalars['BigInt']>;
  upperLimit_gt?: InputMaybe<Scalars['BigInt']>;
  upperLimit_lt?: InputMaybe<Scalars['BigInt']>;
  upperLimit_gte?: InputMaybe<Scalars['BigInt']>;
  upperLimit_lte?: InputMaybe<Scalars['BigInt']>;
  upperLimit_in?: InputMaybe<Array<Scalars['BigInt']>>;
  upperLimit_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  lowerLimit?: InputMaybe<Scalars['BigInt']>;
  lowerLimit_not?: InputMaybe<Scalars['BigInt']>;
  lowerLimit_gt?: InputMaybe<Scalars['BigInt']>;
  lowerLimit_lt?: InputMaybe<Scalars['BigInt']>;
  lowerLimit_gte?: InputMaybe<Scalars['BigInt']>;
  lowerLimit_lte?: InputMaybe<Scalars['BigInt']>;
  lowerLimit_in?: InputMaybe<Array<Scalars['BigInt']>>;
  lowerLimit_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<LimitsChangedEvent_Filter>>>;
  or?: InputMaybe<Array<InputMaybe<LimitsChangedEvent_Filter>>>;
};

export type LimitsChangedEvent_OrderBy =
  | 'id'
  | 'blockNumber'
  | 'logIndex'
  | 'order'
  | 'name'
  | 'addresses'
  | 'timestamp'
  | 'transactionHash'
  | 'gasPrice'
  | 'upperLimit'
  | 'lowerLimit';

/** Defines the order direction, either ascending or descending */
export type OrderDirection =
  | 'asc'
  | 'desc';

export type Query = {
  addedApprovedStrategyEvent?: Maybe<AddedApprovedStrategyEvent>;
  addedApprovedStrategyEvents: Array<AddedApprovedStrategyEvent>;
  removedApprovedStrategyEvent?: Maybe<RemovedApprovedStrategyEvent>;
  removedApprovedStrategyEvents: Array<RemovedApprovedStrategyEvent>;
  limitsChangedEvent?: Maybe<LimitsChangedEvent>;
  limitsChangedEvents: Array<LimitsChangedEvent>;
  wrapExecutedEvent?: Maybe<WrapExecutedEvent>;
  wrapExecutedEvents: Array<WrapExecutedEvent>;
  wrapScheduleCreatedEvent?: Maybe<WrapScheduleCreatedEvent>;
  wrapScheduleCreatedEvents: Array<WrapScheduleCreatedEvent>;
  wrapScheduleDeletedEvent?: Maybe<WrapScheduleDeletedEvent>;
  wrapScheduleDeletedEvents: Array<WrapScheduleDeletedEvent>;
  wrapSchedule?: Maybe<WrapSchedule>;
  wrapSchedules: Array<WrapSchedule>;
  userTokenLiquidityToken?: Maybe<UserTokenLiquidityToken>;
  userTokenLiquidityTokens: Array<UserTokenLiquidityToken>;
  event?: Maybe<Event>;
  events: Array<Event>;
  /** Access to subgraph metadata */
  _meta?: Maybe<_Meta_>;
};


export type QueryAddedApprovedStrategyEventArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_Height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryAddedApprovedStrategyEventsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<AddedApprovedStrategyEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<AddedApprovedStrategyEvent_Filter>;
  block?: InputMaybe<Block_Height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryRemovedApprovedStrategyEventArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_Height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryRemovedApprovedStrategyEventsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<RemovedApprovedStrategyEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<RemovedApprovedStrategyEvent_Filter>;
  block?: InputMaybe<Block_Height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryLimitsChangedEventArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_Height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryLimitsChangedEventsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<LimitsChangedEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<LimitsChangedEvent_Filter>;
  block?: InputMaybe<Block_Height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryWrapExecutedEventArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_Height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryWrapExecutedEventsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<WrapExecutedEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<WrapExecutedEvent_Filter>;
  block?: InputMaybe<Block_Height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryWrapScheduleCreatedEventArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_Height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryWrapScheduleCreatedEventsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<WrapScheduleCreatedEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<WrapScheduleCreatedEvent_Filter>;
  block?: InputMaybe<Block_Height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryWrapScheduleDeletedEventArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_Height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryWrapScheduleDeletedEventsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<WrapScheduleDeletedEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<WrapScheduleDeletedEvent_Filter>;
  block?: InputMaybe<Block_Height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryWrapScheduleArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_Height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryWrapSchedulesArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<WrapSchedule_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<WrapSchedule_Filter>;
  block?: InputMaybe<Block_Height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryUserTokenLiquidityTokenArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_Height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryUserTokenLiquidityTokensArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<UserTokenLiquidityToken_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<UserTokenLiquidityToken_Filter>;
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

export type RemovedApprovedStrategyEvent = Event & {
  id: Scalars['ID'];
  blockNumber: Scalars['BigInt'];
  logIndex: Scalars['BigInt'];
  order: Scalars['BigInt'];
  name: Scalars['String'];
  /**
   * Holds the addresses for strategy.
   *
   */
  addresses: Array<Scalars['Bytes']>;
  timestamp: Scalars['BigInt'];
  transactionHash: Scalars['Bytes'];
  gasPrice: Scalars['BigInt'];
  strategy: Scalars['Bytes'];
};

export type RemovedApprovedStrategyEvent_Filter = {
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
  strategy?: InputMaybe<Scalars['Bytes']>;
  strategy_not?: InputMaybe<Scalars['Bytes']>;
  strategy_gt?: InputMaybe<Scalars['Bytes']>;
  strategy_lt?: InputMaybe<Scalars['Bytes']>;
  strategy_gte?: InputMaybe<Scalars['Bytes']>;
  strategy_lte?: InputMaybe<Scalars['Bytes']>;
  strategy_in?: InputMaybe<Array<Scalars['Bytes']>>;
  strategy_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  strategy_contains?: InputMaybe<Scalars['Bytes']>;
  strategy_not_contains?: InputMaybe<Scalars['Bytes']>;
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<RemovedApprovedStrategyEvent_Filter>>>;
  or?: InputMaybe<Array<InputMaybe<RemovedApprovedStrategyEvent_Filter>>>;
};

export type RemovedApprovedStrategyEvent_OrderBy =
  | 'id'
  | 'blockNumber'
  | 'logIndex'
  | 'order'
  | 'name'
  | 'addresses'
  | 'timestamp'
  | 'transactionHash'
  | 'gasPrice'
  | 'strategy';

export type Subscription = {
  addedApprovedStrategyEvent?: Maybe<AddedApprovedStrategyEvent>;
  addedApprovedStrategyEvents: Array<AddedApprovedStrategyEvent>;
  removedApprovedStrategyEvent?: Maybe<RemovedApprovedStrategyEvent>;
  removedApprovedStrategyEvents: Array<RemovedApprovedStrategyEvent>;
  limitsChangedEvent?: Maybe<LimitsChangedEvent>;
  limitsChangedEvents: Array<LimitsChangedEvent>;
  wrapExecutedEvent?: Maybe<WrapExecutedEvent>;
  wrapExecutedEvents: Array<WrapExecutedEvent>;
  wrapScheduleCreatedEvent?: Maybe<WrapScheduleCreatedEvent>;
  wrapScheduleCreatedEvents: Array<WrapScheduleCreatedEvent>;
  wrapScheduleDeletedEvent?: Maybe<WrapScheduleDeletedEvent>;
  wrapScheduleDeletedEvents: Array<WrapScheduleDeletedEvent>;
  wrapSchedule?: Maybe<WrapSchedule>;
  wrapSchedules: Array<WrapSchedule>;
  userTokenLiquidityToken?: Maybe<UserTokenLiquidityToken>;
  userTokenLiquidityTokens: Array<UserTokenLiquidityToken>;
  event?: Maybe<Event>;
  events: Array<Event>;
  /** Access to subgraph metadata */
  _meta?: Maybe<_Meta_>;
};


export type SubscriptionAddedApprovedStrategyEventArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_Height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionAddedApprovedStrategyEventsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<AddedApprovedStrategyEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<AddedApprovedStrategyEvent_Filter>;
  block?: InputMaybe<Block_Height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionRemovedApprovedStrategyEventArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_Height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionRemovedApprovedStrategyEventsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<RemovedApprovedStrategyEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<RemovedApprovedStrategyEvent_Filter>;
  block?: InputMaybe<Block_Height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionLimitsChangedEventArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_Height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionLimitsChangedEventsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<LimitsChangedEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<LimitsChangedEvent_Filter>;
  block?: InputMaybe<Block_Height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionWrapExecutedEventArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_Height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionWrapExecutedEventsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<WrapExecutedEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<WrapExecutedEvent_Filter>;
  block?: InputMaybe<Block_Height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionWrapScheduleCreatedEventArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_Height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionWrapScheduleCreatedEventsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<WrapScheduleCreatedEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<WrapScheduleCreatedEvent_Filter>;
  block?: InputMaybe<Block_Height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionWrapScheduleDeletedEventArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_Height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionWrapScheduleDeletedEventsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<WrapScheduleDeletedEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<WrapScheduleDeletedEvent_Filter>;
  block?: InputMaybe<Block_Height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionWrapScheduleArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_Height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionWrapSchedulesArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<WrapSchedule_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<WrapSchedule_Filter>;
  block?: InputMaybe<Block_Height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionUserTokenLiquidityTokenArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_Height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionUserTokenLiquidityTokensArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<UserTokenLiquidityToken_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<UserTokenLiquidityToken_Filter>;
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

export type UserTokenLiquidityToken = {
  id: Scalars['String'];
  currentWrapSchedule?: Maybe<WrapSchedule>;
};

export type UserTokenLiquidityToken_Filter = {
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
  currentWrapSchedule?: InputMaybe<Scalars['String']>;
  currentWrapSchedule_not?: InputMaybe<Scalars['String']>;
  currentWrapSchedule_gt?: InputMaybe<Scalars['String']>;
  currentWrapSchedule_lt?: InputMaybe<Scalars['String']>;
  currentWrapSchedule_gte?: InputMaybe<Scalars['String']>;
  currentWrapSchedule_lte?: InputMaybe<Scalars['String']>;
  currentWrapSchedule_in?: InputMaybe<Array<Scalars['String']>>;
  currentWrapSchedule_not_in?: InputMaybe<Array<Scalars['String']>>;
  currentWrapSchedule_contains?: InputMaybe<Scalars['String']>;
  currentWrapSchedule_contains_nocase?: InputMaybe<Scalars['String']>;
  currentWrapSchedule_not_contains?: InputMaybe<Scalars['String']>;
  currentWrapSchedule_not_contains_nocase?: InputMaybe<Scalars['String']>;
  currentWrapSchedule_starts_with?: InputMaybe<Scalars['String']>;
  currentWrapSchedule_starts_with_nocase?: InputMaybe<Scalars['String']>;
  currentWrapSchedule_not_starts_with?: InputMaybe<Scalars['String']>;
  currentWrapSchedule_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  currentWrapSchedule_ends_with?: InputMaybe<Scalars['String']>;
  currentWrapSchedule_ends_with_nocase?: InputMaybe<Scalars['String']>;
  currentWrapSchedule_not_ends_with?: InputMaybe<Scalars['String']>;
  currentWrapSchedule_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  currentWrapSchedule_?: InputMaybe<WrapSchedule_Filter>;
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<UserTokenLiquidityToken_Filter>>>;
  or?: InputMaybe<Array<InputMaybe<UserTokenLiquidityToken_Filter>>>;
};

export type UserTokenLiquidityToken_OrderBy =
  | 'id'
  | 'currentWrapSchedule'
  | 'currentWrapSchedule__id'
  | 'currentWrapSchedule__wrapScheduleId'
  | 'currentWrapSchedule__deletedAt'
  | 'currentWrapSchedule__createdAt'
  | 'currentWrapSchedule__createdBlockNumber'
  | 'currentWrapSchedule__updatedBlockNumber'
  | 'currentWrapSchedule__updatedAt'
  | 'currentWrapSchedule__expiredAt'
  | 'currentWrapSchedule__strategy'
  | 'currentWrapSchedule__manager'
  | 'currentWrapSchedule__account'
  | 'currentWrapSchedule__liquidityToken'
  | 'currentWrapSchedule__superToken'
  | 'currentWrapSchedule__lowerLimit'
  | 'currentWrapSchedule__upperLimit'
  | 'currentWrapSchedule__lastExecutedAt'
  | 'currentWrapSchedule__amount'
  | 'currentWrapSchedule__isActive';

export type WrapExecutedEvent = Event & {
  id: Scalars['ID'];
  blockNumber: Scalars['BigInt'];
  logIndex: Scalars['BigInt'];
  order: Scalars['BigInt'];
  name: Scalars['String'];
  /**
   * Holds the hex id.
   *
   */
  addresses: Array<Scalars['Bytes']>;
  timestamp: Scalars['BigInt'];
  transactionHash: Scalars['Bytes'];
  gasPrice: Scalars['BigInt'];
  amount: Scalars['BigInt'];
  wrapScheduleId: Scalars['Bytes'];
};

export type WrapExecutedEvent_Filter = {
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
  amount?: InputMaybe<Scalars['BigInt']>;
  amount_not?: InputMaybe<Scalars['BigInt']>;
  amount_gt?: InputMaybe<Scalars['BigInt']>;
  amount_lt?: InputMaybe<Scalars['BigInt']>;
  amount_gte?: InputMaybe<Scalars['BigInt']>;
  amount_lte?: InputMaybe<Scalars['BigInt']>;
  amount_in?: InputMaybe<Array<Scalars['BigInt']>>;
  amount_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  wrapScheduleId?: InputMaybe<Scalars['Bytes']>;
  wrapScheduleId_not?: InputMaybe<Scalars['Bytes']>;
  wrapScheduleId_gt?: InputMaybe<Scalars['Bytes']>;
  wrapScheduleId_lt?: InputMaybe<Scalars['Bytes']>;
  wrapScheduleId_gte?: InputMaybe<Scalars['Bytes']>;
  wrapScheduleId_lte?: InputMaybe<Scalars['Bytes']>;
  wrapScheduleId_in?: InputMaybe<Array<Scalars['Bytes']>>;
  wrapScheduleId_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  wrapScheduleId_contains?: InputMaybe<Scalars['Bytes']>;
  wrapScheduleId_not_contains?: InputMaybe<Scalars['Bytes']>;
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<WrapExecutedEvent_Filter>>>;
  or?: InputMaybe<Array<InputMaybe<WrapExecutedEvent_Filter>>>;
};

export type WrapExecutedEvent_OrderBy =
  | 'id'
  | 'blockNumber'
  | 'logIndex'
  | 'order'
  | 'name'
  | 'addresses'
  | 'timestamp'
  | 'transactionHash'
  | 'gasPrice'
  | 'amount'
  | 'wrapScheduleId';

export type WrapSchedule = {
  id: Scalars['String'];
  wrapScheduleId: Scalars['Bytes'];
  deletedAt?: Maybe<Scalars['BigInt']>;
  createdAt?: Maybe<Scalars['BigInt']>;
  createdBlockNumber: Scalars['BigInt'];
  updatedBlockNumber: Scalars['BigInt'];
  updatedAt?: Maybe<Scalars['BigInt']>;
  expiredAt?: Maybe<Scalars['BigInt']>;
  strategy: Scalars['Bytes'];
  manager: Scalars['Bytes'];
  account: Scalars['Bytes'];
  liquidityToken: Scalars['Bytes'];
  superToken: Scalars['Bytes'];
  lowerLimit?: Maybe<Scalars['BigInt']>;
  upperLimit?: Maybe<Scalars['BigInt']>;
  lastExecutedAt?: Maybe<Scalars['BigInt']>;
  amount?: Maybe<Scalars['BigInt']>;
  isActive?: Maybe<Scalars['Boolean']>;
  events: Array<Event>;
};


export type WrapScheduleEventsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Event_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<Event_Filter>;
};

export type WrapScheduleCreatedEvent = Event & {
  id: Scalars['ID'];
  blockNumber: Scalars['BigInt'];
  logIndex: Scalars['BigInt'];
  order: Scalars['BigInt'];
  name: Scalars['String'];
  /**
   * Holds the addresses for superToken, liquidityToken, strategy and account.
   *
   */
  addresses: Array<Scalars['Bytes']>;
  timestamp: Scalars['BigInt'];
  transactionHash: Scalars['Bytes'];
  gasPrice: Scalars['BigInt'];
  account: Scalars['Bytes'];
  superToken: Scalars['Bytes'];
  strategy: Scalars['Bytes'];
  liquidityToken: Scalars['Bytes'];
  expiry: Scalars['BigInt'];
  lowerLimit?: Maybe<Scalars['BigInt']>;
  upperLimit?: Maybe<Scalars['BigInt']>;
  wrapScheduleId: Scalars['Bytes'];
};

export type WrapScheduleCreatedEvent_Filter = {
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
  account?: InputMaybe<Scalars['Bytes']>;
  account_not?: InputMaybe<Scalars['Bytes']>;
  account_gt?: InputMaybe<Scalars['Bytes']>;
  account_lt?: InputMaybe<Scalars['Bytes']>;
  account_gte?: InputMaybe<Scalars['Bytes']>;
  account_lte?: InputMaybe<Scalars['Bytes']>;
  account_in?: InputMaybe<Array<Scalars['Bytes']>>;
  account_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  account_contains?: InputMaybe<Scalars['Bytes']>;
  account_not_contains?: InputMaybe<Scalars['Bytes']>;
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
  strategy?: InputMaybe<Scalars['Bytes']>;
  strategy_not?: InputMaybe<Scalars['Bytes']>;
  strategy_gt?: InputMaybe<Scalars['Bytes']>;
  strategy_lt?: InputMaybe<Scalars['Bytes']>;
  strategy_gte?: InputMaybe<Scalars['Bytes']>;
  strategy_lte?: InputMaybe<Scalars['Bytes']>;
  strategy_in?: InputMaybe<Array<Scalars['Bytes']>>;
  strategy_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  strategy_contains?: InputMaybe<Scalars['Bytes']>;
  strategy_not_contains?: InputMaybe<Scalars['Bytes']>;
  liquidityToken?: InputMaybe<Scalars['Bytes']>;
  liquidityToken_not?: InputMaybe<Scalars['Bytes']>;
  liquidityToken_gt?: InputMaybe<Scalars['Bytes']>;
  liquidityToken_lt?: InputMaybe<Scalars['Bytes']>;
  liquidityToken_gte?: InputMaybe<Scalars['Bytes']>;
  liquidityToken_lte?: InputMaybe<Scalars['Bytes']>;
  liquidityToken_in?: InputMaybe<Array<Scalars['Bytes']>>;
  liquidityToken_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  liquidityToken_contains?: InputMaybe<Scalars['Bytes']>;
  liquidityToken_not_contains?: InputMaybe<Scalars['Bytes']>;
  expiry?: InputMaybe<Scalars['BigInt']>;
  expiry_not?: InputMaybe<Scalars['BigInt']>;
  expiry_gt?: InputMaybe<Scalars['BigInt']>;
  expiry_lt?: InputMaybe<Scalars['BigInt']>;
  expiry_gte?: InputMaybe<Scalars['BigInt']>;
  expiry_lte?: InputMaybe<Scalars['BigInt']>;
  expiry_in?: InputMaybe<Array<Scalars['BigInt']>>;
  expiry_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  lowerLimit?: InputMaybe<Scalars['BigInt']>;
  lowerLimit_not?: InputMaybe<Scalars['BigInt']>;
  lowerLimit_gt?: InputMaybe<Scalars['BigInt']>;
  lowerLimit_lt?: InputMaybe<Scalars['BigInt']>;
  lowerLimit_gte?: InputMaybe<Scalars['BigInt']>;
  lowerLimit_lte?: InputMaybe<Scalars['BigInt']>;
  lowerLimit_in?: InputMaybe<Array<Scalars['BigInt']>>;
  lowerLimit_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  upperLimit?: InputMaybe<Scalars['BigInt']>;
  upperLimit_not?: InputMaybe<Scalars['BigInt']>;
  upperLimit_gt?: InputMaybe<Scalars['BigInt']>;
  upperLimit_lt?: InputMaybe<Scalars['BigInt']>;
  upperLimit_gte?: InputMaybe<Scalars['BigInt']>;
  upperLimit_lte?: InputMaybe<Scalars['BigInt']>;
  upperLimit_in?: InputMaybe<Array<Scalars['BigInt']>>;
  upperLimit_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  wrapScheduleId?: InputMaybe<Scalars['Bytes']>;
  wrapScheduleId_not?: InputMaybe<Scalars['Bytes']>;
  wrapScheduleId_gt?: InputMaybe<Scalars['Bytes']>;
  wrapScheduleId_lt?: InputMaybe<Scalars['Bytes']>;
  wrapScheduleId_gte?: InputMaybe<Scalars['Bytes']>;
  wrapScheduleId_lte?: InputMaybe<Scalars['Bytes']>;
  wrapScheduleId_in?: InputMaybe<Array<Scalars['Bytes']>>;
  wrapScheduleId_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  wrapScheduleId_contains?: InputMaybe<Scalars['Bytes']>;
  wrapScheduleId_not_contains?: InputMaybe<Scalars['Bytes']>;
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<WrapScheduleCreatedEvent_Filter>>>;
  or?: InputMaybe<Array<InputMaybe<WrapScheduleCreatedEvent_Filter>>>;
};

export type WrapScheduleCreatedEvent_OrderBy =
  | 'id'
  | 'blockNumber'
  | 'logIndex'
  | 'order'
  | 'name'
  | 'addresses'
  | 'timestamp'
  | 'transactionHash'
  | 'gasPrice'
  | 'account'
  | 'superToken'
  | 'strategy'
  | 'liquidityToken'
  | 'expiry'
  | 'lowerLimit'
  | 'upperLimit'
  | 'wrapScheduleId';

export type WrapScheduleDeletedEvent = Event & {
  id: Scalars['ID'];
  blockNumber: Scalars['BigInt'];
  logIndex: Scalars['BigInt'];
  order: Scalars['BigInt'];
  name: Scalars['String'];
  /**
   * Holds the addresses for account, strategy, liquidityToken and superToken.
   *
   */
  addresses: Array<Scalars['Bytes']>;
  timestamp: Scalars['BigInt'];
  transactionHash: Scalars['Bytes'];
  gasPrice: Scalars['BigInt'];
  account: Scalars['Bytes'];
  strategy: Scalars['Bytes'];
  superToken: Scalars['Bytes'];
  liquidityToken: Scalars['Bytes'];
  wrapScheduleId: Scalars['Bytes'];
};

export type WrapScheduleDeletedEvent_Filter = {
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
  account?: InputMaybe<Scalars['Bytes']>;
  account_not?: InputMaybe<Scalars['Bytes']>;
  account_gt?: InputMaybe<Scalars['Bytes']>;
  account_lt?: InputMaybe<Scalars['Bytes']>;
  account_gte?: InputMaybe<Scalars['Bytes']>;
  account_lte?: InputMaybe<Scalars['Bytes']>;
  account_in?: InputMaybe<Array<Scalars['Bytes']>>;
  account_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  account_contains?: InputMaybe<Scalars['Bytes']>;
  account_not_contains?: InputMaybe<Scalars['Bytes']>;
  strategy?: InputMaybe<Scalars['Bytes']>;
  strategy_not?: InputMaybe<Scalars['Bytes']>;
  strategy_gt?: InputMaybe<Scalars['Bytes']>;
  strategy_lt?: InputMaybe<Scalars['Bytes']>;
  strategy_gte?: InputMaybe<Scalars['Bytes']>;
  strategy_lte?: InputMaybe<Scalars['Bytes']>;
  strategy_in?: InputMaybe<Array<Scalars['Bytes']>>;
  strategy_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  strategy_contains?: InputMaybe<Scalars['Bytes']>;
  strategy_not_contains?: InputMaybe<Scalars['Bytes']>;
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
  liquidityToken?: InputMaybe<Scalars['Bytes']>;
  liquidityToken_not?: InputMaybe<Scalars['Bytes']>;
  liquidityToken_gt?: InputMaybe<Scalars['Bytes']>;
  liquidityToken_lt?: InputMaybe<Scalars['Bytes']>;
  liquidityToken_gte?: InputMaybe<Scalars['Bytes']>;
  liquidityToken_lte?: InputMaybe<Scalars['Bytes']>;
  liquidityToken_in?: InputMaybe<Array<Scalars['Bytes']>>;
  liquidityToken_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  liquidityToken_contains?: InputMaybe<Scalars['Bytes']>;
  liquidityToken_not_contains?: InputMaybe<Scalars['Bytes']>;
  wrapScheduleId?: InputMaybe<Scalars['Bytes']>;
  wrapScheduleId_not?: InputMaybe<Scalars['Bytes']>;
  wrapScheduleId_gt?: InputMaybe<Scalars['Bytes']>;
  wrapScheduleId_lt?: InputMaybe<Scalars['Bytes']>;
  wrapScheduleId_gte?: InputMaybe<Scalars['Bytes']>;
  wrapScheduleId_lte?: InputMaybe<Scalars['Bytes']>;
  wrapScheduleId_in?: InputMaybe<Array<Scalars['Bytes']>>;
  wrapScheduleId_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  wrapScheduleId_contains?: InputMaybe<Scalars['Bytes']>;
  wrapScheduleId_not_contains?: InputMaybe<Scalars['Bytes']>;
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<WrapScheduleDeletedEvent_Filter>>>;
  or?: InputMaybe<Array<InputMaybe<WrapScheduleDeletedEvent_Filter>>>;
};

export type WrapScheduleDeletedEvent_OrderBy =
  | 'id'
  | 'blockNumber'
  | 'logIndex'
  | 'order'
  | 'name'
  | 'addresses'
  | 'timestamp'
  | 'transactionHash'
  | 'gasPrice'
  | 'account'
  | 'strategy'
  | 'superToken'
  | 'liquidityToken'
  | 'wrapScheduleId';

export type WrapSchedule_Filter = {
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
  wrapScheduleId?: InputMaybe<Scalars['Bytes']>;
  wrapScheduleId_not?: InputMaybe<Scalars['Bytes']>;
  wrapScheduleId_gt?: InputMaybe<Scalars['Bytes']>;
  wrapScheduleId_lt?: InputMaybe<Scalars['Bytes']>;
  wrapScheduleId_gte?: InputMaybe<Scalars['Bytes']>;
  wrapScheduleId_lte?: InputMaybe<Scalars['Bytes']>;
  wrapScheduleId_in?: InputMaybe<Array<Scalars['Bytes']>>;
  wrapScheduleId_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  wrapScheduleId_contains?: InputMaybe<Scalars['Bytes']>;
  wrapScheduleId_not_contains?: InputMaybe<Scalars['Bytes']>;
  deletedAt?: InputMaybe<Scalars['BigInt']>;
  deletedAt_not?: InputMaybe<Scalars['BigInt']>;
  deletedAt_gt?: InputMaybe<Scalars['BigInt']>;
  deletedAt_lt?: InputMaybe<Scalars['BigInt']>;
  deletedAt_gte?: InputMaybe<Scalars['BigInt']>;
  deletedAt_lte?: InputMaybe<Scalars['BigInt']>;
  deletedAt_in?: InputMaybe<Array<Scalars['BigInt']>>;
  deletedAt_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  createdAt?: InputMaybe<Scalars['BigInt']>;
  createdAt_not?: InputMaybe<Scalars['BigInt']>;
  createdAt_gt?: InputMaybe<Scalars['BigInt']>;
  createdAt_lt?: InputMaybe<Scalars['BigInt']>;
  createdAt_gte?: InputMaybe<Scalars['BigInt']>;
  createdAt_lte?: InputMaybe<Scalars['BigInt']>;
  createdAt_in?: InputMaybe<Array<Scalars['BigInt']>>;
  createdAt_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  createdBlockNumber?: InputMaybe<Scalars['BigInt']>;
  createdBlockNumber_not?: InputMaybe<Scalars['BigInt']>;
  createdBlockNumber_gt?: InputMaybe<Scalars['BigInt']>;
  createdBlockNumber_lt?: InputMaybe<Scalars['BigInt']>;
  createdBlockNumber_gte?: InputMaybe<Scalars['BigInt']>;
  createdBlockNumber_lte?: InputMaybe<Scalars['BigInt']>;
  createdBlockNumber_in?: InputMaybe<Array<Scalars['BigInt']>>;
  createdBlockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  updatedBlockNumber?: InputMaybe<Scalars['BigInt']>;
  updatedBlockNumber_not?: InputMaybe<Scalars['BigInt']>;
  updatedBlockNumber_gt?: InputMaybe<Scalars['BigInt']>;
  updatedBlockNumber_lt?: InputMaybe<Scalars['BigInt']>;
  updatedBlockNumber_gte?: InputMaybe<Scalars['BigInt']>;
  updatedBlockNumber_lte?: InputMaybe<Scalars['BigInt']>;
  updatedBlockNumber_in?: InputMaybe<Array<Scalars['BigInt']>>;
  updatedBlockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  updatedAt?: InputMaybe<Scalars['BigInt']>;
  updatedAt_not?: InputMaybe<Scalars['BigInt']>;
  updatedAt_gt?: InputMaybe<Scalars['BigInt']>;
  updatedAt_lt?: InputMaybe<Scalars['BigInt']>;
  updatedAt_gte?: InputMaybe<Scalars['BigInt']>;
  updatedAt_lte?: InputMaybe<Scalars['BigInt']>;
  updatedAt_in?: InputMaybe<Array<Scalars['BigInt']>>;
  updatedAt_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  expiredAt?: InputMaybe<Scalars['BigInt']>;
  expiredAt_not?: InputMaybe<Scalars['BigInt']>;
  expiredAt_gt?: InputMaybe<Scalars['BigInt']>;
  expiredAt_lt?: InputMaybe<Scalars['BigInt']>;
  expiredAt_gte?: InputMaybe<Scalars['BigInt']>;
  expiredAt_lte?: InputMaybe<Scalars['BigInt']>;
  expiredAt_in?: InputMaybe<Array<Scalars['BigInt']>>;
  expiredAt_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  strategy?: InputMaybe<Scalars['Bytes']>;
  strategy_not?: InputMaybe<Scalars['Bytes']>;
  strategy_gt?: InputMaybe<Scalars['Bytes']>;
  strategy_lt?: InputMaybe<Scalars['Bytes']>;
  strategy_gte?: InputMaybe<Scalars['Bytes']>;
  strategy_lte?: InputMaybe<Scalars['Bytes']>;
  strategy_in?: InputMaybe<Array<Scalars['Bytes']>>;
  strategy_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  strategy_contains?: InputMaybe<Scalars['Bytes']>;
  strategy_not_contains?: InputMaybe<Scalars['Bytes']>;
  manager?: InputMaybe<Scalars['Bytes']>;
  manager_not?: InputMaybe<Scalars['Bytes']>;
  manager_gt?: InputMaybe<Scalars['Bytes']>;
  manager_lt?: InputMaybe<Scalars['Bytes']>;
  manager_gte?: InputMaybe<Scalars['Bytes']>;
  manager_lte?: InputMaybe<Scalars['Bytes']>;
  manager_in?: InputMaybe<Array<Scalars['Bytes']>>;
  manager_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  manager_contains?: InputMaybe<Scalars['Bytes']>;
  manager_not_contains?: InputMaybe<Scalars['Bytes']>;
  account?: InputMaybe<Scalars['Bytes']>;
  account_not?: InputMaybe<Scalars['Bytes']>;
  account_gt?: InputMaybe<Scalars['Bytes']>;
  account_lt?: InputMaybe<Scalars['Bytes']>;
  account_gte?: InputMaybe<Scalars['Bytes']>;
  account_lte?: InputMaybe<Scalars['Bytes']>;
  account_in?: InputMaybe<Array<Scalars['Bytes']>>;
  account_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  account_contains?: InputMaybe<Scalars['Bytes']>;
  account_not_contains?: InputMaybe<Scalars['Bytes']>;
  liquidityToken?: InputMaybe<Scalars['Bytes']>;
  liquidityToken_not?: InputMaybe<Scalars['Bytes']>;
  liquidityToken_gt?: InputMaybe<Scalars['Bytes']>;
  liquidityToken_lt?: InputMaybe<Scalars['Bytes']>;
  liquidityToken_gte?: InputMaybe<Scalars['Bytes']>;
  liquidityToken_lte?: InputMaybe<Scalars['Bytes']>;
  liquidityToken_in?: InputMaybe<Array<Scalars['Bytes']>>;
  liquidityToken_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  liquidityToken_contains?: InputMaybe<Scalars['Bytes']>;
  liquidityToken_not_contains?: InputMaybe<Scalars['Bytes']>;
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
  lowerLimit?: InputMaybe<Scalars['BigInt']>;
  lowerLimit_not?: InputMaybe<Scalars['BigInt']>;
  lowerLimit_gt?: InputMaybe<Scalars['BigInt']>;
  lowerLimit_lt?: InputMaybe<Scalars['BigInt']>;
  lowerLimit_gte?: InputMaybe<Scalars['BigInt']>;
  lowerLimit_lte?: InputMaybe<Scalars['BigInt']>;
  lowerLimit_in?: InputMaybe<Array<Scalars['BigInt']>>;
  lowerLimit_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  upperLimit?: InputMaybe<Scalars['BigInt']>;
  upperLimit_not?: InputMaybe<Scalars['BigInt']>;
  upperLimit_gt?: InputMaybe<Scalars['BigInt']>;
  upperLimit_lt?: InputMaybe<Scalars['BigInt']>;
  upperLimit_gte?: InputMaybe<Scalars['BigInt']>;
  upperLimit_lte?: InputMaybe<Scalars['BigInt']>;
  upperLimit_in?: InputMaybe<Array<Scalars['BigInt']>>;
  upperLimit_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  lastExecutedAt?: InputMaybe<Scalars['BigInt']>;
  lastExecutedAt_not?: InputMaybe<Scalars['BigInt']>;
  lastExecutedAt_gt?: InputMaybe<Scalars['BigInt']>;
  lastExecutedAt_lt?: InputMaybe<Scalars['BigInt']>;
  lastExecutedAt_gte?: InputMaybe<Scalars['BigInt']>;
  lastExecutedAt_lte?: InputMaybe<Scalars['BigInt']>;
  lastExecutedAt_in?: InputMaybe<Array<Scalars['BigInt']>>;
  lastExecutedAt_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  amount?: InputMaybe<Scalars['BigInt']>;
  amount_not?: InputMaybe<Scalars['BigInt']>;
  amount_gt?: InputMaybe<Scalars['BigInt']>;
  amount_lt?: InputMaybe<Scalars['BigInt']>;
  amount_gte?: InputMaybe<Scalars['BigInt']>;
  amount_lte?: InputMaybe<Scalars['BigInt']>;
  amount_in?: InputMaybe<Array<Scalars['BigInt']>>;
  amount_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  isActive?: InputMaybe<Scalars['Boolean']>;
  isActive_not?: InputMaybe<Scalars['Boolean']>;
  isActive_in?: InputMaybe<Array<Scalars['Boolean']>>;
  isActive_not_in?: InputMaybe<Array<Scalars['Boolean']>>;
  events?: InputMaybe<Array<Scalars['String']>>;
  events_not?: InputMaybe<Array<Scalars['String']>>;
  events_contains?: InputMaybe<Array<Scalars['String']>>;
  events_contains_nocase?: InputMaybe<Array<Scalars['String']>>;
  events_not_contains?: InputMaybe<Array<Scalars['String']>>;
  events_not_contains_nocase?: InputMaybe<Array<Scalars['String']>>;
  events_?: InputMaybe<Event_Filter>;
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<WrapSchedule_Filter>>>;
  or?: InputMaybe<Array<InputMaybe<WrapSchedule_Filter>>>;
};

export type WrapSchedule_OrderBy =
  | 'id'
  | 'wrapScheduleId'
  | 'deletedAt'
  | 'createdAt'
  | 'createdBlockNumber'
  | 'updatedBlockNumber'
  | 'updatedAt'
  | 'expiredAt'
  | 'strategy'
  | 'manager'
  | 'account'
  | 'liquidityToken'
  | 'superToken'
  | 'lowerLimit'
  | 'upperLimit'
  | 'lastExecutedAt'
  | 'amount'
  | 'isActive'
  | 'events';

export type _Block_ = {
  /** The hash of the block */
  hash?: Maybe<Scalars['Bytes']>;
  /** The block number */
  number: Scalars['Int'];
  /** Integer representation of the timestamp stored in blocks for the chain */
  timestamp?: Maybe<Scalars['Int']>;
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
  AddedApprovedStrategyEvent: ResolverTypeWrapper<AddedApprovedStrategyEvent>;
  AddedApprovedStrategyEvent_filter: AddedApprovedStrategyEvent_Filter;
  AddedApprovedStrategyEvent_orderBy: AddedApprovedStrategyEvent_OrderBy;
  Aggregation_interval: Aggregation_Interval;
  BigDecimal: ResolverTypeWrapper<Scalars['BigDecimal']>;
  BigInt: ResolverTypeWrapper<Scalars['BigInt']>;
  BlockChangedFilter: BlockChangedFilter;
  Block_height: Block_Height;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
  Bytes: ResolverTypeWrapper<Scalars['Bytes']>;
  Event: ResolversTypes['AddedApprovedStrategyEvent'] | ResolversTypes['LimitsChangedEvent'] | ResolversTypes['RemovedApprovedStrategyEvent'] | ResolversTypes['WrapExecutedEvent'] | ResolversTypes['WrapScheduleCreatedEvent'] | ResolversTypes['WrapScheduleDeletedEvent'];
  Event_filter: Event_Filter;
  Event_orderBy: Event_OrderBy;
  Float: ResolverTypeWrapper<Scalars['Float']>;
  ID: ResolverTypeWrapper<Scalars['ID']>;
  Int: ResolverTypeWrapper<Scalars['Int']>;
  Int8: ResolverTypeWrapper<Scalars['Int8']>;
  LimitsChangedEvent: ResolverTypeWrapper<LimitsChangedEvent>;
  LimitsChangedEvent_filter: LimitsChangedEvent_Filter;
  LimitsChangedEvent_orderBy: LimitsChangedEvent_OrderBy;
  OrderDirection: OrderDirection;
  Query: ResolverTypeWrapper<{}>;
  RemovedApprovedStrategyEvent: ResolverTypeWrapper<RemovedApprovedStrategyEvent>;
  RemovedApprovedStrategyEvent_filter: RemovedApprovedStrategyEvent_Filter;
  RemovedApprovedStrategyEvent_orderBy: RemovedApprovedStrategyEvent_OrderBy;
  String: ResolverTypeWrapper<Scalars['String']>;
  Subscription: ResolverTypeWrapper<{}>;
  UserTokenLiquidityToken: ResolverTypeWrapper<UserTokenLiquidityToken>;
  UserTokenLiquidityToken_filter: UserTokenLiquidityToken_Filter;
  UserTokenLiquidityToken_orderBy: UserTokenLiquidityToken_OrderBy;
  WrapExecutedEvent: ResolverTypeWrapper<WrapExecutedEvent>;
  WrapExecutedEvent_filter: WrapExecutedEvent_Filter;
  WrapExecutedEvent_orderBy: WrapExecutedEvent_OrderBy;
  WrapSchedule: ResolverTypeWrapper<WrapSchedule>;
  WrapScheduleCreatedEvent: ResolverTypeWrapper<WrapScheduleCreatedEvent>;
  WrapScheduleCreatedEvent_filter: WrapScheduleCreatedEvent_Filter;
  WrapScheduleCreatedEvent_orderBy: WrapScheduleCreatedEvent_OrderBy;
  WrapScheduleDeletedEvent: ResolverTypeWrapper<WrapScheduleDeletedEvent>;
  WrapScheduleDeletedEvent_filter: WrapScheduleDeletedEvent_Filter;
  WrapScheduleDeletedEvent_orderBy: WrapScheduleDeletedEvent_OrderBy;
  WrapSchedule_filter: WrapSchedule_Filter;
  WrapSchedule_orderBy: WrapSchedule_OrderBy;
  _Block_: ResolverTypeWrapper<_Block_>;
  _Meta_: ResolverTypeWrapper<_Meta_>;
  _SubgraphErrorPolicy_: _SubgraphErrorPolicy_;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  AddedApprovedStrategyEvent: AddedApprovedStrategyEvent;
  AddedApprovedStrategyEvent_filter: AddedApprovedStrategyEvent_Filter;
  BigDecimal: Scalars['BigDecimal'];
  BigInt: Scalars['BigInt'];
  BlockChangedFilter: BlockChangedFilter;
  Block_height: Block_Height;
  Boolean: Scalars['Boolean'];
  Bytes: Scalars['Bytes'];
  Event: ResolversParentTypes['AddedApprovedStrategyEvent'] | ResolversParentTypes['LimitsChangedEvent'] | ResolversParentTypes['RemovedApprovedStrategyEvent'] | ResolversParentTypes['WrapExecutedEvent'] | ResolversParentTypes['WrapScheduleCreatedEvent'] | ResolversParentTypes['WrapScheduleDeletedEvent'];
  Event_filter: Event_Filter;
  Float: Scalars['Float'];
  ID: Scalars['ID'];
  Int: Scalars['Int'];
  Int8: Scalars['Int8'];
  LimitsChangedEvent: LimitsChangedEvent;
  LimitsChangedEvent_filter: LimitsChangedEvent_Filter;
  Query: {};
  RemovedApprovedStrategyEvent: RemovedApprovedStrategyEvent;
  RemovedApprovedStrategyEvent_filter: RemovedApprovedStrategyEvent_Filter;
  String: Scalars['String'];
  Subscription: {};
  UserTokenLiquidityToken: UserTokenLiquidityToken;
  UserTokenLiquidityToken_filter: UserTokenLiquidityToken_Filter;
  WrapExecutedEvent: WrapExecutedEvent;
  WrapExecutedEvent_filter: WrapExecutedEvent_Filter;
  WrapSchedule: WrapSchedule;
  WrapScheduleCreatedEvent: WrapScheduleCreatedEvent;
  WrapScheduleCreatedEvent_filter: WrapScheduleCreatedEvent_Filter;
  WrapScheduleDeletedEvent: WrapScheduleDeletedEvent;
  WrapScheduleDeletedEvent_filter: WrapScheduleDeletedEvent_Filter;
  WrapSchedule_filter: WrapSchedule_Filter;
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

export type AddedApprovedStrategyEventResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['AddedApprovedStrategyEvent'] = ResolversParentTypes['AddedApprovedStrategyEvent']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  blockNumber?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  logIndex?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  order?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  addresses?: Resolver<Array<ResolversTypes['Bytes']>, ParentType, ContextType>;
  timestamp?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  transactionHash?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  gasPrice?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  strategy?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

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
  __resolveType: TypeResolveFn<'AddedApprovedStrategyEvent' | 'LimitsChangedEvent' | 'RemovedApprovedStrategyEvent' | 'WrapExecutedEvent' | 'WrapScheduleCreatedEvent' | 'WrapScheduleDeletedEvent', ParentType, ContextType>;
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

export type LimitsChangedEventResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['LimitsChangedEvent'] = ResolversParentTypes['LimitsChangedEvent']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  blockNumber?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  logIndex?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  order?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  addresses?: Resolver<Array<ResolversTypes['Bytes']>, ParentType, ContextType>;
  timestamp?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  transactionHash?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  gasPrice?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  upperLimit?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  lowerLimit?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type QueryResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = ResolversObject<{
  addedApprovedStrategyEvent?: Resolver<Maybe<ResolversTypes['AddedApprovedStrategyEvent']>, ParentType, ContextType, RequireFields<QueryAddedApprovedStrategyEventArgs, 'id' | 'subgraphError'>>;
  addedApprovedStrategyEvents?: Resolver<Array<ResolversTypes['AddedApprovedStrategyEvent']>, ParentType, ContextType, RequireFields<QueryAddedApprovedStrategyEventsArgs, 'skip' | 'first' | 'subgraphError'>>;
  removedApprovedStrategyEvent?: Resolver<Maybe<ResolversTypes['RemovedApprovedStrategyEvent']>, ParentType, ContextType, RequireFields<QueryRemovedApprovedStrategyEventArgs, 'id' | 'subgraphError'>>;
  removedApprovedStrategyEvents?: Resolver<Array<ResolversTypes['RemovedApprovedStrategyEvent']>, ParentType, ContextType, RequireFields<QueryRemovedApprovedStrategyEventsArgs, 'skip' | 'first' | 'subgraphError'>>;
  limitsChangedEvent?: Resolver<Maybe<ResolversTypes['LimitsChangedEvent']>, ParentType, ContextType, RequireFields<QueryLimitsChangedEventArgs, 'id' | 'subgraphError'>>;
  limitsChangedEvents?: Resolver<Array<ResolversTypes['LimitsChangedEvent']>, ParentType, ContextType, RequireFields<QueryLimitsChangedEventsArgs, 'skip' | 'first' | 'subgraphError'>>;
  wrapExecutedEvent?: Resolver<Maybe<ResolversTypes['WrapExecutedEvent']>, ParentType, ContextType, RequireFields<QueryWrapExecutedEventArgs, 'id' | 'subgraphError'>>;
  wrapExecutedEvents?: Resolver<Array<ResolversTypes['WrapExecutedEvent']>, ParentType, ContextType, RequireFields<QueryWrapExecutedEventsArgs, 'skip' | 'first' | 'subgraphError'>>;
  wrapScheduleCreatedEvent?: Resolver<Maybe<ResolversTypes['WrapScheduleCreatedEvent']>, ParentType, ContextType, RequireFields<QueryWrapScheduleCreatedEventArgs, 'id' | 'subgraphError'>>;
  wrapScheduleCreatedEvents?: Resolver<Array<ResolversTypes['WrapScheduleCreatedEvent']>, ParentType, ContextType, RequireFields<QueryWrapScheduleCreatedEventsArgs, 'skip' | 'first' | 'subgraphError'>>;
  wrapScheduleDeletedEvent?: Resolver<Maybe<ResolversTypes['WrapScheduleDeletedEvent']>, ParentType, ContextType, RequireFields<QueryWrapScheduleDeletedEventArgs, 'id' | 'subgraphError'>>;
  wrapScheduleDeletedEvents?: Resolver<Array<ResolversTypes['WrapScheduleDeletedEvent']>, ParentType, ContextType, RequireFields<QueryWrapScheduleDeletedEventsArgs, 'skip' | 'first' | 'subgraphError'>>;
  wrapSchedule?: Resolver<Maybe<ResolversTypes['WrapSchedule']>, ParentType, ContextType, RequireFields<QueryWrapScheduleArgs, 'id' | 'subgraphError'>>;
  wrapSchedules?: Resolver<Array<ResolversTypes['WrapSchedule']>, ParentType, ContextType, RequireFields<QueryWrapSchedulesArgs, 'skip' | 'first' | 'subgraphError'>>;
  userTokenLiquidityToken?: Resolver<Maybe<ResolversTypes['UserTokenLiquidityToken']>, ParentType, ContextType, RequireFields<QueryUserTokenLiquidityTokenArgs, 'id' | 'subgraphError'>>;
  userTokenLiquidityTokens?: Resolver<Array<ResolversTypes['UserTokenLiquidityToken']>, ParentType, ContextType, RequireFields<QueryUserTokenLiquidityTokensArgs, 'skip' | 'first' | 'subgraphError'>>;
  event?: Resolver<Maybe<ResolversTypes['Event']>, ParentType, ContextType, RequireFields<QueryEventArgs, 'id' | 'subgraphError'>>;
  events?: Resolver<Array<ResolversTypes['Event']>, ParentType, ContextType, RequireFields<QueryEventsArgs, 'skip' | 'first' | 'subgraphError'>>;
  _meta?: Resolver<Maybe<ResolversTypes['_Meta_']>, ParentType, ContextType, Partial<Query_MetaArgs>>;
}>;

export type RemovedApprovedStrategyEventResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['RemovedApprovedStrategyEvent'] = ResolversParentTypes['RemovedApprovedStrategyEvent']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  blockNumber?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  logIndex?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  order?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  addresses?: Resolver<Array<ResolversTypes['Bytes']>, ParentType, ContextType>;
  timestamp?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  transactionHash?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  gasPrice?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  strategy?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type SubscriptionResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['Subscription'] = ResolversParentTypes['Subscription']> = ResolversObject<{
  addedApprovedStrategyEvent?: SubscriptionResolver<Maybe<ResolversTypes['AddedApprovedStrategyEvent']>, "addedApprovedStrategyEvent", ParentType, ContextType, RequireFields<SubscriptionAddedApprovedStrategyEventArgs, 'id' | 'subgraphError'>>;
  addedApprovedStrategyEvents?: SubscriptionResolver<Array<ResolversTypes['AddedApprovedStrategyEvent']>, "addedApprovedStrategyEvents", ParentType, ContextType, RequireFields<SubscriptionAddedApprovedStrategyEventsArgs, 'skip' | 'first' | 'subgraphError'>>;
  removedApprovedStrategyEvent?: SubscriptionResolver<Maybe<ResolversTypes['RemovedApprovedStrategyEvent']>, "removedApprovedStrategyEvent", ParentType, ContextType, RequireFields<SubscriptionRemovedApprovedStrategyEventArgs, 'id' | 'subgraphError'>>;
  removedApprovedStrategyEvents?: SubscriptionResolver<Array<ResolversTypes['RemovedApprovedStrategyEvent']>, "removedApprovedStrategyEvents", ParentType, ContextType, RequireFields<SubscriptionRemovedApprovedStrategyEventsArgs, 'skip' | 'first' | 'subgraphError'>>;
  limitsChangedEvent?: SubscriptionResolver<Maybe<ResolversTypes['LimitsChangedEvent']>, "limitsChangedEvent", ParentType, ContextType, RequireFields<SubscriptionLimitsChangedEventArgs, 'id' | 'subgraphError'>>;
  limitsChangedEvents?: SubscriptionResolver<Array<ResolversTypes['LimitsChangedEvent']>, "limitsChangedEvents", ParentType, ContextType, RequireFields<SubscriptionLimitsChangedEventsArgs, 'skip' | 'first' | 'subgraphError'>>;
  wrapExecutedEvent?: SubscriptionResolver<Maybe<ResolversTypes['WrapExecutedEvent']>, "wrapExecutedEvent", ParentType, ContextType, RequireFields<SubscriptionWrapExecutedEventArgs, 'id' | 'subgraphError'>>;
  wrapExecutedEvents?: SubscriptionResolver<Array<ResolversTypes['WrapExecutedEvent']>, "wrapExecutedEvents", ParentType, ContextType, RequireFields<SubscriptionWrapExecutedEventsArgs, 'skip' | 'first' | 'subgraphError'>>;
  wrapScheduleCreatedEvent?: SubscriptionResolver<Maybe<ResolversTypes['WrapScheduleCreatedEvent']>, "wrapScheduleCreatedEvent", ParentType, ContextType, RequireFields<SubscriptionWrapScheduleCreatedEventArgs, 'id' | 'subgraphError'>>;
  wrapScheduleCreatedEvents?: SubscriptionResolver<Array<ResolversTypes['WrapScheduleCreatedEvent']>, "wrapScheduleCreatedEvents", ParentType, ContextType, RequireFields<SubscriptionWrapScheduleCreatedEventsArgs, 'skip' | 'first' | 'subgraphError'>>;
  wrapScheduleDeletedEvent?: SubscriptionResolver<Maybe<ResolversTypes['WrapScheduleDeletedEvent']>, "wrapScheduleDeletedEvent", ParentType, ContextType, RequireFields<SubscriptionWrapScheduleDeletedEventArgs, 'id' | 'subgraphError'>>;
  wrapScheduleDeletedEvents?: SubscriptionResolver<Array<ResolversTypes['WrapScheduleDeletedEvent']>, "wrapScheduleDeletedEvents", ParentType, ContextType, RequireFields<SubscriptionWrapScheduleDeletedEventsArgs, 'skip' | 'first' | 'subgraphError'>>;
  wrapSchedule?: SubscriptionResolver<Maybe<ResolversTypes['WrapSchedule']>, "wrapSchedule", ParentType, ContextType, RequireFields<SubscriptionWrapScheduleArgs, 'id' | 'subgraphError'>>;
  wrapSchedules?: SubscriptionResolver<Array<ResolversTypes['WrapSchedule']>, "wrapSchedules", ParentType, ContextType, RequireFields<SubscriptionWrapSchedulesArgs, 'skip' | 'first' | 'subgraphError'>>;
  userTokenLiquidityToken?: SubscriptionResolver<Maybe<ResolversTypes['UserTokenLiquidityToken']>, "userTokenLiquidityToken", ParentType, ContextType, RequireFields<SubscriptionUserTokenLiquidityTokenArgs, 'id' | 'subgraphError'>>;
  userTokenLiquidityTokens?: SubscriptionResolver<Array<ResolversTypes['UserTokenLiquidityToken']>, "userTokenLiquidityTokens", ParentType, ContextType, RequireFields<SubscriptionUserTokenLiquidityTokensArgs, 'skip' | 'first' | 'subgraphError'>>;
  event?: SubscriptionResolver<Maybe<ResolversTypes['Event']>, "event", ParentType, ContextType, RequireFields<SubscriptionEventArgs, 'id' | 'subgraphError'>>;
  events?: SubscriptionResolver<Array<ResolversTypes['Event']>, "events", ParentType, ContextType, RequireFields<SubscriptionEventsArgs, 'skip' | 'first' | 'subgraphError'>>;
  _meta?: SubscriptionResolver<Maybe<ResolversTypes['_Meta_']>, "_meta", ParentType, ContextType, Partial<Subscription_MetaArgs>>;
}>;

export type UserTokenLiquidityTokenResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['UserTokenLiquidityToken'] = ResolversParentTypes['UserTokenLiquidityToken']> = ResolversObject<{
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  currentWrapSchedule?: Resolver<Maybe<ResolversTypes['WrapSchedule']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type WrapExecutedEventResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['WrapExecutedEvent'] = ResolversParentTypes['WrapExecutedEvent']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  blockNumber?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  logIndex?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  order?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  addresses?: Resolver<Array<ResolversTypes['Bytes']>, ParentType, ContextType>;
  timestamp?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  transactionHash?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  gasPrice?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  amount?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  wrapScheduleId?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type WrapScheduleResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['WrapSchedule'] = ResolversParentTypes['WrapSchedule']> = ResolversObject<{
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  wrapScheduleId?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  deletedAt?: Resolver<Maybe<ResolversTypes['BigInt']>, ParentType, ContextType>;
  createdAt?: Resolver<Maybe<ResolversTypes['BigInt']>, ParentType, ContextType>;
  createdBlockNumber?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  updatedBlockNumber?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<ResolversTypes['BigInt']>, ParentType, ContextType>;
  expiredAt?: Resolver<Maybe<ResolversTypes['BigInt']>, ParentType, ContextType>;
  strategy?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  manager?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  account?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  liquidityToken?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  superToken?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  lowerLimit?: Resolver<Maybe<ResolversTypes['BigInt']>, ParentType, ContextType>;
  upperLimit?: Resolver<Maybe<ResolversTypes['BigInt']>, ParentType, ContextType>;
  lastExecutedAt?: Resolver<Maybe<ResolversTypes['BigInt']>, ParentType, ContextType>;
  amount?: Resolver<Maybe<ResolversTypes['BigInt']>, ParentType, ContextType>;
  isActive?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  events?: Resolver<Array<ResolversTypes['Event']>, ParentType, ContextType, RequireFields<WrapScheduleEventsArgs, 'skip' | 'first'>>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type WrapScheduleCreatedEventResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['WrapScheduleCreatedEvent'] = ResolversParentTypes['WrapScheduleCreatedEvent']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  blockNumber?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  logIndex?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  order?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  addresses?: Resolver<Array<ResolversTypes['Bytes']>, ParentType, ContextType>;
  timestamp?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  transactionHash?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  gasPrice?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  account?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  superToken?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  strategy?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  liquidityToken?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  expiry?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  lowerLimit?: Resolver<Maybe<ResolversTypes['BigInt']>, ParentType, ContextType>;
  upperLimit?: Resolver<Maybe<ResolversTypes['BigInt']>, ParentType, ContextType>;
  wrapScheduleId?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type WrapScheduleDeletedEventResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['WrapScheduleDeletedEvent'] = ResolversParentTypes['WrapScheduleDeletedEvent']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  blockNumber?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  logIndex?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  order?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  addresses?: Resolver<Array<ResolversTypes['Bytes']>, ParentType, ContextType>;
  timestamp?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  transactionHash?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  gasPrice?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  account?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  strategy?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  superToken?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  liquidityToken?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  wrapScheduleId?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type _Block_Resolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['_Block_'] = ResolversParentTypes['_Block_']> = ResolversObject<{
  hash?: Resolver<Maybe<ResolversTypes['Bytes']>, ParentType, ContextType>;
  number?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  timestamp?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type _Meta_Resolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['_Meta_'] = ResolversParentTypes['_Meta_']> = ResolversObject<{
  block?: Resolver<ResolversTypes['_Block_'], ParentType, ContextType>;
  deployment?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  hasIndexingErrors?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type Resolvers<ContextType = MeshContext> = ResolversObject<{
  AddedApprovedStrategyEvent?: AddedApprovedStrategyEventResolvers<ContextType>;
  BigDecimal?: GraphQLScalarType;
  BigInt?: GraphQLScalarType;
  Bytes?: GraphQLScalarType;
  Event?: EventResolvers<ContextType>;
  Int8?: GraphQLScalarType;
  LimitsChangedEvent?: LimitsChangedEventResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  RemovedApprovedStrategyEvent?: RemovedApprovedStrategyEventResolvers<ContextType>;
  Subscription?: SubscriptionResolvers<ContextType>;
  UserTokenLiquidityToken?: UserTokenLiquidityTokenResolvers<ContextType>;
  WrapExecutedEvent?: WrapExecutedEventResolvers<ContextType>;
  WrapSchedule?: WrapScheduleResolvers<ContextType>;
  WrapScheduleCreatedEvent?: WrapScheduleCreatedEventResolvers<ContextType>;
  WrapScheduleDeletedEvent?: WrapScheduleDeletedEventResolvers<ContextType>;
  _Block_?: _Block_Resolvers<ContextType>;
  _Meta_?: _Meta_Resolvers<ContextType>;
}>;

export type DirectiveResolvers<ContextType = MeshContext> = ResolversObject<{
  entity?: EntityDirectiveResolver<any, any, ContextType>;
  subgraphId?: SubgraphIdDirectiveResolver<any, any, ContextType>;
  derivedFrom?: DerivedFromDirectiveResolver<any, any, ContextType>;
}>;

export type MeshContext = AutowrapTypes.Context & BaseMeshContext;


import { fileURLToPath } from '@graphql-mesh/utils';
const baseDir = pathModule.join(pathModule.dirname(fileURLToPath(import.meta.url)), '..');

const importFn: ImportFn = <T>(moduleId: string) => {
  const relativeModuleId = (pathModule.isAbsolute(moduleId) ? pathModule.relative(baseDir, moduleId) : moduleId).split('\\').join('/').replace(baseDir + '/', '');
  switch(relativeModuleId) {
    case ".graphclient/sources/autowrap/introspectionSchema":
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
const autowrapTransforms = [];
const additionalTypeDefs = [] as any[];
const autowrapHandler = new GraphqlHandler({
              name: "autowrap",
              config: {"endpoint":"{context.url:https://api.thegraph.com/subgraphs/name/superfluid-finance/auto-wrap-v1-polygon-mainnet}","retry":5},
              baseDir,
              cache,
              pubsub,
              store: sourcesStore.child("autowrap"),
              logger: logger.child("autowrap"),
              importFn,
            });
sources[0] = {
          name: 'autowrap',
          handler: autowrapHandler,
          transforms: autowrapTransforms
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
        document: GetWrapScheduleDocument,
        get rawSDL() {
          return printWithCache(GetWrapScheduleDocument);
        },
        location: 'GetWrapScheduleDocument.graphql'
      },{
        document: GetWrapSchedulesDocument,
        get rawSDL() {
          return printWithCache(GetWrapSchedulesDocument);
        },
        location: 'GetWrapSchedulesDocument.graphql'
      },{
        document: PollDocument,
        get rawSDL() {
          return printWithCache(PollDocument);
        },
        location: 'PollDocument.graphql'
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
export type GetWrapScheduleQueryVariables = Exact<{
  id: Scalars['ID'];
}>;


export type GetWrapScheduleQuery = { wrapSchedule?: Maybe<Pick<WrapSchedule, 'id' | 'account' | 'wrapScheduleId' | 'deletedAt' | 'updatedAt' | 'expiredAt' | 'createdAt' | 'lastExecutedAt' | 'strategy' | 'manager' | 'superToken' | 'liquidityToken' | 'amount' | 'upperLimit' | 'lowerLimit' | 'createdBlockNumber' | 'updatedBlockNumber' | 'isActive'>> };

export type GetWrapSchedulesQueryVariables = Exact<{
  where?: InputMaybe<WrapSchedule_Filter>;
  orderBy?: InputMaybe<WrapSchedule_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
}>;


export type GetWrapSchedulesQuery = { wrapSchedules: Array<Pick<WrapSchedule, 'id' | 'account' | 'wrapScheduleId' | 'deletedAt' | 'updatedAt' | 'expiredAt' | 'createdAt' | 'lastExecutedAt' | 'strategy' | 'manager' | 'superToken' | 'liquidityToken' | 'amount' | 'upperLimit' | 'lowerLimit' | 'createdBlockNumber' | 'updatedBlockNumber' | 'isActive'>> };

export type WrapSchedulePartFragment = Pick<WrapSchedule, 'id' | 'account' | 'wrapScheduleId' | 'deletedAt' | 'updatedAt' | 'expiredAt' | 'createdAt' | 'lastExecutedAt' | 'strategy' | 'manager' | 'superToken' | 'liquidityToken' | 'amount' | 'upperLimit' | 'lowerLimit' | 'createdBlockNumber' | 'updatedBlockNumber' | 'isActive'>;

export type PollQueryVariables = Exact<{
  block: Block_Height;
}>;


export type PollQuery = { events: Array<Pick<AddedApprovedStrategyEvent, 'order'> | Pick<LimitsChangedEvent, 'order'> | Pick<RemovedApprovedStrategyEvent, 'order'> | Pick<WrapExecutedEvent, 'order'> | Pick<WrapScheduleCreatedEvent, 'order'> | Pick<WrapScheduleDeletedEvent, 'order'>> };

export const WrapSchedulePartFragmentDoc = gql`
    fragment WrapSchedulePart on WrapSchedule {
  id
  account
  wrapScheduleId
  deletedAt
  updatedAt
  expiredAt
  createdAt
  lastExecutedAt
  strategy
  manager
  superToken
  liquidityToken
  amount
  upperLimit
  lowerLimit
  createdBlockNumber
  updatedBlockNumber
  isActive
}
    ` as unknown as DocumentNode<WrapSchedulePartFragment, unknown>;
export const GetWrapScheduleDocument = gql`
    query getWrapSchedule($id: ID!) {
  wrapSchedule(id: $id) {
    ...WrapSchedulePart
  }
}
    ${WrapSchedulePartFragmentDoc}` as unknown as DocumentNode<GetWrapScheduleQuery, GetWrapScheduleQueryVariables>;
export const GetWrapSchedulesDocument = gql`
    query getWrapSchedules($where: WrapSchedule_filter = {}, $orderBy: WrapSchedule_orderBy = id, $orderDirection: OrderDirection = asc) {
  wrapSchedules(
    first: 1000
    where: $where
    orderBy: $orderBy
    orderDirection: $orderDirection
  ) {
    ...WrapSchedulePart
  }
}
    ${WrapSchedulePartFragmentDoc}` as unknown as DocumentNode<GetWrapSchedulesQuery, GetWrapSchedulesQueryVariables>;
export const PollDocument = gql`
    query poll($block: Block_height!) {
  events(block: $block, first: 1) {
    order
  }
}
    ` as unknown as DocumentNode<PollQuery, PollQueryVariables>;




export type Requester<C = {}, E = unknown> = <R, V>(doc: DocumentNode, vars?: V, options?: C) => Promise<R> | AsyncIterable<R>
export function getSdk<C, E>(requester: Requester<C, E>) {
  return {
    getWrapSchedule(variables: GetWrapScheduleQueryVariables, options?: C): Promise<GetWrapScheduleQuery> {
      return requester<GetWrapScheduleQuery, GetWrapScheduleQueryVariables>(GetWrapScheduleDocument, variables, options) as Promise<GetWrapScheduleQuery>;
    },
    getWrapSchedules(variables?: GetWrapSchedulesQueryVariables, options?: C): Promise<GetWrapSchedulesQuery> {
      return requester<GetWrapSchedulesQuery, GetWrapSchedulesQueryVariables>(GetWrapSchedulesDocument, variables, options) as Promise<GetWrapSchedulesQuery>;
    },
    poll(variables: PollQueryVariables, options?: C): Promise<PollQuery> {
      return requester<PollQuery, PollQueryVariables>(PollDocument, variables, options) as Promise<PollQuery>;
    }
  };
}
export type Sdk = ReturnType<typeof getSdk>;