import { ValidationNode } from "./node.js";

export class BooleanNode<Like extends boolean> extends ValidationNode<Like extends true ? boolean | Boolean : boolean> {
    constructor(readonly like: Like) {
        super();
    }

    check(value: unknown) {
        return this.like
            ? (value instanceof Boolean || typeof value === "boolean") && this.satisfied(value as any)
            : typeof value === "boolean" && this.satisfied(value as any);
    }
}
