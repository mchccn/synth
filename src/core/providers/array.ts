import type { GetNodeType } from "../../types.js";
import { ValidationNode } from "./node.js";

export class ArrayNode<Element extends ValidationNode> extends ValidationNode<GetNodeType<Element>[]> {
    constructor(readonly module: Element) {
        super();
    }

    check(value: unknown) {
        return Array.isArray(value) && value.every((e) => this.module.check(e)) && this.satisfied(value as any);
    }
}
