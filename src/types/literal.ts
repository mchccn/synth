import { LiteralNode } from "../core/providers/literal.js";
import { Synthesized } from "../core/synthesize.js";

export const literal = <T>(value: T) => new Synthesized(new LiteralNode(value as any));
