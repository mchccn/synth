import { MaxConstraint } from "../validators/max.js";
import { createProviderExtension, lintsPipe, mutuallyExclusive } from "./generators.js";

export const max = createProviderExtension({
    defaultAndExpectedArgs: {
        length: Infinity,
        value: Infinity,
        exclusive: false,
    },
    executor: (node, args) => {
        return node.constraint(new MaxConstraint(args));
    },
    getLints: lintsPipe(mutuallyExclusive("length", "value")),
    preferredProviders: ["number", "string"],
    preferredArgs: {
        number: ["value"],
        string: ["length"],
    },
});
