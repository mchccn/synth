import { BooleanNode } from "../providers/boolean.js";
import { createBaseProvider } from "./generators.js";

export const boolean = createBaseProvider({
    identifier: "boolean",
    defaultAndExpectedArgs: { boxed: false },
    executor: ({ boxed }) => new BooleanNode(boxed),
    compile: (args) => `new BooleanNode(${args.boxed})`,
    getLints: () => [],
});
