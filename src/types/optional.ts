import { OptionalNode } from "../core/providers/optional.js";
import { Synthesized } from "../core/synthesize.js";

export const optional = (node: Synthesized) => new Synthesized(new OptionalNode(Reflect.get(node, "module")));
