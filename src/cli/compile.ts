import chalk from "chalk";
import { Parser } from "../core/base/parser.js";
import { Scanner } from "../core/base/scanner.js";
import { JSGenerator } from "../core/tools/javascript.js";
import { Linter, LintSeverity } from "../core/tools/linter.js";
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

    if (!process.env.SYNTH_PRINT_ONLY)
        if (!process.env.SYNTH_SHOW_LINTS) {
            if (lints.length) {
                if (lints.every((lint) => lint.severity === LintSeverity.Hint))
                    console.log(
                        `ℹ️ ${chalk.blueBright("Hints available")} ${chalk.dim(process.env.SYNTH_COMPILING_PATH)}`,
                    );
                else {
                    const warnings = Linter.filter(lints, LintSeverity.Warning).length;
                    const errors = Linter.filter(lints, LintSeverity.Error).length;
                    const fatals = Linter.filter(lints, LintSeverity.Fatal).length;

                    if (!errors && !fatals)
                        console.log(
                            `⚠️  ${chalk.yellow(`${warnings} warning${warnings !== 1 ? "s" : ""} given`)} ${chalk.dim(
                                process.env.SYNTH_COMPILING_PATH,
                            )}`,
                        );
                    else {
                        console.log(
                            `❌ ${chalk.red(
                                fatals
                                    ? `${fatals} fatal mistake${fatals !== 1 ? "s" : ""}`
                                    : `${errors} error${errors !== 1 ? "s" : ""} found`,
                            )} ${chalk.dim(process.env.SYNTH_COMPILING_PATH)}`,
                        );

                        Linter.display(source, lints);
                    }
                }
            } else
                console.log(
                    `✅ ${chalk.greenBright("All checks passed")} ${chalk.dim(process.env.SYNTH_COMPILING_PATH)}`,
                );
        } else {
            console.log(`${chalk.dim(process.env.SYNTH_COMPILING_PATH)}`);
            Linter.display(source, lints);
        }

    const node = new JSGenerator().generate(resolved);

    const types = new TSGenerator().generate(resolved);

    return [node, types];
}
