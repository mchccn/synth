import type { Token } from "../base/token.js";
import { TokenType } from "../base/tokentype.js";

export function compress(tokens: Token[]) {
    return tokens
        .filter(({ type }) => type !== TokenType.Comment)
        .reduce((result, token, i, tokens) => {
            const previous = tokens[i - 1];

            if (!previous) return token.lexeme;

            return (
                result +
                ([TokenType.Identifier, TokenType.True, TokenType.False, TokenType.NumberLiteral].includes(
                    token.type,
                ) &&
                [TokenType.Identifier, TokenType.True, TokenType.False, TokenType.NumberLiteral].includes(previous.type)
                    ? " "
                    : "") +
                token.lexeme
            );
        }, "");
}
