import { MinConstraint } from "../validators/min.js";
import { createProviderExtension, lintsPipe, mutuallyExclusive } from "./generators.js";

export const min = createProviderExtension({
    defaultAndExpectedArgs: {
        length: 0,
        value: -Infinity,
        exclusive: false,
    },
    executor: (node, args) => {
        return node.constraint(new MinConstraint(args));
    },
    getLints: lintsPipe(mutuallyExclusive("length", "value")),
    preferredProviders: ["number", "string"],
    preferredArgs: {
        number: ["value"],
        string: ["length"],
    },
});
