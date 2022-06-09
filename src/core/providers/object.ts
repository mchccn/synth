import type { GetObjectType, Narrow } from "../types.js";
import { ValidationNode } from "./node.js";

export class ObjectNode<
    Entries extends readonly (readonly [string | RegExp, ValidationNode, boolean])[],
    Unstrict extends boolean,
> extends ValidationNode<GetObjectType<Entries, Unstrict>> {
    constructor(readonly entries: Narrow<Entries>, readonly unstrict: Unstrict) {
        super();
    }

    check(value: unknown) {
        if (typeof value !== "object" || !value) return false;

        // If this is strict matching, then it cannot possibly match if the object has extra properties
        // We filter out all properties that aren't present in the entries, and if this is different than the original list, we've got extraneous properties
        if (
            !this.unstrict &&
            Object.keys(value).filter((key) => this.entries.map(([name]) => name).includes(key)).length !==
                Object.keys(value).length
        )
            return false;

        // Consider string properties and regular expression properties separately
        return (
            this.entries
                .filter(([key]) => typeof key === "string")
                .every(([key, module, optional]) => {
                    if (!((key as string) in value) && !optional) return false;

                    // If it's optional and wasn't present, then it should fall through to true
                    if ((key as string) in value) if (!module.check(value[key as never])) return false;

                    return true;
                }) &&
            this.entries
                .filter(([key]) => key instanceof RegExp)
                .every(([key, module]) => {
                    const keys = Object.keys(value).filter((k) => (key as RegExp).test(k));

                    if (!keys.length) return false;

                    // At least one property needs to satisfy the regular expression property's type for a match
                    return keys.some((k) => module.check(value[k as never]));
                }) &&
            this.satisfied(value as any)
        );
    }
}
