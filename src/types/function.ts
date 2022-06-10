import { FunctionNode } from "../core/providers/function.js";
import { Synthesized } from "../core/synthesize.js";

const λ = new Synthesized(new FunctionNode());

export { λ as function };
