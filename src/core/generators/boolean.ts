import { BooleanNode } from "../providers/boolean.js";
import { createBaseProvider } from "./generators.js";

export const boolean = createBaseProvider({
    identifier: "boolean",
    defaultAndExpectedArgs: { boxed: false },
    executor: ({ boxed }) => {
        return new BooleanNode(boxed);
    },
    getLints: () => [],
});
