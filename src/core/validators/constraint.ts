import type { SynthesizerValidator } from "../synthesize";

export abstract class Constraint<Type = unknown> implements SynthesizerValidator {
    #_: Type = null!;

    readonly isConstraint = true;

    readonly label = this.constructor.name;

    constructor() {}

    abstract check(value: Type): boolean;
}
