import type { GetObjectType, Narrow } from "../../types.js";
import { ValidationNode } from "./node.js";

export class ObjectNode<
    Entries extends readonly (readonly [string | RegExp, ValidationNode, boolean])[]
> extends ValidationNode<GetObjectType<Entries>> {
    constructor(readonly entries: Narrow<Entries>) {
        super();
    }

    check(value: unknown) {
        if (typeof value !== "object" || !value) return false;

        // Consider string properties and regular expression properties separately
        return (
            this.entries
                .filter(([key]) => typeof key === "string")
                .every(([key, module, optional]) => {
                    if (!((key as string) in value) && !optional) return false;

                    // If it's optional and wasn't present, then it should fall through to true
                    if ((key as string) in value)
                        if (!(module as ValidationNode).check(value[key as never])) return false;

                    return true;
                }) &&
            this.entries
                .filter(([key]) => key instanceof RegExp)
                .every(([key, module]) => {
                    const keys = Object.keys(value).filter((k) => (key as RegExp).test(k));

                    if (!keys.length) return false;

                    // At least one property needs to satisfy the regular expression property's type for a match
                    return keys.some((k) => (module as ValidationNode).check(value[k as never]));
                }) &&
            this.satisfied(value as any)
        );
    }
}
