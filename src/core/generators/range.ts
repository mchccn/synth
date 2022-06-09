import { RangeConstraint } from "../validators/range.js";
import { createProviderExtension, lintsPipe, requiredArgs } from "./generators.js";

export const range = createProviderExtension({
    defaultAndExpectedArgs: {
        start: 0,
        end: 0,
        exclusive: false,
    },
    executor: (node, args) => node.constraint(new RangeConstraint(args)),
    compile: (args) => `new RangeConstraint(${JSON.stringify(args)})`,
    getLints: lintsPipe(requiredArgs(["start", "end"])),
    preferredProviders: ["number"],
});
