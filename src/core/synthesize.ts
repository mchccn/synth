import { Parser } from "./base/parser.js";
import { Scanner } from "./base/scanner.js";
import type { ValidationNode } from "./providers/node.js";
import { compress } from "./shared/compress.js";
import { Generator } from "./tools/generator.js";
import { Linter } from "./tools/linter.js";
import { Resolver } from "./tools/resolver.js";

export class Synthesized<Matcher extends ValidationNode = ValidationNode> {
    readonly #module: Matcher;

    constructor(module: Matcher) {
        this.#module = module;
    }

    #check(value: unknown) {
        return this.#module.check(value);
    }
}

export interface SynthesizerValidator {
    readonly isConstraint: boolean;
    check(value: unknown): boolean;
}

const synthesizedCache = new Map<string, Synthesized>();

export function synthesize(
    source: string,
): Synthesized & { lint(config?: Parameters<typeof Linter.display>[2]): Synthesized };
export function synthesize(
    template: TemplateStringsArray,
    ...values: unknown[]
): Synthesized & { lint(config?: Parameters<typeof Linter.display>[2]): Synthesized };
export function synthesize(template: TemplateStringsArray | string, ...values: unknown[]) {
    const source =
        typeof template !== "string"
            ? template.reduce((source, part, i) => `${source}${part}${String(values[i] ?? "")}`, "")
            : template;

    const tokens = new Scanner(source).scanTokens();

    const key = compress(tokens);

    if (synthesizedCache.has(key)) return synthesizedCache.get(key)!;

    const expr = new Parser(source, tokens).parseTokens();

    const resolved = new Resolver().resolve(source, expr);

    const lints = new Linter().lint(expr);

    const node = new Generator().generate(resolved);

    const s = new Synthesized(node);

    synthesizedCache.set(key, s);

    return Object.assign(s, {
        lint(config?: Parameters<typeof Linter.display>[2]) {
            Linter.display(source, lints, config);

            return s;
        },
    });
}
