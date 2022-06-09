import { ValidationNode } from "./node.js";

export class NoopNode extends ValidationNode<any> {
    constructor() {
        super();
    }

    check(value: unknown) {
        return true;
    }
}
