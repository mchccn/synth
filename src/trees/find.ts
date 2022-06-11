import type { ValidationNode } from "../core/providers/node.js";
import type { Synthesized } from "../core/synthesize.js";
import type { GetNodeType } from "../types.js";
import { get } from "./get.js";
import { paths } from "./paths.js";

export function find<T extends ValidationNode>(pattern: Synthesized<T>, target: unknown) {
    const results = paths(pattern, target);

    return results.map(
        (route) =>
            [get<GetNodeType<T>>(target, route.slice(0, -1)), route[route.length - 1]] as [
                parent: unknown,
                key: string | undefined,
            ],
    );
}
