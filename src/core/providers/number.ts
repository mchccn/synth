import { ValidationNode } from "./node.js";

export class NumberNode<Like extends boolean> extends ValidationNode<Like extends true ? number | Number : number> {
    constructor(readonly like: Like) {
        super();
    }

    check(value: unknown) {
        return this.like
            ? value instanceof Number || typeof value === "number"
            : typeof value === "number" && this.satisfied(value as any);
    }
}
