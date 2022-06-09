import { StringNode } from "../providers/string.js";
import { createBaseProvider } from "./generators.js";

export const string = createBaseProvider({
    identifier: "string",
    defaultAndExpectedArgs: { boxed: false },
    executor: ({ boxed }) => new StringNode(boxed),
    compile: (args) => `new StringNode(${args.boxed})`,
    types: (args) => `StringNode<${args.boxed}>`,
    getLints: () => [],
});
