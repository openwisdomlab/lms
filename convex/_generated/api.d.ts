/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

import type * as auth from "../auth.js";
import type * as challenges from "../challenges.js";
import type * as collaboration from "../collaboration.js";
import type * as events from "../events.js";
import type * as gamification from "../gamification.js";
import type * as http from "../http.js";
import type * as knowledgeGraph from "../knowledgeGraph.js";
import type * as microlearning from "../microlearning.js";
import type * as notifications from "../notifications.js";
import type * as profiles from "../profiles.js";
import type * as researchNodes from "../researchNodes.js";
import type * as versioning from "../versioning.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  challenges: typeof challenges;
  collaboration: typeof collaboration;
  events: typeof events;
  gamification: typeof gamification;
  http: typeof http;
  knowledgeGraph: typeof knowledgeGraph;
  microlearning: typeof microlearning;
  notifications: typeof notifications;
  profiles: typeof profiles;
  researchNodes: typeof researchNodes;
  versioning: typeof versioning;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
