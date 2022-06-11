import type { Narrow } from "../../types.js";
import { ValidationNode } from "./node.js";

export class LiteralNode<Literal extends unknown> extends ValidationNode<Literal> {
    constructor(readonly value: Narrow<Literal>) {
        super();
    }

    check(value: unknown) {
        return value === this.value && this.satisfied(value as any);
    }
}
