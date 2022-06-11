import { synthesizedCheckKey } from "../core/shared/constants.js";
import type { Synthesized } from "../core/synthesize.js";

export function paths(pattern: Synthesized, target: unknown) {
    const check = Reflect.get(pattern, Symbol.for(synthesizedCheckKey)).bind(pattern);

    return (function walk(target, path): string[][] {
        if (check(target)) return [path];

        if (target && typeof target === "object") {
            const paths = [];

            for (const [index, element] of Object.entries(target)) {
                if (check(element)) paths.push([...path, index]);
                else paths.push(...walk(element, [...path, index]));
            }

            return paths;
        }

        return [];
    })(target, [] as string[]);
}
