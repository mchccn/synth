import type { SynthesizerValidator } from "../synthesize";
import type { Constraint } from "../validators/constraint.js";

export abstract class ValidationNode<Type = unknown> implements SynthesizerValidator {
    #_: Type = null!;

    protected constraints = [] as Constraint<Type>[];

    readonly isConstraint = false;

    readonly label = this.constructor.name;

    abstract check(value: unknown): boolean;

    constraint(constraint: Constraint<Type>) {
        this.constraints.push(constraint);

        return this;
    }

    satisfied(value: Type) {
        return this.constraints.every((constraint) => constraint.check(value));
    }
}
