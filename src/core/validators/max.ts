import { NodeConstraint } from "./constraint.js";

export interface MaxConstraintArgs {
    length: number;
    value: number;
    exclusive: boolean;
}

export class MaxConstraint extends NodeConstraint<number | string> {
    constructor(readonly args: MaxConstraintArgs) {
        super();
    }

    check(value: number | string) {
        return typeof value === "number"
            ? this.args.exclusive
                ? value < this.args.value
                : value <= this.args.value
            : this.args.exclusive
            ? value.length < this.args.length
            : value.length <= this.args.length;
    }
}
