import type { ValidationNode } from "../core/providers/node.js";
import type { Synthesized } from "../core/synthesize.js";
import { find } from "./find.js";

export function replace<T extends ValidationNode>(
    pattern: Synthesized<T>,
    target: unknown,
    replacer: (parent: unknown, key: string | undefined) => unknown,
) {
    const matches = find(pattern, target);

    matches.forEach(replacer);

    return target;
}
