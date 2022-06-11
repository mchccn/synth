import { NumberNode } from "../core/providers/number.js";
import { Synthesized } from "../core/synthesize.js";

export const number = new Synthesized(new NumberNode(false));
