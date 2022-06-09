import { StringNode } from "../providers/string.js";
import { createBaseProvider } from "./generators.js";

export const string = createBaseProvider({
    identifier: "string",
    defaultAndExpectedArgs: { boxed: false },
    executor: ({ boxed }) => {
        return new StringNode(boxed);
    },
    getLints: () => [],
});
