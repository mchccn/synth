import { ValidationNode } from "./node.js";

export class StringNode<Like extends boolean> extends ValidationNode<Like extends true ? string | String : string> {
    constructor(readonly like: Like) {
        super();
    }

    check(value: unknown) {
        return this.like
            ? (value instanceof String || typeof value === "string") && this.satisfied(value as any)
            : typeof value === "string" && this.satisfied(value as any);
    }
}
