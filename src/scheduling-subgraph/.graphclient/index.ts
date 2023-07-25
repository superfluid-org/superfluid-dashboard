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
import type { SchedulingTypes } from './sources/scheduling/types';
import * as importedModule$0 from "./sources/scheduling/introspectionSchema";
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

export type BlockChangedFilter = {
  number_gte: Scalars['Int'];
};

export type Block_Height = {
  hash?: InputMaybe<Scalars['Bytes']>;
  number?: InputMaybe<Scalars['Int']>;
  number_gte?: InputMaybe<Scalars['Int']>;
};

export type CreateFlowExecutedEvent = Event & {
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
  startDateMaxDelay: Scalars['BigInt'];
  flowRate: Scalars['BigInt'];
  startAmount: Scalars['BigInt'];
  userData: Scalars['Bytes'];
};

export type CreateFlowExecutedEvent_Filter = {
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
  startDateMaxDelay?: InputMaybe<Scalars['BigInt']>;
  startDateMaxDelay_not?: InputMaybe<Scalars['BigInt']>;
  startDateMaxDelay_gt?: InputMaybe<Scalars['BigInt']>;
  startDateMaxDelay_lt?: InputMaybe<Scalars['BigInt']>;
  startDateMaxDelay_gte?: InputMaybe<Scalars['BigInt']>;
  startDateMaxDelay_lte?: InputMaybe<Scalars['BigInt']>;
  startDateMaxDelay_in?: InputMaybe<Array<Scalars['BigInt']>>;
  startDateMaxDelay_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  flowRate?: InputMaybe<Scalars['BigInt']>;
  flowRate_not?: InputMaybe<Scalars['BigInt']>;
  flowRate_gt?: InputMaybe<Scalars['BigInt']>;
  flowRate_lt?: InputMaybe<Scalars['BigInt']>;
  flowRate_gte?: InputMaybe<Scalars['BigInt']>;
  flowRate_lte?: InputMaybe<Scalars['BigInt']>;
  flowRate_in?: InputMaybe<Array<Scalars['BigInt']>>;
  flowRate_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  startAmount?: InputMaybe<Scalars['BigInt']>;
  startAmount_not?: InputMaybe<Scalars['BigInt']>;
  startAmount_gt?: InputMaybe<Scalars['BigInt']>;
  startAmount_lt?: InputMaybe<Scalars['BigInt']>;
  startAmount_gte?: InputMaybe<Scalars['BigInt']>;
  startAmount_lte?: InputMaybe<Scalars['BigInt']>;
  startAmount_in?: InputMaybe<Array<Scalars['BigInt']>>;
  startAmount_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  userData?: InputMaybe<Scalars['Bytes']>;
  userData_not?: InputMaybe<Scalars['Bytes']>;
  userData_gt?: InputMaybe<Scalars['Bytes']>;
  userData_lt?: InputMaybe<Scalars['Bytes']>;
  userData_gte?: InputMaybe<Scalars['Bytes']>;
  userData_lte?: InputMaybe<Scalars['Bytes']>;
  userData_in?: InputMaybe<Array<Scalars['Bytes']>>;
  userData_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  userData_contains?: InputMaybe<Scalars['Bytes']>;
  userData_not_contains?: InputMaybe<Scalars['Bytes']>;
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<CreateFlowExecutedEvent_Filter>>>;
  or?: InputMaybe<Array<InputMaybe<CreateFlowExecutedEvent_Filter>>>;
};

export type CreateFlowExecutedEvent_OrderBy =
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
  | 'startDateMaxDelay'
  | 'flowRate'
  | 'startAmount'
  | 'userData';

export type CreateTask = Task & {
  id: Scalars['ID'];
  type: TaskType;
  createdAt: Scalars['BigInt'];
  executedAt?: Maybe<Scalars['BigInt']>;
  executionAt: Scalars['BigInt'];
  expirationAt: Scalars['BigInt'];
  cancelledAt?: Maybe<Scalars['BigInt']>;
  superToken: Scalars['Bytes'];
  sender: Scalars['Bytes'];
  receiver: Scalars['Bytes'];
  startDate: Scalars['BigInt'];
  startDateMaxDelay: Scalars['BigInt'];
  startAmount: Scalars['BigInt'];
  flowRate: Scalars['BigInt'];
};

export type CreateTask_Filter = {
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
  createdAt?: InputMaybe<Scalars['BigInt']>;
  createdAt_not?: InputMaybe<Scalars['BigInt']>;
  createdAt_gt?: InputMaybe<Scalars['BigInt']>;
  createdAt_lt?: InputMaybe<Scalars['BigInt']>;
  createdAt_gte?: InputMaybe<Scalars['BigInt']>;
  createdAt_lte?: InputMaybe<Scalars['BigInt']>;
  createdAt_in?: InputMaybe<Array<Scalars['BigInt']>>;
  createdAt_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
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
  startDateMaxDelay?: InputMaybe<Scalars['BigInt']>;
  startDateMaxDelay_not?: InputMaybe<Scalars['BigInt']>;
  startDateMaxDelay_gt?: InputMaybe<Scalars['BigInt']>;
  startDateMaxDelay_lt?: InputMaybe<Scalars['BigInt']>;
  startDateMaxDelay_gte?: InputMaybe<Scalars['BigInt']>;
  startDateMaxDelay_lte?: InputMaybe<Scalars['BigInt']>;
  startDateMaxDelay_in?: InputMaybe<Array<Scalars['BigInt']>>;
  startDateMaxDelay_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  startAmount?: InputMaybe<Scalars['BigInt']>;
  startAmount_not?: InputMaybe<Scalars['BigInt']>;
  startAmount_gt?: InputMaybe<Scalars['BigInt']>;
  startAmount_lt?: InputMaybe<Scalars['BigInt']>;
  startAmount_gte?: InputMaybe<Scalars['BigInt']>;
  startAmount_lte?: InputMaybe<Scalars['BigInt']>;
  startAmount_in?: InputMaybe<Array<Scalars['BigInt']>>;
  startAmount_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  flowRate?: InputMaybe<Scalars['BigInt']>;
  flowRate_not?: InputMaybe<Scalars['BigInt']>;
  flowRate_gt?: InputMaybe<Scalars['BigInt']>;
  flowRate_lt?: InputMaybe<Scalars['BigInt']>;
  flowRate_gte?: InputMaybe<Scalars['BigInt']>;
  flowRate_lte?: InputMaybe<Scalars['BigInt']>;
  flowRate_in?: InputMaybe<Array<Scalars['BigInt']>>;
  flowRate_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<CreateTask_Filter>>>;
  or?: InputMaybe<Array<InputMaybe<CreateTask_Filter>>>;
};

export type CreateTask_OrderBy =
  | 'id'
  | 'type'
  | 'createdAt'
  | 'executedAt'
  | 'executionAt'
  | 'expirationAt'
  | 'cancelledAt'
  | 'superToken'
  | 'sender'
  | 'receiver'
  | 'startDate'
  | 'startDateMaxDelay'
  | 'startAmount'
  | 'flowRate';

export type DeleteFlowExecutedEvent = Event & {
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
  endDate: Scalars['BigInt'];
  userData: Scalars['Bytes'];
};

export type DeleteFlowExecutedEvent_Filter = {
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
  endDate?: InputMaybe<Scalars['BigInt']>;
  endDate_not?: InputMaybe<Scalars['BigInt']>;
  endDate_gt?: InputMaybe<Scalars['BigInt']>;
  endDate_lt?: InputMaybe<Scalars['BigInt']>;
  endDate_gte?: InputMaybe<Scalars['BigInt']>;
  endDate_lte?: InputMaybe<Scalars['BigInt']>;
  endDate_in?: InputMaybe<Array<Scalars['BigInt']>>;
  endDate_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  userData?: InputMaybe<Scalars['Bytes']>;
  userData_not?: InputMaybe<Scalars['Bytes']>;
  userData_gt?: InputMaybe<Scalars['Bytes']>;
  userData_lt?: InputMaybe<Scalars['Bytes']>;
  userData_gte?: InputMaybe<Scalars['Bytes']>;
  userData_lte?: InputMaybe<Scalars['Bytes']>;
  userData_in?: InputMaybe<Array<Scalars['Bytes']>>;
  userData_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  userData_contains?: InputMaybe<Scalars['Bytes']>;
  userData_not_contains?: InputMaybe<Scalars['Bytes']>;
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<DeleteFlowExecutedEvent_Filter>>>;
  or?: InputMaybe<Array<InputMaybe<DeleteFlowExecutedEvent_Filter>>>;
};

export type DeleteFlowExecutedEvent_OrderBy =
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
  | 'endDate'
  | 'userData';

export type DeleteTask = Task & {
  id: Scalars['ID'];
  type: TaskType;
  createdAt: Scalars['BigInt'];
  executedAt?: Maybe<Scalars['BigInt']>;
  executionAt: Scalars['BigInt'];
  expirationAt: Scalars['BigInt'];
  cancelledAt?: Maybe<Scalars['BigInt']>;
  superToken: Scalars['Bytes'];
  sender: Scalars['Bytes'];
  receiver: Scalars['Bytes'];
};

export type DeleteTask_Filter = {
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
  createdAt?: InputMaybe<Scalars['BigInt']>;
  createdAt_not?: InputMaybe<Scalars['BigInt']>;
  createdAt_gt?: InputMaybe<Scalars['BigInt']>;
  createdAt_lt?: InputMaybe<Scalars['BigInt']>;
  createdAt_gte?: InputMaybe<Scalars['BigInt']>;
  createdAt_lte?: InputMaybe<Scalars['BigInt']>;
  createdAt_in?: InputMaybe<Array<Scalars['BigInt']>>;
  createdAt_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
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
  and?: InputMaybe<Array<InputMaybe<DeleteTask_Filter>>>;
  or?: InputMaybe<Array<InputMaybe<DeleteTask_Filter>>>;
};

export type DeleteTask_OrderBy =
  | 'id'
  | 'type'
  | 'createdAt'
  | 'executedAt'
  | 'executionAt'
  | 'expirationAt'
  | 'cancelledAt'
  | 'superToken'
  | 'sender'
  | 'receiver';

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

export type FlowScheduleCreatedEvent = Event & {
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
  startDateMaxDelay: Scalars['BigInt'];
  flowRate: Scalars['BigInt'];
  endDate: Scalars['BigInt'];
  startAmount: Scalars['BigInt'];
  userData: Scalars['Bytes'];
};

export type FlowScheduleCreatedEvent_Filter = {
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
  startDateMaxDelay?: InputMaybe<Scalars['BigInt']>;
  startDateMaxDelay_not?: InputMaybe<Scalars['BigInt']>;
  startDateMaxDelay_gt?: InputMaybe<Scalars['BigInt']>;
  startDateMaxDelay_lt?: InputMaybe<Scalars['BigInt']>;
  startDateMaxDelay_gte?: InputMaybe<Scalars['BigInt']>;
  startDateMaxDelay_lte?: InputMaybe<Scalars['BigInt']>;
  startDateMaxDelay_in?: InputMaybe<Array<Scalars['BigInt']>>;
  startDateMaxDelay_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
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
  startAmount?: InputMaybe<Scalars['BigInt']>;
  startAmount_not?: InputMaybe<Scalars['BigInt']>;
  startAmount_gt?: InputMaybe<Scalars['BigInt']>;
  startAmount_lt?: InputMaybe<Scalars['BigInt']>;
  startAmount_gte?: InputMaybe<Scalars['BigInt']>;
  startAmount_lte?: InputMaybe<Scalars['BigInt']>;
  startAmount_in?: InputMaybe<Array<Scalars['BigInt']>>;
  startAmount_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  userData?: InputMaybe<Scalars['Bytes']>;
  userData_not?: InputMaybe<Scalars['Bytes']>;
  userData_gt?: InputMaybe<Scalars['Bytes']>;
  userData_lt?: InputMaybe<Scalars['Bytes']>;
  userData_gte?: InputMaybe<Scalars['Bytes']>;
  userData_lte?: InputMaybe<Scalars['Bytes']>;
  userData_in?: InputMaybe<Array<Scalars['Bytes']>>;
  userData_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  userData_contains?: InputMaybe<Scalars['Bytes']>;
  userData_not_contains?: InputMaybe<Scalars['Bytes']>;
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<FlowScheduleCreatedEvent_Filter>>>;
  or?: InputMaybe<Array<InputMaybe<FlowScheduleCreatedEvent_Filter>>>;
};

export type FlowScheduleCreatedEvent_OrderBy =
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
  | 'startDateMaxDelay'
  | 'flowRate'
  | 'endDate'
  | 'startAmount'
  | 'userData';

export type FlowScheduleDeletedEvent = Event & {
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

export type FlowScheduleDeletedEvent_Filter = {
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
  and?: InputMaybe<Array<InputMaybe<FlowScheduleDeletedEvent_Filter>>>;
  or?: InputMaybe<Array<InputMaybe<FlowScheduleDeletedEvent_Filter>>>;
};

export type FlowScheduleDeletedEvent_OrderBy =
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

/** Defines the order direction, either ascending or descending */
export type OrderDirection =
  | 'asc'
  | 'desc';

export type Query = {
  flowScheduleCreatedEvent?: Maybe<FlowScheduleCreatedEvent>;
  flowScheduleCreatedEvents: Array<FlowScheduleCreatedEvent>;
  flowScheduleDeletedEvent?: Maybe<FlowScheduleDeletedEvent>;
  flowScheduleDeletedEvents: Array<FlowScheduleDeletedEvent>;
  createFlowExecutedEvent?: Maybe<CreateFlowExecutedEvent>;
  createFlowExecutedEvents: Array<CreateFlowExecutedEvent>;
  deleteFlowExecutedEvent?: Maybe<DeleteFlowExecutedEvent>;
  deleteFlowExecutedEvents: Array<DeleteFlowExecutedEvent>;
  tokenSenderReceiverCursor?: Maybe<TokenSenderReceiverCursor>;
  tokenSenderReceiverCursors: Array<TokenSenderReceiverCursor>;
  createTask?: Maybe<CreateTask>;
  createTasks: Array<CreateTask>;
  deleteTask?: Maybe<DeleteTask>;
  deleteTasks: Array<DeleteTask>;
  event?: Maybe<Event>;
  events: Array<Event>;
  task?: Maybe<Task>;
  tasks: Array<Task>;
  /** Access to subgraph metadata */
  _meta?: Maybe<_Meta_>;
};


export type QueryFlowScheduleCreatedEventArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_Height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryFlowScheduleCreatedEventsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<FlowScheduleCreatedEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<FlowScheduleCreatedEvent_Filter>;
  block?: InputMaybe<Block_Height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryFlowScheduleDeletedEventArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_Height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryFlowScheduleDeletedEventsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<FlowScheduleDeletedEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<FlowScheduleDeletedEvent_Filter>;
  block?: InputMaybe<Block_Height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryCreateFlowExecutedEventArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_Height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryCreateFlowExecutedEventsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<CreateFlowExecutedEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<CreateFlowExecutedEvent_Filter>;
  block?: InputMaybe<Block_Height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryDeleteFlowExecutedEventArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_Height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryDeleteFlowExecutedEventsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<DeleteFlowExecutedEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<DeleteFlowExecutedEvent_Filter>;
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


export type QueryCreateTaskArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_Height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryCreateTasksArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<CreateTask_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<CreateTask_Filter>;
  block?: InputMaybe<Block_Height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryDeleteTaskArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_Height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryDeleteTasksArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<DeleteTask_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<DeleteTask_Filter>;
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


export type Query_MetaArgs = {
  block?: InputMaybe<Block_Height>;
};

export type Subscription = {
  flowScheduleCreatedEvent?: Maybe<FlowScheduleCreatedEvent>;
  flowScheduleCreatedEvents: Array<FlowScheduleCreatedEvent>;
  flowScheduleDeletedEvent?: Maybe<FlowScheduleDeletedEvent>;
  flowScheduleDeletedEvents: Array<FlowScheduleDeletedEvent>;
  createFlowExecutedEvent?: Maybe<CreateFlowExecutedEvent>;
  createFlowExecutedEvents: Array<CreateFlowExecutedEvent>;
  deleteFlowExecutedEvent?: Maybe<DeleteFlowExecutedEvent>;
  deleteFlowExecutedEvents: Array<DeleteFlowExecutedEvent>;
  tokenSenderReceiverCursor?: Maybe<TokenSenderReceiverCursor>;
  tokenSenderReceiverCursors: Array<TokenSenderReceiverCursor>;
  createTask?: Maybe<CreateTask>;
  createTasks: Array<CreateTask>;
  deleteTask?: Maybe<DeleteTask>;
  deleteTasks: Array<DeleteTask>;
  event?: Maybe<Event>;
  events: Array<Event>;
  task?: Maybe<Task>;
  tasks: Array<Task>;
  /** Access to subgraph metadata */
  _meta?: Maybe<_Meta_>;
};


export type SubscriptionFlowScheduleCreatedEventArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_Height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionFlowScheduleCreatedEventsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<FlowScheduleCreatedEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<FlowScheduleCreatedEvent_Filter>;
  block?: InputMaybe<Block_Height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionFlowScheduleDeletedEventArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_Height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionFlowScheduleDeletedEventsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<FlowScheduleDeletedEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<FlowScheduleDeletedEvent_Filter>;
  block?: InputMaybe<Block_Height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionCreateFlowExecutedEventArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_Height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionCreateFlowExecutedEventsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<CreateFlowExecutedEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<CreateFlowExecutedEvent_Filter>;
  block?: InputMaybe<Block_Height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionDeleteFlowExecutedEventArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_Height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionDeleteFlowExecutedEventsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<DeleteFlowExecutedEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<DeleteFlowExecutedEvent_Filter>;
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


export type SubscriptionCreateTaskArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_Height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionCreateTasksArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<CreateTask_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<CreateTask_Filter>;
  block?: InputMaybe<Block_Height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionDeleteTaskArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_Height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionDeleteTasksArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<DeleteTask_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<DeleteTask_Filter>;
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


export type Subscription_MetaArgs = {
  block?: InputMaybe<Block_Height>;
};

export type Task = {
  id: Scalars['ID'];
  type: TaskType;
  createdAt: Scalars['BigInt'];
  executedAt?: Maybe<Scalars['BigInt']>;
  executionAt: Scalars['BigInt'];
  expirationAt: Scalars['BigInt'];
  cancelledAt?: Maybe<Scalars['BigInt']>;
  superToken: Scalars['Bytes'];
  sender: Scalars['Bytes'];
  receiver: Scalars['Bytes'];
};

export type TaskType =
  | 'CREATE_FLOW'
  | 'DELETE_FLOW';

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
  createdAt?: InputMaybe<Scalars['BigInt']>;
  createdAt_not?: InputMaybe<Scalars['BigInt']>;
  createdAt_gt?: InputMaybe<Scalars['BigInt']>;
  createdAt_lt?: InputMaybe<Scalars['BigInt']>;
  createdAt_gte?: InputMaybe<Scalars['BigInt']>;
  createdAt_lte?: InputMaybe<Scalars['BigInt']>;
  createdAt_in?: InputMaybe<Array<Scalars['BigInt']>>;
  createdAt_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
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
  and?: InputMaybe<Array<InputMaybe<Task_Filter>>>;
  or?: InputMaybe<Array<InputMaybe<Task_Filter>>>;
};

export type Task_OrderBy =
  | 'id'
  | 'type'
  | 'createdAt'
  | 'executedAt'
  | 'executionAt'
  | 'expirationAt'
  | 'cancelledAt'
  | 'superToken'
  | 'sender'
  | 'receiver';

export type TokenSenderReceiverCursor = {
  id: Scalars['String'];
  currentCreateFlowTask?: Maybe<CreateTask>;
  currentDeleteFlowTask?: Maybe<DeleteTask>;
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
  currentCreateFlowTask?: InputMaybe<Scalars['String']>;
  currentCreateFlowTask_not?: InputMaybe<Scalars['String']>;
  currentCreateFlowTask_gt?: InputMaybe<Scalars['String']>;
  currentCreateFlowTask_lt?: InputMaybe<Scalars['String']>;
  currentCreateFlowTask_gte?: InputMaybe<Scalars['String']>;
  currentCreateFlowTask_lte?: InputMaybe<Scalars['String']>;
  currentCreateFlowTask_in?: InputMaybe<Array<Scalars['String']>>;
  currentCreateFlowTask_not_in?: InputMaybe<Array<Scalars['String']>>;
  currentCreateFlowTask_contains?: InputMaybe<Scalars['String']>;
  currentCreateFlowTask_contains_nocase?: InputMaybe<Scalars['String']>;
  currentCreateFlowTask_not_contains?: InputMaybe<Scalars['String']>;
  currentCreateFlowTask_not_contains_nocase?: InputMaybe<Scalars['String']>;
  currentCreateFlowTask_starts_with?: InputMaybe<Scalars['String']>;
  currentCreateFlowTask_starts_with_nocase?: InputMaybe<Scalars['String']>;
  currentCreateFlowTask_not_starts_with?: InputMaybe<Scalars['String']>;
  currentCreateFlowTask_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  currentCreateFlowTask_ends_with?: InputMaybe<Scalars['String']>;
  currentCreateFlowTask_ends_with_nocase?: InputMaybe<Scalars['String']>;
  currentCreateFlowTask_not_ends_with?: InputMaybe<Scalars['String']>;
  currentCreateFlowTask_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  currentCreateFlowTask_?: InputMaybe<CreateTask_Filter>;
  currentDeleteFlowTask?: InputMaybe<Scalars['String']>;
  currentDeleteFlowTask_not?: InputMaybe<Scalars['String']>;
  currentDeleteFlowTask_gt?: InputMaybe<Scalars['String']>;
  currentDeleteFlowTask_lt?: InputMaybe<Scalars['String']>;
  currentDeleteFlowTask_gte?: InputMaybe<Scalars['String']>;
  currentDeleteFlowTask_lte?: InputMaybe<Scalars['String']>;
  currentDeleteFlowTask_in?: InputMaybe<Array<Scalars['String']>>;
  currentDeleteFlowTask_not_in?: InputMaybe<Array<Scalars['String']>>;
  currentDeleteFlowTask_contains?: InputMaybe<Scalars['String']>;
  currentDeleteFlowTask_contains_nocase?: InputMaybe<Scalars['String']>;
  currentDeleteFlowTask_not_contains?: InputMaybe<Scalars['String']>;
  currentDeleteFlowTask_not_contains_nocase?: InputMaybe<Scalars['String']>;
  currentDeleteFlowTask_starts_with?: InputMaybe<Scalars['String']>;
  currentDeleteFlowTask_starts_with_nocase?: InputMaybe<Scalars['String']>;
  currentDeleteFlowTask_not_starts_with?: InputMaybe<Scalars['String']>;
  currentDeleteFlowTask_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  currentDeleteFlowTask_ends_with?: InputMaybe<Scalars['String']>;
  currentDeleteFlowTask_ends_with_nocase?: InputMaybe<Scalars['String']>;
  currentDeleteFlowTask_not_ends_with?: InputMaybe<Scalars['String']>;
  currentDeleteFlowTask_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  currentDeleteFlowTask_?: InputMaybe<DeleteTask_Filter>;
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<TokenSenderReceiverCursor_Filter>>>;
  or?: InputMaybe<Array<InputMaybe<TokenSenderReceiverCursor_Filter>>>;
};

export type TokenSenderReceiverCursor_OrderBy =
  | 'id'
  | 'currentCreateFlowTask'
  | 'currentCreateFlowTask__id'
  | 'currentCreateFlowTask__type'
  | 'currentCreateFlowTask__createdAt'
  | 'currentCreateFlowTask__executedAt'
  | 'currentCreateFlowTask__executionAt'
  | 'currentCreateFlowTask__expirationAt'
  | 'currentCreateFlowTask__cancelledAt'
  | 'currentCreateFlowTask__superToken'
  | 'currentCreateFlowTask__sender'
  | 'currentCreateFlowTask__receiver'
  | 'currentCreateFlowTask__startDate'
  | 'currentCreateFlowTask__startDateMaxDelay'
  | 'currentCreateFlowTask__startAmount'
  | 'currentCreateFlowTask__flowRate'
  | 'currentDeleteFlowTask'
  | 'currentDeleteFlowTask__id'
  | 'currentDeleteFlowTask__type'
  | 'currentDeleteFlowTask__createdAt'
  | 'currentDeleteFlowTask__executedAt'
  | 'currentDeleteFlowTask__executionAt'
  | 'currentDeleteFlowTask__expirationAt'
  | 'currentDeleteFlowTask__cancelledAt'
  | 'currentDeleteFlowTask__superToken'
  | 'currentDeleteFlowTask__sender'
  | 'currentDeleteFlowTask__receiver';

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
  BigDecimal: ResolverTypeWrapper<Scalars['BigDecimal']>;
  BigInt: ResolverTypeWrapper<Scalars['BigInt']>;
  BlockChangedFilter: BlockChangedFilter;
  Block_height: Block_Height;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
  Bytes: ResolverTypeWrapper<Scalars['Bytes']>;
  CreateFlowExecutedEvent: ResolverTypeWrapper<CreateFlowExecutedEvent>;
  CreateFlowExecutedEvent_filter: CreateFlowExecutedEvent_Filter;
  CreateFlowExecutedEvent_orderBy: CreateFlowExecutedEvent_OrderBy;
  CreateTask: ResolverTypeWrapper<CreateTask>;
  CreateTask_filter: CreateTask_Filter;
  CreateTask_orderBy: CreateTask_OrderBy;
  DeleteFlowExecutedEvent: ResolverTypeWrapper<DeleteFlowExecutedEvent>;
  DeleteFlowExecutedEvent_filter: DeleteFlowExecutedEvent_Filter;
  DeleteFlowExecutedEvent_orderBy: DeleteFlowExecutedEvent_OrderBy;
  DeleteTask: ResolverTypeWrapper<DeleteTask>;
  DeleteTask_filter: DeleteTask_Filter;
  DeleteTask_orderBy: DeleteTask_OrderBy;
  Event: ResolversTypes['CreateFlowExecutedEvent'] | ResolversTypes['DeleteFlowExecutedEvent'] | ResolversTypes['FlowScheduleCreatedEvent'] | ResolversTypes['FlowScheduleDeletedEvent'];
  Event_filter: Event_Filter;
  Event_orderBy: Event_OrderBy;
  Float: ResolverTypeWrapper<Scalars['Float']>;
  FlowScheduleCreatedEvent: ResolverTypeWrapper<FlowScheduleCreatedEvent>;
  FlowScheduleCreatedEvent_filter: FlowScheduleCreatedEvent_Filter;
  FlowScheduleCreatedEvent_orderBy: FlowScheduleCreatedEvent_OrderBy;
  FlowScheduleDeletedEvent: ResolverTypeWrapper<FlowScheduleDeletedEvent>;
  FlowScheduleDeletedEvent_filter: FlowScheduleDeletedEvent_Filter;
  FlowScheduleDeletedEvent_orderBy: FlowScheduleDeletedEvent_OrderBy;
  ID: ResolverTypeWrapper<Scalars['ID']>;
  Int: ResolverTypeWrapper<Scalars['Int']>;
  Int8: ResolverTypeWrapper<Scalars['Int8']>;
  OrderDirection: OrderDirection;
  Query: ResolverTypeWrapper<{}>;
  String: ResolverTypeWrapper<Scalars['String']>;
  Subscription: ResolverTypeWrapper<{}>;
  Task: ResolversTypes['CreateTask'] | ResolversTypes['DeleteTask'];
  TaskType: TaskType;
  Task_filter: Task_Filter;
  Task_orderBy: Task_OrderBy;
  TokenSenderReceiverCursor: ResolverTypeWrapper<TokenSenderReceiverCursor>;
  TokenSenderReceiverCursor_filter: TokenSenderReceiverCursor_Filter;
  TokenSenderReceiverCursor_orderBy: TokenSenderReceiverCursor_OrderBy;
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
  CreateFlowExecutedEvent: CreateFlowExecutedEvent;
  CreateFlowExecutedEvent_filter: CreateFlowExecutedEvent_Filter;
  CreateTask: CreateTask;
  CreateTask_filter: CreateTask_Filter;
  DeleteFlowExecutedEvent: DeleteFlowExecutedEvent;
  DeleteFlowExecutedEvent_filter: DeleteFlowExecutedEvent_Filter;
  DeleteTask: DeleteTask;
  DeleteTask_filter: DeleteTask_Filter;
  Event: ResolversParentTypes['CreateFlowExecutedEvent'] | ResolversParentTypes['DeleteFlowExecutedEvent'] | ResolversParentTypes['FlowScheduleCreatedEvent'] | ResolversParentTypes['FlowScheduleDeletedEvent'];
  Event_filter: Event_Filter;
  Float: Scalars['Float'];
  FlowScheduleCreatedEvent: FlowScheduleCreatedEvent;
  FlowScheduleCreatedEvent_filter: FlowScheduleCreatedEvent_Filter;
  FlowScheduleDeletedEvent: FlowScheduleDeletedEvent;
  FlowScheduleDeletedEvent_filter: FlowScheduleDeletedEvent_Filter;
  ID: Scalars['ID'];
  Int: Scalars['Int'];
  Int8: Scalars['Int8'];
  Query: {};
  String: Scalars['String'];
  Subscription: {};
  Task: ResolversParentTypes['CreateTask'] | ResolversParentTypes['DeleteTask'];
  Task_filter: Task_Filter;
  TokenSenderReceiverCursor: TokenSenderReceiverCursor;
  TokenSenderReceiverCursor_filter: TokenSenderReceiverCursor_Filter;
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

export type CreateFlowExecutedEventResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['CreateFlowExecutedEvent'] = ResolversParentTypes['CreateFlowExecutedEvent']> = ResolversObject<{
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
  startDateMaxDelay?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  flowRate?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  startAmount?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  userData?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type CreateTaskResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['CreateTask'] = ResolversParentTypes['CreateTask']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['TaskType'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  executedAt?: Resolver<Maybe<ResolversTypes['BigInt']>, ParentType, ContextType>;
  executionAt?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  expirationAt?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  cancelledAt?: Resolver<Maybe<ResolversTypes['BigInt']>, ParentType, ContextType>;
  superToken?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  sender?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  receiver?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  startDate?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  startDateMaxDelay?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  startAmount?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  flowRate?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type DeleteFlowExecutedEventResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['DeleteFlowExecutedEvent'] = ResolversParentTypes['DeleteFlowExecutedEvent']> = ResolversObject<{
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
  endDate?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  userData?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type DeleteTaskResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['DeleteTask'] = ResolversParentTypes['DeleteTask']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['TaskType'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  executedAt?: Resolver<Maybe<ResolversTypes['BigInt']>, ParentType, ContextType>;
  executionAt?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  expirationAt?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  cancelledAt?: Resolver<Maybe<ResolversTypes['BigInt']>, ParentType, ContextType>;
  superToken?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  sender?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  receiver?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type EventResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['Event'] = ResolversParentTypes['Event']> = ResolversObject<{
  __resolveType: TypeResolveFn<'CreateFlowExecutedEvent' | 'DeleteFlowExecutedEvent' | 'FlowScheduleCreatedEvent' | 'FlowScheduleDeletedEvent', ParentType, ContextType>;
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

export type FlowScheduleCreatedEventResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['FlowScheduleCreatedEvent'] = ResolversParentTypes['FlowScheduleCreatedEvent']> = ResolversObject<{
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
  startDateMaxDelay?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  flowRate?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  endDate?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  startAmount?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  userData?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type FlowScheduleDeletedEventResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['FlowScheduleDeletedEvent'] = ResolversParentTypes['FlowScheduleDeletedEvent']> = ResolversObject<{
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

export interface Int8ScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Int8'], any> {
  name: 'Int8';
}

export type QueryResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = ResolversObject<{
  flowScheduleCreatedEvent?: Resolver<Maybe<ResolversTypes['FlowScheduleCreatedEvent']>, ParentType, ContextType, RequireFields<QueryFlowScheduleCreatedEventArgs, 'id' | 'subgraphError'>>;
  flowScheduleCreatedEvents?: Resolver<Array<ResolversTypes['FlowScheduleCreatedEvent']>, ParentType, ContextType, RequireFields<QueryFlowScheduleCreatedEventsArgs, 'skip' | 'first' | 'subgraphError'>>;
  flowScheduleDeletedEvent?: Resolver<Maybe<ResolversTypes['FlowScheduleDeletedEvent']>, ParentType, ContextType, RequireFields<QueryFlowScheduleDeletedEventArgs, 'id' | 'subgraphError'>>;
  flowScheduleDeletedEvents?: Resolver<Array<ResolversTypes['FlowScheduleDeletedEvent']>, ParentType, ContextType, RequireFields<QueryFlowScheduleDeletedEventsArgs, 'skip' | 'first' | 'subgraphError'>>;
  createFlowExecutedEvent?: Resolver<Maybe<ResolversTypes['CreateFlowExecutedEvent']>, ParentType, ContextType, RequireFields<QueryCreateFlowExecutedEventArgs, 'id' | 'subgraphError'>>;
  createFlowExecutedEvents?: Resolver<Array<ResolversTypes['CreateFlowExecutedEvent']>, ParentType, ContextType, RequireFields<QueryCreateFlowExecutedEventsArgs, 'skip' | 'first' | 'subgraphError'>>;
  deleteFlowExecutedEvent?: Resolver<Maybe<ResolversTypes['DeleteFlowExecutedEvent']>, ParentType, ContextType, RequireFields<QueryDeleteFlowExecutedEventArgs, 'id' | 'subgraphError'>>;
  deleteFlowExecutedEvents?: Resolver<Array<ResolversTypes['DeleteFlowExecutedEvent']>, ParentType, ContextType, RequireFields<QueryDeleteFlowExecutedEventsArgs, 'skip' | 'first' | 'subgraphError'>>;
  tokenSenderReceiverCursor?: Resolver<Maybe<ResolversTypes['TokenSenderReceiverCursor']>, ParentType, ContextType, RequireFields<QueryTokenSenderReceiverCursorArgs, 'id' | 'subgraphError'>>;
  tokenSenderReceiverCursors?: Resolver<Array<ResolversTypes['TokenSenderReceiverCursor']>, ParentType, ContextType, RequireFields<QueryTokenSenderReceiverCursorsArgs, 'skip' | 'first' | 'subgraphError'>>;
  createTask?: Resolver<Maybe<ResolversTypes['CreateTask']>, ParentType, ContextType, RequireFields<QueryCreateTaskArgs, 'id' | 'subgraphError'>>;
  createTasks?: Resolver<Array<ResolversTypes['CreateTask']>, ParentType, ContextType, RequireFields<QueryCreateTasksArgs, 'skip' | 'first' | 'subgraphError'>>;
  deleteTask?: Resolver<Maybe<ResolversTypes['DeleteTask']>, ParentType, ContextType, RequireFields<QueryDeleteTaskArgs, 'id' | 'subgraphError'>>;
  deleteTasks?: Resolver<Array<ResolversTypes['DeleteTask']>, ParentType, ContextType, RequireFields<QueryDeleteTasksArgs, 'skip' | 'first' | 'subgraphError'>>;
  event?: Resolver<Maybe<ResolversTypes['Event']>, ParentType, ContextType, RequireFields<QueryEventArgs, 'id' | 'subgraphError'>>;
  events?: Resolver<Array<ResolversTypes['Event']>, ParentType, ContextType, RequireFields<QueryEventsArgs, 'skip' | 'first' | 'subgraphError'>>;
  task?: Resolver<Maybe<ResolversTypes['Task']>, ParentType, ContextType, RequireFields<QueryTaskArgs, 'id' | 'subgraphError'>>;
  tasks?: Resolver<Array<ResolversTypes['Task']>, ParentType, ContextType, RequireFields<QueryTasksArgs, 'skip' | 'first' | 'subgraphError'>>;
  _meta?: Resolver<Maybe<ResolversTypes['_Meta_']>, ParentType, ContextType, Partial<Query_MetaArgs>>;
}>;

export type SubscriptionResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['Subscription'] = ResolversParentTypes['Subscription']> = ResolversObject<{
  flowScheduleCreatedEvent?: SubscriptionResolver<Maybe<ResolversTypes['FlowScheduleCreatedEvent']>, "flowScheduleCreatedEvent", ParentType, ContextType, RequireFields<SubscriptionFlowScheduleCreatedEventArgs, 'id' | 'subgraphError'>>;
  flowScheduleCreatedEvents?: SubscriptionResolver<Array<ResolversTypes['FlowScheduleCreatedEvent']>, "flowScheduleCreatedEvents", ParentType, ContextType, RequireFields<SubscriptionFlowScheduleCreatedEventsArgs, 'skip' | 'first' | 'subgraphError'>>;
  flowScheduleDeletedEvent?: SubscriptionResolver<Maybe<ResolversTypes['FlowScheduleDeletedEvent']>, "flowScheduleDeletedEvent", ParentType, ContextType, RequireFields<SubscriptionFlowScheduleDeletedEventArgs, 'id' | 'subgraphError'>>;
  flowScheduleDeletedEvents?: SubscriptionResolver<Array<ResolversTypes['FlowScheduleDeletedEvent']>, "flowScheduleDeletedEvents", ParentType, ContextType, RequireFields<SubscriptionFlowScheduleDeletedEventsArgs, 'skip' | 'first' | 'subgraphError'>>;
  createFlowExecutedEvent?: SubscriptionResolver<Maybe<ResolversTypes['CreateFlowExecutedEvent']>, "createFlowExecutedEvent", ParentType, ContextType, RequireFields<SubscriptionCreateFlowExecutedEventArgs, 'id' | 'subgraphError'>>;
  createFlowExecutedEvents?: SubscriptionResolver<Array<ResolversTypes['CreateFlowExecutedEvent']>, "createFlowExecutedEvents", ParentType, ContextType, RequireFields<SubscriptionCreateFlowExecutedEventsArgs, 'skip' | 'first' | 'subgraphError'>>;
  deleteFlowExecutedEvent?: SubscriptionResolver<Maybe<ResolversTypes['DeleteFlowExecutedEvent']>, "deleteFlowExecutedEvent", ParentType, ContextType, RequireFields<SubscriptionDeleteFlowExecutedEventArgs, 'id' | 'subgraphError'>>;
  deleteFlowExecutedEvents?: SubscriptionResolver<Array<ResolversTypes['DeleteFlowExecutedEvent']>, "deleteFlowExecutedEvents", ParentType, ContextType, RequireFields<SubscriptionDeleteFlowExecutedEventsArgs, 'skip' | 'first' | 'subgraphError'>>;
  tokenSenderReceiverCursor?: SubscriptionResolver<Maybe<ResolversTypes['TokenSenderReceiverCursor']>, "tokenSenderReceiverCursor", ParentType, ContextType, RequireFields<SubscriptionTokenSenderReceiverCursorArgs, 'id' | 'subgraphError'>>;
  tokenSenderReceiverCursors?: SubscriptionResolver<Array<ResolversTypes['TokenSenderReceiverCursor']>, "tokenSenderReceiverCursors", ParentType, ContextType, RequireFields<SubscriptionTokenSenderReceiverCursorsArgs, 'skip' | 'first' | 'subgraphError'>>;
  createTask?: SubscriptionResolver<Maybe<ResolversTypes['CreateTask']>, "createTask", ParentType, ContextType, RequireFields<SubscriptionCreateTaskArgs, 'id' | 'subgraphError'>>;
  createTasks?: SubscriptionResolver<Array<ResolversTypes['CreateTask']>, "createTasks", ParentType, ContextType, RequireFields<SubscriptionCreateTasksArgs, 'skip' | 'first' | 'subgraphError'>>;
  deleteTask?: SubscriptionResolver<Maybe<ResolversTypes['DeleteTask']>, "deleteTask", ParentType, ContextType, RequireFields<SubscriptionDeleteTaskArgs, 'id' | 'subgraphError'>>;
  deleteTasks?: SubscriptionResolver<Array<ResolversTypes['DeleteTask']>, "deleteTasks", ParentType, ContextType, RequireFields<SubscriptionDeleteTasksArgs, 'skip' | 'first' | 'subgraphError'>>;
  event?: SubscriptionResolver<Maybe<ResolversTypes['Event']>, "event", ParentType, ContextType, RequireFields<SubscriptionEventArgs, 'id' | 'subgraphError'>>;
  events?: SubscriptionResolver<Array<ResolversTypes['Event']>, "events", ParentType, ContextType, RequireFields<SubscriptionEventsArgs, 'skip' | 'first' | 'subgraphError'>>;
  task?: SubscriptionResolver<Maybe<ResolversTypes['Task']>, "task", ParentType, ContextType, RequireFields<SubscriptionTaskArgs, 'id' | 'subgraphError'>>;
  tasks?: SubscriptionResolver<Array<ResolversTypes['Task']>, "tasks", ParentType, ContextType, RequireFields<SubscriptionTasksArgs, 'skip' | 'first' | 'subgraphError'>>;
  _meta?: SubscriptionResolver<Maybe<ResolversTypes['_Meta_']>, "_meta", ParentType, ContextType, Partial<Subscription_MetaArgs>>;
}>;

export type TaskResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['Task'] = ResolversParentTypes['Task']> = ResolversObject<{
  __resolveType: TypeResolveFn<'CreateTask' | 'DeleteTask', ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['TaskType'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  executedAt?: Resolver<Maybe<ResolversTypes['BigInt']>, ParentType, ContextType>;
  executionAt?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  expirationAt?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  cancelledAt?: Resolver<Maybe<ResolversTypes['BigInt']>, ParentType, ContextType>;
  superToken?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  sender?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  receiver?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
}>;

export type TokenSenderReceiverCursorResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['TokenSenderReceiverCursor'] = ResolversParentTypes['TokenSenderReceiverCursor']> = ResolversObject<{
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  currentCreateFlowTask?: Resolver<Maybe<ResolversTypes['CreateTask']>, ParentType, ContextType>;
  currentDeleteFlowTask?: Resolver<Maybe<ResolversTypes['DeleteTask']>, ParentType, ContextType>;
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
  BigDecimal?: GraphQLScalarType;
  BigInt?: GraphQLScalarType;
  Bytes?: GraphQLScalarType;
  CreateFlowExecutedEvent?: CreateFlowExecutedEventResolvers<ContextType>;
  CreateTask?: CreateTaskResolvers<ContextType>;
  DeleteFlowExecutedEvent?: DeleteFlowExecutedEventResolvers<ContextType>;
  DeleteTask?: DeleteTaskResolvers<ContextType>;
  Event?: EventResolvers<ContextType>;
  FlowScheduleCreatedEvent?: FlowScheduleCreatedEventResolvers<ContextType>;
  FlowScheduleDeletedEvent?: FlowScheduleDeletedEventResolvers<ContextType>;
  Int8?: GraphQLScalarType;
  Query?: QueryResolvers<ContextType>;
  Subscription?: SubscriptionResolvers<ContextType>;
  Task?: TaskResolvers<ContextType>;
  TokenSenderReceiverCursor?: TokenSenderReceiverCursorResolvers<ContextType>;
  _Block_?: _Block_Resolvers<ContextType>;
  _Meta_?: _Meta_Resolvers<ContextType>;
}>;

export type DirectiveResolvers<ContextType = MeshContext> = ResolversObject<{
  entity?: EntityDirectiveResolver<any, any, ContextType>;
  subgraphId?: SubgraphIdDirectiveResolver<any, any, ContextType>;
  derivedFrom?: DerivedFromDirectiveResolver<any, any, ContextType>;
}>;

export type MeshContext = SchedulingTypes.Context & BaseMeshContext;


import { fileURLToPath } from '@graphql-mesh/utils';
const baseDir = pathModule.join(pathModule.dirname(fileURLToPath(import.meta.url)), '..');

const importFn: ImportFn = <T>(moduleId: string) => {
  const relativeModuleId = (pathModule.isAbsolute(moduleId) ? pathModule.relative(baseDir, moduleId) : moduleId).split('\\').join('/').replace(baseDir + '/', '');
  switch(relativeModuleId) {
    case ".graphclient/sources/scheduling/introspectionSchema":
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
const schedulingTransforms = [];
const additionalTypeDefs = [] as any[];
const schedulingHandler = new GraphqlHandler({
              name: "scheduling",
              config: {"endpoint":"{context.url:https://api.thegraph.com/subgraphs/name/superfluid-finance/scheduling-v1-eth-goerli}","retry":5},
              baseDir,
              cache,
              pubsub,
              store: sourcesStore.child("scheduling"),
              logger: logger.child("scheduling"),
              importFn,
            });
sources[0] = {
          name: 'scheduling',
          handler: schedulingHandler,
          transforms: schedulingTransforms
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
        document: GetTasksDocument,
        get rawSDL() {
          return printWithCache(GetTasksDocument);
        },
        location: 'GetTasksDocument.graphql'
      },{
        document: GetCreateTasksDocument,
        get rawSDL() {
          return printWithCache(GetCreateTasksDocument);
        },
        location: 'GetCreateTasksDocument.graphql'
      },{
        document: GetDeleteTasksDocument,
        get rawSDL() {
          return printWithCache(GetDeleteTasksDocument);
        },
        location: 'GetDeleteTasksDocument.graphql'
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


export type PollQuery = { events: Array<Pick<CreateFlowExecutedEvent, 'order'> | Pick<DeleteFlowExecutedEvent, 'order'> | Pick<FlowScheduleCreatedEvent, 'order'> | Pick<FlowScheduleDeletedEvent, 'order'>> };

export type GetTasksQueryVariables = Exact<{
  where?: InputMaybe<Task_Filter>;
  orderBy?: InputMaybe<Task_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
}>;


export type GetTasksQuery = { tasks: Array<(
    { __typename: 'CreateTask' }
    & Pick<CreateTask, 'superToken' | 'startDateMaxDelay' | 'startDate' | 'startAmount' | 'sender' | 'receiver' | 'id' | 'flowRate' | 'expirationAt' | 'executionAt' | 'executedAt' | 'cancelledAt'>
  ) | (
    { __typename: 'DeleteTask' }
    & Pick<DeleteTask, 'id' | 'cancelledAt' | 'executedAt' | 'executionAt' | 'expirationAt' | 'receiver' | 'sender' | 'superToken'>
  )> };

export type GetCreateTasksQueryVariables = Exact<{
  where?: InputMaybe<CreateTask_Filter>;
  orderBy?: InputMaybe<CreateTask_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
}>;


export type GetCreateTasksQuery = { createTasks: Array<Pick<CreateTask, 'superToken' | 'startDateMaxDelay' | 'startDate' | 'startAmount' | 'sender' | 'receiver' | 'id' | 'flowRate' | 'expirationAt' | 'executionAt' | 'executedAt' | 'cancelledAt'>> };

export type GetDeleteTasksQueryVariables = Exact<{
  where?: InputMaybe<DeleteTask_Filter>;
  orderBy?: InputMaybe<DeleteTask_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
}>;


export type GetDeleteTasksQuery = { deleteTasks: Array<Pick<DeleteTask, 'id' | 'cancelledAt' | 'executedAt' | 'executionAt' | 'expirationAt' | 'receiver' | 'sender' | 'superToken'>> };


export const PollDocument = gql`
    query poll($block: Block_height!) {
  events(block: $block, first: 1) {
    order
  }
}
    ` as unknown as DocumentNode<PollQuery, PollQueryVariables>;
export const GetTasksDocument = gql`
    query getTasks($where: Task_filter = {}, $orderBy: Task_orderBy = id, $orderDirection: OrderDirection = asc) {
  tasks(
    first: 1000
    orderBy: $orderBy
    orderDirection: $orderDirection
    where: $where
  ) {
    __typename
    ... on CreateTask {
      superToken
      startDateMaxDelay
      startDate
      startAmount
      sender
      receiver
      id
      flowRate
      expirationAt
      executionAt
      executedAt
      cancelledAt
    }
    ... on DeleteTask {
      id
      cancelledAt
      executedAt
      executionAt
      expirationAt
      receiver
      sender
      superToken
    }
  }
}
    ` as unknown as DocumentNode<GetTasksQuery, GetTasksQueryVariables>;
export const GetCreateTasksDocument = gql`
    query getCreateTasks($where: CreateTask_filter = {}, $orderBy: CreateTask_orderBy = id, $orderDirection: OrderDirection = asc) {
  createTasks(
    first: 1000
    orderBy: $orderBy
    orderDirection: $orderDirection
    where: $where
  ) {
    ... on CreateTask {
      superToken
      startDateMaxDelay
      startDate
      startAmount
      sender
      receiver
      id
      flowRate
      expirationAt
      executionAt
      executedAt
      cancelledAt
    }
  }
}
    ` as unknown as DocumentNode<GetCreateTasksQuery, GetCreateTasksQueryVariables>;
export const GetDeleteTasksDocument = gql`
    query getDeleteTasks($where: DeleteTask_filter = {}, $orderBy: DeleteTask_orderBy = id, $orderDirection: OrderDirection = asc) {
  deleteTasks(
    first: 1000
    orderBy: $orderBy
    orderDirection: $orderDirection
    where: $where
  ) {
    ... on DeleteTask {
      id
      cancelledAt
      executedAt
      executionAt
      expirationAt
      receiver
      sender
      superToken
    }
  }
}
    ` as unknown as DocumentNode<GetDeleteTasksQuery, GetDeleteTasksQueryVariables>;





export type Requester<C = {}, E = unknown> = <R, V>(doc: DocumentNode, vars?: V, options?: C) => Promise<R> | AsyncIterable<R>
export function getSdk<C, E>(requester: Requester<C, E>) {
  return {
    poll(variables: PollQueryVariables, options?: C): Promise<PollQuery> {
      return requester<PollQuery, PollQueryVariables>(PollDocument, variables, options) as Promise<PollQuery>;
    },
    getTasks(variables?: GetTasksQueryVariables, options?: C): Promise<GetTasksQuery> {
      return requester<GetTasksQuery, GetTasksQueryVariables>(GetTasksDocument, variables, options) as Promise<GetTasksQuery>;
    },
    getCreateTasks(variables?: GetCreateTasksQueryVariables, options?: C): Promise<GetCreateTasksQuery> {
      return requester<GetCreateTasksQuery, GetCreateTasksQueryVariables>(GetCreateTasksDocument, variables, options) as Promise<GetCreateTasksQuery>;
    },
    getDeleteTasks(variables?: GetDeleteTasksQueryVariables, options?: C): Promise<GetDeleteTasksQuery> {
      return requester<GetDeleteTasksQuery, GetDeleteTasksQueryVariables>(GetDeleteTasksDocument, variables, options) as Promise<GetDeleteTasksQuery>;
    }
  };
}
export type Sdk = ReturnType<typeof getSdk>;