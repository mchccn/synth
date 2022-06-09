import { ValidationNode } from "./node.js";

export class BigIntNode extends ValidationNode<bigint> {
    constructor() {
        super();
    }

    check(value: unknown) {
        return typeof value === "bigint" && this.satisfied(value as any);
    }
}
