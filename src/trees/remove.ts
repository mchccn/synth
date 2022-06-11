import type { ValidationNode } from "../core/providers/node.js";
import type { Synthesized } from "../core/synthesize.js";
import { find } from "./find.js";

export function remove<N extends ValidationNode>(pattern: Synthesized<N>, target: unknown): unknown | undefined {
    const matches = find(pattern, target);

    let deleted = false;

    matches.forEach(([parent, key]) => (key ? delete (parent as object)[key as never] : (deleted = true)));

    return deleted ? undefined : target;
}
