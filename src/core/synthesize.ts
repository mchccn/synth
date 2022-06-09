import { Parser } from "./base/parser.js";
import { Scanner } from "./base/scanner.js";
import type { ValidationNode } from "./providers/node.js";
import { Generator } from "./tools/generator.js";
import { Linter } from "./tools/linter.js";
import { Resolver } from "./tools/resolver.js";

export class Synthesized<Matcher extends ValidationNode = ValidationNode> {
    constructor(private readonly module: Matcher) {}

    private check(value: unknown) {
        return this.module.check(value);
    }
}

export interface SynthesizerValidator {
    readonly isConstraint: boolean;
    check(value: unknown): boolean;
}

export function synthesize(
    source: string,
): Synthesized & { lint(config?: Parameters<typeof Linter.display>[2]): Synthesized };
export function synthesize(
    template: TemplateStringsArray,
    ...values: unknown[]
): Synthesized & { lint(config?: Parameters<typeof Linter.display>[2]): Synthesized };
export function synthesize(template: TemplateStringsArray | string, ...values: unknown[]) {
    const source = Array.isArray(template)
        ? template.reduce((source, part, i) => `${source}${part}${String(values[i] ?? "")}`, "")
        : template;

    const tokens = new Scanner(source).scanTokens();

    const expr = new Parser(source, tokens).parseTokens();

    const resolved = new Resolver().resolve(source, expr);

    const lints = new Linter().lint(expr);

    const node = new Generator().generate(resolved);

    const s = new Synthesized(node);

    return Object.assign(s, {
        lint(config?: Parameters<typeof Linter.display>[2]) {
            Linter.display(source, lints, config);

            return s;
        },
    });
}
