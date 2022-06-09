import { TokenType } from "./tokentype.js";

export class Token {
    constructor(
        readonly type: TokenType,
        readonly lexeme: string,
        readonly literal: unknown,
        readonly index: number,
        readonly line: number,
        readonly col: number,
        readonly name = TokenType[type],
    ) {}

    toString() {
        return `[${this.line}:${this.col} ${this.name} { ${this.lexeme} ${this.literal} }]`;
    }

    static marker(char: string, line: number, col: number) {
        return new Token(TokenType.Marker, char, char, 0, line, col);
    }
}
