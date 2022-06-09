import { ValidationNode } from "./node.js";

export class FunctionNode extends ValidationNode<(...args: any[]) => any> {
    constructor() {
        super();
    }

    check(value: unknown) {
        return typeof value === "function" && this.satisfied(value as any);
    }
}
