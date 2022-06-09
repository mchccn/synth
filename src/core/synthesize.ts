import { Parser } from "./base/parser.js";
import { Scanner } from "./base/scanner.js";
import type { ValidationNode } from "./providers/node.js";
import { Generator } from "./tools/generator.js";
import { Lint, Linter } from "./tools/linter.js";
import { Resolver } from "./tools/resolver.js";
import { Static } from "./tools/static.js";
import type { GetModuleType } from "./types.js";

export class Synthesized<Matcher extends ValidationNode = ValidationNode, Type = GetModuleType<Matcher>> {
    private _: Type = null!;

    constructor(private readonly source: string, private readonly lints: Lint[], private readonly module: Matcher) {}

    lint(config?: Parameters<typeof Linter.display>[2]) {
        Linter.display(this.source, this.lints, config);

        return this;
    }

    private check(value: unknown): value is Type {
        return this.module.check(value);
    }
}

export interface SynthesizerValidator {
    readonly isConstraint: boolean;
    check(value: unknown): boolean;
}

export function synthesize(source: string): Synthesized;
export function synthesize(template: TemplateStringsArray, ...values: unknown[]): Synthesized;
export function synthesize(template: TemplateStringsArray | string, ...values: unknown[]) {
    const source = Array.isArray(template)
        ? template.reduce((source, part, i) => `${source}${part}${String(values[i] ?? "")}`, "")
        : template;

    const tokens = new Scanner(source).scanTokens();

    const expr = new Parser(source, tokens).parseTokens();

    const resolved = new Resolver().resolve(source, expr);

    const lints = new Linter().lint(expr);

    const node = new Generator().generate(resolved);

    return new Synthesized(source, lints, node);
}

