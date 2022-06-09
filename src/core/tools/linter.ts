// lints parsed expression and warns about possible mistakes

import chalk from "chalk";
import {
    ArrayExpr,
    // BinaryExpr,
    CallExpr,
    Expr,
    ExprVisitor,
    GroupingExpr,
    LiteralExpr,
    // MatchExpr,
    ObjectExpr,
    OptionalExpr,
    PropExpr,
    TupleExpr,
    UnaryExpr,
} from "../base/expr.js";
import type { Token } from "../base/token.js";
import { TokenType } from "../base/tokentype.js";
import * as generators from "../generators/index.js";
import { baseProviders } from "../shared/constants.js";
import { highlight } from "../shared/highlight.js";
import { didYouMean, oneOfTheThingsIn } from "../shared/utils.js";

export enum LintSeverity {
    Hint,
    Warning,
    Error,
    Fatal,
}

export class Lint {
    constructor(
        readonly start: Token,
        readonly end: Token,
        readonly message: string,
        readonly severity: LintSeverity,
        readonly hint?: string,
    ) {}
}

export class Linter implements ExprVisitor<Lint[]> {
    private unaryNegationOperatorDepth = 0;
    private unaryNegationOperatorStack = [] as UnaryExpr[];

    private beforeVisit(
        expr: Expr,
        exec: () => Lint[],
        options?: {
            isVisitingUnaryOperator?: boolean;
        },
    ) {
        if (!options?.isVisitingUnaryOperator) {
            this.unaryNegationOperatorDepth = 0;
            this.unaryNegationOperatorStack = [];
        }

        if (expr.copied) return [];

        return exec();
    }

    constructor(/* more shit here */) {}

    // Linter should only lint a raw fresh expression from the parser
    lint(expr: Expr) {
        return expr.accept(this);
    }

    static filter(lints: Lint[], severity: LintSeverity) {
        return lints.filter((lint) => lint.severity === severity);
    }

    static header(lints: Lint[], bound: number) {
        const hints = Linter.filter(lints, LintSeverity.Hint).length;
        const warnings = Linter.filter(lints, LintSeverity.Warning).length;
        const errors = Linter.filter(lints, LintSeverity.Error).length;
        const fatals = Linter.filter(lints, LintSeverity.Fatal).length;

        // The message without chalk styling so the bound doesn't get fucked... need a better way to do this instead of copying the message manually
        const bland = `${lints.length} lint${lints.length !== 1 ? "s" : ""} total, ${hints} hint${
            hints !== 1 ? "s" : ""
        }, ${warnings} warning${warnings !== 1 ? "s" : ""}, ${errors} error${
            errors !== 1 ? "s" : ""
        }, ${fatals} fatal mistake${fatals !== 1 ? "s" : ""}`;

        const original = `${chalk[lints.length ? "cyan" : "greenBright"](
            `${lints.length} lint${lints.length !== 1 ? "s" : ""} total`,
        )}, ${chalk[hints ? "blueBright" : "gray"](`${hints} hint${hints !== 1 ? "s" : ""}`)}, ${chalk[
            warnings ? "yellow" : "gray"
        ](`${warnings} warning${warnings !== 1 ? "s" : ""}`)}, ${chalk[errors ? "redBright" : "gray"](
            `${errors} error${errors !== 1 ? "s" : ""}`,
        )}, ${chalk[fatals ? "red" : "gray"](`${fatals} fatal mistake${fatals !== 1 ? "s" : ""}`)}`;

        return `${original} ${chalk.dim("─".repeat(Math.max(bound - bland.length, 0)))}`;
    }

    static display(
        source: string,
        lints: Lint[],
        config?: {
            underline?: boolean;
        },
    ) {
        const { underline = false } = config ?? {};

        const lineNumbers = lints.map((lint) => {
            const numbers =
                lint.end.line - lint.start.line
                    ? new Array(lint.end.line - lint.start.line).fill(0).map((_, i) => lint.start.line + i)
                    : lint.start.line === 1
                    ? source.split("\n")[lint.start.line + 1]
                        ? [lint.start.line, lint.start.line + 1]
                        : [lint.start.line]
                    : source.split("\n")[lint.start.line - 1]
                    ? [lint.start.line - 1, lint.start.line]
                    : [lint.start.line];

            return numbers;
        });

        const farthestBoundary = Math.max(
            ...lineNumbers.map(
                (numbers, i) =>
                    Math.max(
                        Math.max(...numbers.map((line) => source.split("\n")[line].length)),
                        LintSeverity[lints[i].severity].length + lints[i].message.length + 1 + 1,
                        LintSeverity[lints[i].severity].length + (lints[i].hint?.length ?? 0) + 1 + 1,
                    ) + 1,
            ),
        );

        const largestLine = Math.max(...lineNumbers.flat());

        const messages = lints.map((lint, i) => {
            const styled = highlight(source, {
                [underline ? "underlineRanges" : "boldRanges"]: [
                    [lint.start.index, lint.end.index + lint.end.lexeme.length - 1],
                ],
            });

            const numbers = lineNumbers[i];

            const code = numbers
                .map(
                    (line) =>
                        `${chalk.gray(line)}${" ".repeat(
                            line ? Math.floor(Math.log10(Math.max(...numbers))) - Math.floor(Math.log10(line)) : 0,
                        )} ${chalk.dim("|")} ${styled.split("\n")[line - 1]}`,
                )
                .join("\n");

            const message = `${code}
${chalk.dim(`${"─".repeat(Math.floor(Math.log10(Math.max(...numbers)) + 1) + 1)}┴${"─".repeat(farthestBoundary)}`)}
    ${{
        // Coloring lint severity dynamically
        [LintSeverity.Hint]: chalk.blueBright,
        [LintSeverity.Warning]: chalk.yellow,
        [LintSeverity.Error]: chalk.redBright,
        [LintSeverity.Fatal]: chalk.red,
    }[lint.severity](LintSeverity[lint.severity])}: ${lint.message}${
                lint.hint ? `\n    ${" ".repeat(LintSeverity[lint.severity].length + 1 + 1)}${lint.hint}` : ""
            }
    ${" ".repeat(LintSeverity[lint.severity].length + 1 + 1)}${lint.end.line - lint.start.line ? "from" : "at"} line ${
                lint.start.line
            }, column ${lint.start.col}${
                // This lint spans multiple lines
                lint.end.line - lint.start.line ? ` to line ${lint.end.line}, column ${lint.start.col}` : ""
            }${
                process.env.SYNTH_COMPILING_PATH
                    ? `\n    ${" ".repeat(LintSeverity[lint.severity].length + 1 + 1)}at ${
                          process.env.SYNTH_COMPILING_PATH
                      }`
                    : ""
            }`;

            return message;
        });

        console.log(
            [Linter.header(lints, farthestBoundary + Math.floor(Math.log10(largestLine) + 1) + 1)]
                .concat(messages)
                .join("\n\n\n"),
        );
    }

    visitArrayExpr(expr: ArrayExpr): Lint[] {
        return this.beforeVisit(expr, () => expr.expr.accept(this));
    }

    visitCallExpr(expr: CallExpr): Lint[] {
        return this.beforeVisit(expr, () => {
            const lints = [] as Lint[];

            // Lint call with data from the generators
            const generator = generators[expr.identifier.lexeme as keyof typeof generators];

            [...expr.args.entries()].forEach(([key, arg]) => {
                if (!(key.lexeme in generator.defaultAndExpectedArgs))
                    lints.push(
                        new Lint(
                            key,
                            key,
                            `Modifier '${expr.identifier.lexeme}' called with unrecognized argument '${key.lexeme}'.`,
                            LintSeverity.Warning,
                            didYouMean(key.lexeme, Object.keys(generator.defaultAndExpectedArgs)),
                        ),
                    );

                if (arg instanceof LiteralExpr && key.lexeme in generator.defaultAndExpectedArgs) {
                    if (typeof arg.value !== typeof generator.defaultAndExpectedArgs[key.lexeme as never])
                        lints.push(
                            new Lint(
                                key,
                                key,
                                `Argument '${key.lexeme}' should be of type '${typeof generator.defaultAndExpectedArgs[
                                    key.lexeme as never
                                ]}'.`,
                                LintSeverity.Warning,
                            ),
                        );
                }

                lints.push(...arg.accept(this));
            });

            lints.push(...generator.getLints(expr));

            return lints;
        });
    }

    visitGroupingExpr(expr: GroupingExpr): Lint[] {
        return this.beforeVisit(expr, () => {
            const lints = [];

            const providers = [] as [Token, Token][];

            expr.expr.forEach((e) => {
                if (e instanceof CallExpr) {
                    if (baseProviders.includes(e.identifier.lexeme)) providers.push([e.identifier, e.identifier]);
                }

                if (
                    e instanceof LiteralExpr ||
                    e instanceof ArrayExpr ||
                    e instanceof TupleExpr ||
                    e instanceof ObjectExpr
                )
                    providers.push(e instanceof LiteralExpr ? [e.token, e.token] : [e.start, e.end]);
            });

            if (expr.expr.length > 1) {
                if (
                    expr.expr.some(
                        (e) =>
                            e instanceof LiteralExpr ||
                            e instanceof ArrayExpr ||
                            e instanceof TupleExpr ||
                            e instanceof ObjectExpr,
                    )
                )
                    lints.push(
                        new Lint(
                            expr.name ?? expr.start,
                            expr.name ?? expr.end,
                            `Literals, arrays, tuples, and objects cannot be used with other types.`,
                            LintSeverity.Fatal,
                        ),
                    );
            }

            if (!providers.length)
                lints.push(
                    new Lint(
                        expr.name ?? expr.start,
                        expr.name ?? expr.end,
                        expr.name
                            ? `No primary types provided to property '${expr.name.lexeme}'.`
                            : `No primary types provided.`,
                        LintSeverity.Fatal,
                    ),
                );
            else if (providers.length > 1)
                lints.push(
                    new Lint(
                        expr.name ?? expr.start,
                        expr.name ?? expr.end,
                        expr.name
                            ? `More than one primary type provided to property '${expr.name.lexeme}'.`
                            : `More than one primary type provided.`,
                        LintSeverity.Fatal,
                        expr.name ? `Keep the first '${providers[0][0].lexeme}' call only.` : undefined,
                    ),
                );
            else
                expr.expr.forEach((e) => {
                    if (e instanceof CallExpr) {
                        const generator = generators[e.identifier.lexeme as keyof typeof generators];

                        if (!baseProviders.includes(e.identifier.lexeme)) {
                            if (
                                (generator.preferredProviders as string[]).every(
                                    (provider) => provider !== providers[0][0].lexeme,
                                )
                            )
                                lints.push(
                                    new Lint(
                                        e.identifier,
                                        e.identifier,
                                        `This type '${
                                            e.identifier.lexeme
                                        }' should only be used with type ${oneOfTheThingsIn(
                                            generator.preferredProviders,
                                        )}.`,
                                        LintSeverity.Error,
                                        `Try removing this call to '${e.identifier.lexeme}'.`,
                                    ),
                                );
                            else {
                                const preferredArgs = generator.preferredArgs! as Partial<Record<string, string[]>>;

                                const argsForProvider =
                                    preferredArgs[providers[0][0].lexeme as keyof typeof preferredArgs];

                                if (argsForProvider) {
                                    const given = [...e.raw.keys()];

                                    argsForProvider.forEach((arg) => {
                                        if (!given.includes(arg))
                                            lints.push(
                                                new Lint(
                                                    e.identifier,
                                                    e.identifier,
                                                    `Argument '${arg}' should be provided when using '${e.identifier.lexeme}' with '${providers[0][0].lexeme}'.`,
                                                    LintSeverity.Error,
                                                ),
                                            );
                                    });
                                }
                            }
                        }
                    }
                });

            return lints.concat(expr.expr.flatMap((p) => p.accept(this)));
        });
    }

    visitLiteralExpr(expr: LiteralExpr): Lint[] {
        return this.beforeVisit(expr, () => []);
    }

    visitObjectExpr(expr: ObjectExpr): Lint[] {
        return this.beforeVisit(expr, () => {
            const lints = expr.props.flatMap((prop) => prop.accept(this));

            const used = [] as PropExpr["name"][];

            expr.props.forEach(({ name, token }) => {
                if (
                    used.some((prop) =>
                        name instanceof RegExp && prop instanceof RegExp ? prop.source === name.source : prop === name,
                    )
                )
                    lints.push(
                        new Lint(token, token, `Duplicate property '${name}' in this expression.`, LintSeverity.Fatal),
                    );
                else used.push(name);
            });

            return lints;
        });
    }

    visitOptionalExpr(expr: OptionalExpr): Lint[] {
        return this.beforeVisit(expr, () => expr.expr.accept(this));
    }

    visitPropExpr(expr: PropExpr): Lint[] {
        return this.beforeVisit(expr, () => {
            const lints = expr.value.accept(this);

            return lints;
        });
    }

    visitTupleExpr(expr: TupleExpr): Lint[] {
        return this.beforeVisit(expr, () => expr.elements.flatMap((group) => group.accept(this)));
    }

    visitUnaryExpr(expr: UnaryExpr): Lint[] {
        return this.beforeVisit(
            expr,
            () => {
                const lints = [];

                if (expr.operator.type === TokenType.Minus) {
                    this.unaryNegationOperatorDepth++;

                    this.unaryNegationOperatorStack.push(expr);

                    if (
                        this.unaryNegationOperatorDepth >= 2 &&
                        !(expr.expr instanceof UnaryExpr && expr.expr.operator.type === TokenType.Minus)
                    )
                        lints.push(
                            new Lint(
                                this.unaryNegationOperatorStack[0].operator,
                                expr.operator,
                                `Excessive use of the negation operator.`,
                                LintSeverity.Hint,
                            ),
                        );
                }

                lints.push(...expr.expr.accept(this));

                return lints;
            },
            { isVisitingUnaryOperator: true },
        );
    }
}
