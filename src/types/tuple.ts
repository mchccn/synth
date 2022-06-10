import { TupleNode } from "../core/providers/tuple.js";
import { Synthesized } from "../core/synthesize.js";
import type { Narrow } from "../core/types.js";

export const tuple = <T extends readonly Synthesized[]>(spec: Narrow<T>) =>
    new Synthesized(new TupleNode(spec.map((e) => Reflect.get(e, "module"))));
