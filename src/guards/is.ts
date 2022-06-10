import type { ValidationNode } from "../core/providers/node.js";
import type { Synthesized } from "../core/synthesize.js";
import type { GetNodeType } from "../core/types.js";

export function is<T extends ValidationNode>(s: Synthesized<T>): (value: unknown) => value is GetNodeType<T>;
export function is<T extends ValidationNode>(s: Synthesized<T>, value: unknown): value is GetNodeType<T>;
export function is<T extends ValidationNode>(...args: [s: Synthesized<T>, value?: unknown]) {
    if (args.length === 1) return (value: unknown): value is GetNodeType<T> => Reflect.get(args[0], "check")(value);

    return Reflect.get(args[0], "check")(args[1]);
}
