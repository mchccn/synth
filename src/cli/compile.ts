import { Parser } from "../core/base/parser.js";
import { Scanner } from "../core/base/scanner.js";
import { Linter } from "../core/tools/linter.js";
import { Resolver } from "../core/tools/resolver.js";
import { Static } from "../core/tools/static.js";

export function compile(source: string): string;
export function compile(template: TemplateStringsArray, ...values: unknown[]): string;
export function compile(template: TemplateStringsArray | string, ...values: unknown[]) {
    const source = Array.isArray(template)
        ? template.reduce((source, part, i) => `${source}${part}${String(values[i] ?? "")}`, "")
        : template;

    const tokens = new Scanner(source).scanTokens();

    const expr = new Parser(source, tokens).parseTokens();

    const resolved = new Resolver().resolve(source, expr);

    const lints = new Linter().lint(expr);

    Linter.display(source, lints);

    const node = new Static().generate(resolved);

    return node;
}
