import type { ValidationNode } from "../core/providers/node.js";
import type { Synthesized } from "../core/synthesize.js";
import type { GetNodeType } from "../types.js";
import { paths } from "./paths.js";
import { retreive } from "./retreive.js";

export function find<N extends ValidationNode>(pattern: Synthesized<N>, target: unknown) {
    const results = paths(pattern, target);

    return results.map(
        (route) =>
            [retreive<GetNodeType<N>>(target, route.slice(0, -1)), route[route.length - 1]] as [
                parent: unknown,
                key: string | undefined,
            ],
    );
}
