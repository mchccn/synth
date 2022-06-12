import { NodeConstraint } from "./constraint.js";

export interface RangeConstraintArgs {
    start: number;
    end: number;
    exclusive: boolean;
}

export class RangeConstraint extends NodeConstraint<number> {
    constructor(readonly args: RangeConstraintArgs) {
        super();
    }

    check(value: number) {
        return this.args.exclusive
            ? value > this.args.start && value < this.args.end
            : value >= this.args.start && value <= this.args.end;
    }
}
