import { BigIntNode } from "../providers/bigint.js";
import { createBaseProvider } from "./generators.js";

export const bigint = createBaseProvider({
    identifier: "bigint",
    defaultAndExpectedArgs: {},
    executor: () => new BigIntNode(),
    compile: () => `new BigIntNode()`,
    types: () => `BigIntNode`,
    getLints: () => [],
});
