import type { ValidationNode } from "../core/providers/node.js";
import type { Synthesized } from "../core/synthesize.js";
import { find } from "./find.js";

export function replace<N extends ValidationNode>(
    pattern: Synthesized<N>,
    target: unknown,
    replacer: (parent: unknown, key: string | undefined) => unknown,
) {
    const matches = find(pattern, target);

    matches.forEach(([parent, key]) => replacer(parent, key));

    return target;
}
