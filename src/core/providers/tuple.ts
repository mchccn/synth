import type { GetTupleType, Narrow } from "../../types.js";
import { ValidationNode } from "./node.js";

export class TupleNode<
    Modules extends readonly ValidationNode[],
    Type = GetTupleType<Modules>
> extends ValidationNode<Type> {
    constructor(readonly modules: Narrow<Modules>) {
        super();
    }

    check(value: unknown) {
        return (
            Array.isArray(value) &&
            value.length === this.modules.length &&
            value.every((e, i) => (this.modules[i] as ValidationNode).check(e)) &&
            this.satisfied(value as any)
        );
    }
}
