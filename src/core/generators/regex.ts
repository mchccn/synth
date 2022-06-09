import { RegexConstraint } from "../validators/regex.js";
import { createProviderExtension, lintsPipe, requiredArgs } from "./generators.js";

export const regex = createProviderExtension({
    defaultAndExpectedArgs: {
        pattern: "",
        flags: "",
    },
    executor: (node, args) => node.constraint(new RegexConstraint(args)),
    compile: (args) => `new RegexConstraint(${JSON.stringify(args)})`,
    getLints: lintsPipe(requiredArgs(["pattern"])),
    preferredProviders: ["string"],
});
