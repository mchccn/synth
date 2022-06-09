import { NumberNode } from "../providers/number.js";
import { createBaseProvider } from "./generators.js";

export const number = createBaseProvider({
    identifier: "number",
    defaultAndExpectedArgs: { boxed: false },
    executor: ({ boxed }) => new NumberNode(boxed),
    compile: (args) => `new NumberNode(${args.boxed})`,
    getLints: () => [],
});
