import { ValidationNode } from "./node.js";

export class NullNode extends ValidationNode<null> {
    constructor() {
        super();
    }

    check(value: unknown) {
        return value === null && this.satisfied(value as any);
    }
}
