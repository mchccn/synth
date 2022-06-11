import { TokenType } from "../base/tokentype.js";

export const maybeProperties = [
    TokenType.StringLiteral,
    TokenType.RegexStringLiteral,
    TokenType.SourceStringLiteral,
    TokenType.NumberLiteral,
    TokenType.True,
    TokenType.False,
    TokenType.Identifier,
];

export const baseProviders = [
    "string",
    "number",
    "boolean",
    "bigint",
    "symbol",
    "object",
    "function",
    "null",
    "undefined",
];

export const synthesizedCheckKey = "Synthesized.#module.check";

export const synthesizedModuleKey = "Synthesized.#module";
