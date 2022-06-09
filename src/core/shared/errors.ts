import chalk from "chalk";
import type { Token } from "../base/token.js";
import { highlight } from "./highlight.js";

export class SynthesizerSyntaxError extends Error {
    static attemptingHighlight = false;

    name = "SynthesizerSyntaxError";

    constructor(source: string, token: Token, message: string) {
        super(message);

        const styled = SynthesizerSyntaxError.attemptingHighlight
            ? source
            : highlight(source, {
                  quitIfSyntaxError: true,
                  boldRanges: [[token.index, token.index + token.lexeme.length - 1]],
              });

        this.stack = `\
${
    token.line === 1
        ? ""
        : `${chalk.gray(token.line - 1)}${" ".repeat(
              Math.floor(Math.log10(token.line) + 1) + 1 - (Math.floor(Math.log10(token.line - 1)) + 1 + 1),
          )} ${chalk.dim("|")} ${styled.split("\n")[token.line - 1 - 1]}\n`
}${chalk.gray(token.line)} ${chalk.dim("|")} ${styled.split("\n")[token.line - 1]}
${" ".repeat(Math.log10(token.line) + 3 + token.col)}${chalk.bold(
            token.lexeme.length === 1 ? "^" : "~".repeat(token.lexeme.length),
        )}
${this.name}: ${this.message}
    at line ${token.line}, column ${token.col}\
`;
    }
}
