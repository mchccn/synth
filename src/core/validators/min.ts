import { Constraint } from "./constraint.js";

export interface MinConstraintArgs {
    length: number;
    value: number;
    exclusive: boolean;
}

export class MinConstraint extends Constraint<number | string> {
    constructor(readonly args: MinConstraintArgs) {
        super();
    }

    check(value: number | string) {
        return typeof value === "number"
            ? this.args.exclusive
                ? value > this.args.value
                : value >= this.args.value
            : this.args.exclusive
            ? value.length > this.args.length
            : value.length >= this.args.length;
    }
}
