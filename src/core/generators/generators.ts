import type { Narrow } from "src/core/types.js";
import type { CallExpr } from "../base/expr.js";
import type { ValidationNode } from "../providers/node.js";
import { Lint, LintSeverity } from "../tools/linter.js";

function mergeWithDefaults<T>(provided: Partial<T>, defaults: T) {
    const out = Object.assign({}, defaults);

    for (const key in provided) Reflect.set(out, key, provided[key as keyof typeof provided]);

    return out;
}

export function createBaseProvider<T>({
    identifier,
    defaultAndExpectedArgs,
    executor,
    compile,
    types,
    getLints,
}: {
    identifier: string;
    defaultAndExpectedArgs: T;
    executor: (args: T) => ValidationNode;
    compile: (args: T) => string;
    types: (args: T) => string;
    getLints: (expr: CallExpr) => Lint[];
}) {
    return Object.assign(executor, {
        compile: (args: T, v?: string[]) =>
            compile(mergeWithDefaults(args, defaultAndExpectedArgs)).concat(
                (v ?? []).map((c) => `.constraint(${c})`).join(""),
            ),
        types: (args: T) => types(mergeWithDefaults(args, defaultAndExpectedArgs)),
        identifier,
        isModifier: false,
        defaultAndExpectedArgs,
        getLints,
        preferredProviders: [],
        preferredArgs: undefined,
    } as const);
}

export function createProviderExtension<T, P extends string>({
    defaultAndExpectedArgs,
    executor,
    compile,
    getLints,
    preferredProviders,
    preferredArgs = {} as any,
}: {
    defaultAndExpectedArgs: T;
    preferredProviders: Narrow<P>[];
    preferredArgs?: { [K in P]?: (keyof T)[] };
    executor: (node: ValidationNode, args: T) => ValidationNode;
    compile: (args: T) => string;
    getLints: (expr: CallExpr) => Lint[];
}) {
    return Object.assign(executor, {
        compile: (args: T) => compile(mergeWithDefaults(args, defaultAndExpectedArgs)),
        identifier: undefined,
        isModifier: true,
        defaultAndExpectedArgs,
        getLints,
        preferredProviders,
        preferredArgs,
    } as const);
}

export function lintsPipe(...linters: ((expr: CallExpr) => Lint[])[]) {
    return (expr: CallExpr) => linters.reduce((lints, get) => lints.concat(get(expr)), [] as Lint[]);
}

export function requiredArgs<T>(args: (keyof T)[]) {
    return (expr: CallExpr) => {
        const keys = [...expr.raw.keys()];

        return args.flatMap((arg) => {
            if (!keys.includes(arg as string))
                return [
                    new Lint(
                        expr.identifier,
                        expr.identifier,
                        `Argument '${arg as string}' in '${expr.identifier.lexeme}' is required.`,
                        LintSeverity.Fatal,
                    ),
                ];

            return [];
        });
    };
}

export function mutuallyExclusive(a: string, b: string, optional = false) {
    return (expr: CallExpr) => {
        if (expr.raw.has(a) && expr.raw.has(b))
            return [
                new Lint(
                    expr.identifier,
                    expr.identifier,
                    `Arguments '${a}' and '${b}' are mutually exclusive.`,
                    LintSeverity.Fatal,
                    `You can only use either '${a}' or '${b}' but not both.`,
                ),
            ];

        if (!expr.raw.has(a) && !expr.raw.has(b) && !optional)
            return [
                new Lint(
                    expr.identifier,
                    expr.identifier,
                    `No value for '${a}' or '${b}' was provided.`,
                    LintSeverity.Fatal,
                ),
            ];

        return [];
    };
}
