import { FunctionNode } from "../providers/function.js";
import { createBaseProvider } from "./generators.js";

const λ = createBaseProvider({
    identifier: "function",
    defaultAndExpectedArgs: {},
    executor: () => new FunctionNode(),
    compile: () => `new FunctionNode()`,
    types: () => `FunctionNode`,
    getLints: () => [],
});

export { λ as function };
