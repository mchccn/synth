import { ObjectNode } from "../core/providers/object.js";
import { synthesizedModuleKey } from "../core/shared/constants.js";
import { Synthesized } from "../core/synthesize.js";
import type { Narrow } from "../core/types.js";

export const object = <T extends Record<string, Synthesized>>(spec: Narrow<T>) =>
    new Synthesized(
        new ObjectNode(
            Object.entries(spec).map(
                ([key, node]) => [key, Reflect.get(node, Symbol.for(synthesizedModuleKey)), false] as const,
            ),
        ),
    );
