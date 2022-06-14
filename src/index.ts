import { synthesize } from "./core/synthesize.js";

//@ts-ignore
if (typeof process === "undefined") globalThis.process = { env: {} };

export * from "../precompiled.js";
export * from "./core/index.js";
export * as core from "./core/index.js";
export * from "./guards/index.js";
export * as guards from "./guards/index.js";
export * from "./matches/index.js";
export * as matches from "./matches/index.js";
export * from "./overloads/index.js";
export * as overloads from "./overloads/index.js";
export * from "./trees/index.js";
export * as trees from "./trees/index.js";
export * from "./types/index.js";
export * as types from "./types/index.js";

synthesize`{ foo: string; }[]`;
