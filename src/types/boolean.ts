import { BooleanNode } from "../core/providers/boolean.js";
import { Synthesized } from "../core/synthesize.js";

export const boolean = new Synthesized(new BooleanNode(false));
