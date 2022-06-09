import { ValidationNode } from "./node.js";

export class NotNode extends ValidationNode<unknown> {
    constructor(readonly module: ValidationNode) {
        super();
    }

    check(value: unknown) {
        return !this.module.check(value) && this.satisfied(value as any);
    }
}
