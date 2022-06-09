import { UndefinedNode } from "../providers/undefined.js";
import { createBaseProvider } from "./generators.js";

export const undefined = createBaseProvider({
    identifier: "null",
    defaultAndExpectedArgs: {},
    executor: () => new UndefinedNode(),
    compile: () => `new UndefinedNode()`,
    types: () => `UndefinedNode`,
    getLints: () => [],
});
