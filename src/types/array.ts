import { ArrayNode } from "../core/providers/array.js";
import { synthesizedModuleKey } from "../core/shared/constants.js";
import { Synthesized } from "../core/synthesize.js";

export const array = (node: Synthesized) =>
    new Synthesized(new ArrayNode(Reflect.get(node, Symbol.for(synthesizedModuleKey))));
