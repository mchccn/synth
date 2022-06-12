import { NodeConstraint } from "./constraint.js";

export interface RegexConstraintArgs {
    pattern: string;
    flags: string;
}

export class RegexConstraint extends NodeConstraint<string> {
    constructor(readonly args: RegexConstraintArgs, readonly regex = new RegExp(args.pattern, args.flags)) {
        super();
    }

    check(value: string) {
        return this.regex.test(value);
    }
}
