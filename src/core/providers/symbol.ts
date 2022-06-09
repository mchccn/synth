import { ValidationNode } from "./node.js";

export class SymbolNode extends ValidationNode<symbol> {
    constructor() {
        super();
    }

    check(value: unknown) {
        return typeof value === "symbol" && this.satisfied(value as any);
    }
}
