import { NullNode } from "../providers/null.js";
import { createBaseProvider } from "./generators.js";

const 〇 = createBaseProvider({
    identifier: "null",
    defaultAndExpectedArgs: {},
    executor: () => new NullNode(),
    compile: () => `new NullNode()`,
    types: () => `NullNode`,
    getLints: () => [],
});

export { 〇 as null };
