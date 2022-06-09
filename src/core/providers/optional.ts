import type { GetNodeType } from "../types.js";
import { ValidationNode } from "./node.js";

export class OptionalNode<Target extends ValidationNode> extends ValidationNode<GetNodeType<Target> | undefined> {
    constructor(readonly target: Target) {
        super();
    }

    check(value: unknown) {
        return typeof value === "undefined" || this.target.check(value);
    }
}
