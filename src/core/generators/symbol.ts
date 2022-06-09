import { SymbolNode } from "../providers/symbol.js";
import { createBaseProvider } from "./generators.js";

export const symbol = createBaseProvider({
    identifier: "symbol",
    defaultAndExpectedArgs: {},
    executor: () => new SymbolNode(),
    compile: () => `new SymbolNode()`,
    types: () => `SymbolNode`,
    getLints: () => [],
});
