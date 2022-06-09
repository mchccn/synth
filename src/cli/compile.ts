import { Parser } from "../core/base/parser.js";
import { Scanner } from "../core/base/scanner.js";
import { JSGenerator } from "../core/tools/javascript.js";
import { Linter } from "../core/tools/linter.js";
import { Resolver } from "../core/tools/resolver.js";
import { TSGenerator } from "../core/tools/typescript.js";

export function compile(source: string): [js: string, ts: string];
export function compile(template: TemplateStringsArray, ...values: unknown[]): [js: string, ts: string];
export function compile(template: TemplateStringsArray | string, ...values: unknown[]) {
    const source = Array.isArray(template)
        ? template.reduce((source, part, i) => `${source}${part}${String(values[i] ?? "")}`, "")
        : template;

    const tokens = new Scanner(source).scanTokens();

    const expr = new Parser(source, tokens).parseTokens();

    const resolved = new Resolver().resolve(source, expr);

    const lints = new Linter().lint(expr);

    Linter.display(source, lints);

    const node = new JSGenerator().generate(resolved);

    const types = new TSGenerator().generate(resolved);

    return [node, types];
}
