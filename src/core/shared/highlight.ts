import chalk from "chalk";
import { Scanner } from "../base/scanner.js";
import { TokenType } from "../base/tokentype.js";
import type { HighlightColors, Methods } from "../types.js";
import { SynthesizerSyntaxError } from "./errors.js";

export function highlight(
    source: string,
    config?: {
        quitIfSyntaxError?: boolean;
        customColors?: Partial<HighlightColors>;
        boldRanges?: [number, number][];
        underlineRanges?: [number, number][];
    },
) {
    const { quitIfSyntaxError = false, customColors = {}, boldRanges = [], underlineRanges = [] } = config ?? {};

    try {
        SynthesizerSyntaxError.attemptingHighlight = true;

        const tokens = new Scanner(source).scanTokens();

        const colors: Partial<Record<Methods<typeof chalk>, TokenType[]>> = {
            blueBright: [TokenType.True, TokenType.False, TokenType.NumberLiteral],
            gray: [
                TokenType.QuestionMark,
                TokenType.Minus,
                TokenType.Star,
                TokenType.Semicolon,
                TokenType.Colon,
                TokenType.LeftBracket,
                TokenType.RightBracket,
                TokenType.LeftBrace,
                TokenType.RightBrace,
                TokenType.LeftParen,
                TokenType.RightParen,
            ],
            dim: [TokenType.Comment],
            red: [TokenType.RegexStringLiteral],
            green: [TokenType.StringLiteral, TokenType.SourceStringLiteral],
        };

        for (const key in customColors) {
            colors[key as keyof typeof colors] = (colors[key as keyof typeof colors] ?? []).concat(
                ...customColors[key as keyof typeof customColors]!,
            );
        }

        const map = Object.fromEntries(
            Object.entries(colors).flatMap(([method, types]) => types.map((type) => [type, method])),
        ) as Record<TokenType, keyof HighlightColors>;

        return source
            .split("")
            .map((char, index) => {
                if (tokens[0].index + tokens[0].lexeme.length <= index) tokens.shift();

                const bold = boldRanges.some(([start, end]) => index >= start && index <= end);
                const underline = underlineRanges.some(([start, end]) => index >= start && index <= end);

                const color = /^\s$/.test(char) ? "white" : map[tokens[0].type] ?? "white";

                return chalk[bold ? "bold" : color][underline ? "underline" : color][color](char);
            })
            .join("");
    } catch (e) {
        if (quitIfSyntaxError) return source;

        throw e;
    } finally {
        SynthesizerSyntaxError.attemptingHighlight = false;
    }
}
