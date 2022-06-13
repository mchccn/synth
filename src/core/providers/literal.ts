import type { Narrow } from "../../types.js";
import { ValidationNode } from "./node.js";

export class LiteralNode<Literal extends unknown> extends ValidationNode<Literal> {
    constructor(readonly value: Narrow<Literal>) {
        super();
    }

    check(value: unknown) {
        if (Number.isNaN(this.value)) return Number.isNaN(value);

        return value === this.value && this.satisfied(value as any);
    }
}
