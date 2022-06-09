import { Constraint } from "./constraint.js";

export interface RegexConstraintArgs {
    pattern: string;
    flags: string;
}

export class RegexConstraint extends Constraint<string> {
    constructor(readonly args: RegexConstraintArgs, readonly regex = new RegExp(args.pattern, args.flags)) {
        super();
    }

    check(value: string) {
        return this.regex.test(value);
    }
}
