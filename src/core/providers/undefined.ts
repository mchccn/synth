import { ValidationNode } from "./node.js";

export class UndefinedNode extends ValidationNode<undefined> {
    constructor() {
        super();
    }

    check(value: unknown) {
        return typeof value === "undefined" && this.satisfied(value as any);
    }
}
