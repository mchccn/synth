import { MaxConstraint } from "../validators/max.js";
import { createProviderExtension, lintsPipe, mutuallyExclusive } from "./generators.js";

export const max = createProviderExtension({
    defaultAndExpectedArgs: {
        length: Infinity,
        value: Infinity,
        exclusive: false,
    },
    executor: (node, args) => node.constraint(new MaxConstraint(args)),
    compile: (args) => `new MaxConstraint(${JSON.stringify(args)})`,
    getLints: lintsPipe(mutuallyExclusive("length", "value")),
    preferredProviders: ["number", "string"],
    preferredArgs: {
        number: ["value"],
        string: ["length"],
    },
});
