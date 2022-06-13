import { unraw } from "unraw";
import { SynthesizerSyntaxError } from "../shared/errors.js";
import { Token } from "./token.js";
import { TokenType } from "./tokentype.js";

export class Scanner {
    static readonly #unhandled = Symbol();

    readonly #tokens = [] as Token[];

    constructor(readonly source: string) {}

    #start = 0;
    #current = 0;
    #line = 1;
    #col = 1;

    // Scans all tokens and appends Eof at the end
    scanTokens() {
        while (!this.#isAtEnd()) {
            this.#start = this.#current;

            this.#scanToken();
        }

        this.#start = this.#current = this.source.length;

        this.#addToken(TokenType.Eof);

        return this.#tokens;
    }

    // Maps keywords to their token type
    static readonly #keywords = new Map([
        ["true", TokenType.True],
        ["false", TokenType.False],
    ]);

    // Maps characters to the appropriate action to handle them
    readonly #lexmap = new Map([
        ["(", () => this.#addToken(TokenType.LeftParen)],
        [")", () => this.#addToken(TokenType.RightParen)],

        ["[", () => this.#addToken(TokenType.LeftBrace)],
        ["]", () => this.#addToken(TokenType.RightBrace)],

        ["{", () => this.#addToken(TokenType.LeftBracket)],
        ["}", () => this.#addToken(TokenType.RightBracket)],

        [":", () => this.#addToken(TokenType.Colon)],

        [";", () => this.#addToken(TokenType.Semicolon)],

        [",", () => this.#addToken(TokenType.Comma)],

        ["?", () => this.#addToken(TokenType.QuestionMark)],

        ["-", () => this.#addToken(TokenType.Minus)],

        ['"', () => this.#string('"')],
        ["'", () => this.#string("'")],

        ["#", () => this.#comments()],

        [" ", () => this.#col++],
        ["\r", () => this.#col++],
        ["\t", () => this.#col++],
        ["\v", () => this.#col++],
        ["\f", () => this.#col++],
        ["\n", () => (this.#line++, (this.#col = 1))],
    ]);

    // Delegates parsing to the appropriate function based on the current character
    #scanToken() {
        const c = this.#advance();

        const handler = this.#lexmap.get(c);

        let val = Scanner.#unhandled as unknown;

        if (handler) val = handler();

        if (val === Scanner.#unhandled)
            val = (() => {
                // If this character is not handled by the lexmap, it's needs to be delegated to a subroutine
                if (this.#isDigit(c)) {
                    return this.#number(c !== "0"); // If it wasn't a zero, then don't handle special bases
                }

                if (this.#isIdentifierStart(c)) {
                    return this.#symbol(c); // Provide the first character to the symbol subroutine
                }

                return Scanner.#unhandled; // Character was not handled appropriately
            })();

        if (val === Scanner.#unhandled)
            throw new SynthesizerSyntaxError(
                this.source,
                Token.marker(c, this.#line, this.#col),
                `Unexpected character '${c}' at line ${this.#line}, column ${this.#col}.`,
            );
    }

    // --- Parsing routines ---

    #comments() {
        // Single line comment, skip to the end of the line
        while (this.#peek() !== "\n" && !this.#isAtEnd()) this.#advance();

        this.#addToken(TokenType.Comment);
    }

    #string(quote: string, type = TokenType.StringLiteral) {
        if (type !== TokenType.StringLiteral) this.#advance();

        while ((this.#previous() === "\\" || this.#peek() !== quote) && !this.#isAtEnd() && this.#peek() !== "\n")
            this.#advance();

        if (this.#isAtEnd() || this.#peek() === "\n")
            throw new SynthesizerSyntaxError(
                this.source,
                Token.marker(quote, this.#line, this.#col),
                "Unterminated string.",
            );

        this.#advance();

        const string = this.source.substring(
            this.#start + (type === TokenType.StringLiteral ? 1 : 1 + 1),
            this.#current - 1,
        );

        this.#addToken(
            type,
            type === TokenType.SourceStringLiteral || type === TokenType.RegexStringLiteral ? string : unraw(string),
        );
    }

    // Map number bases to the right digit validator
    readonly #digitBases = new Map([
        ["b", this.#isBinaryDigit],
        ["o", this.#isOctalDigit],
        ["x", this.#isHexDigit],
    ]);

    #number(baseless?: boolean) {
        // Default to decimal if there is no base specified
        const is = this.#digitBases.get(this.#peek().toLowerCase()) ?? this.#isDigit;

        // Skip over base if one was provided
        if (is !== this.#isDigit) this.#advance();

        if (baseless && is !== this.#isDigit)
            throw new SynthesizerSyntaxError(
                this.source,
                Token.marker(this.#peek(), this.#line, this.#col + 1),
                "Number literal bases are not allowed here.",
            );

        while (is(this.#peek()) || this.#peek() === "_") this.#advance();

        if (this.#previous() === "_" && this.#peek() === ".")
            throw new SynthesizerSyntaxError(
                this.source,
                Token.marker(".", this.#line, this.#col + (this.#current - this.#start)),
                `Decimal point cannot appear directly after numeric separator.`,
            );

        // Floating point part
        if (this.#peek() === "." && (is(this.#peekNext()) || this.#peekNext() === "_")) {
            if (this.#peekNext() === "_")
                throw new SynthesizerSyntaxError(
                    this.source,
                    Token.marker("_", this.#line, this.#col + (this.#current - this.#start) + 1),
                    `Numeric separator cannot immediately follow decimal point.`,
                );

            this.#advance();

            while (is(this.#peek()) || this.#peek() === "_") this.#advance();
        }

        if (this.#previous() === "_" && this.#peek() === "e")
            throw new SynthesizerSyntaxError(
                this.source,
                Token.marker("e", this.#line, this.#col + (this.#current - this.#start)),
                `Exponentiation cannot appear directly after numeric separator.`,
            );

        // Exponentiation part
        if (this.#peek().toLowerCase() === "e" && (is(this.#peekNext()) || this.#peekNext() === "_")) {
            if (this.#peekNext() === "_")
                throw new SynthesizerSyntaxError(
                    this.source,
                    Token.marker("_", this.#line, this.#col + (this.#current - this.#start) + 1),
                    `Numeric separator cannot immediately follow exponentiation.`,
                );

            this.#advance(), this.#advance();

            while (is(this.#peek()) || this.#peek() === "_") this.#advance();
        }

        if (this.#previous() === "_")
            throw new SynthesizerSyntaxError(
                this.source,
                Token.marker("_", this.#line, this.#col + (this.#current - this.#start) - 1),
                `Number literals cannot end with a numeric separator.`,
            );

        const token = this.#addToken(
            TokenType.NumberLiteral,
            Number(this.source.substring(this.#start, this.#current).replaceAll("_", "")), // Remove numeric separators
        );

        if (this.#isIdentifierStart(this.#peek()))
            throw new SynthesizerSyntaxError(
                this.source,
                Token.marker("_", this.#line, this.#col),
                `Number literal cannot be immediately followed by an identifier.`,
            );

        // Number literals should never result in NaN
        if (Number.isNaN(token.literal)) throw new Error("Number literal resulted in NaN.");
    }

    #symbol(start?: string) {
        // If this was marked as a possible special string literal, then check if it's actually one
        if ((start === "r" || start === "s") && (this.#peek() === '"' || this.#peek() === "'"))
            return this.#string(
                this.#peek(),
                start === "r" ? TokenType.RegexStringLiteral : TokenType.SourceStringLiteral,
            );

        while (this.#isIdentifierBody(this.#peek())) this.#advance();

        const text = this.source.substring(this.#start, this.#current);

        // If it isn't a keyword, it's a possible identifier
        const type = Scanner.#keywords.get(text) ?? TokenType.Identifier;

        this.#addToken(type, text);
    }

    // --- Utility methods ---

    #previous() {
        return this.source[this.#current - 1] ?? "\0";
    }

    #peek() {
        return this.source[this.#current] ?? "\0";
    }

    #peekNext() {
        return this.source[this.#current + 1] ?? "\0";
    }

    #advance() {
        return this.source[this.#current++];
    }

    #match(expected: string) {
        if (this.#isAtEnd()) return false;

        if (this.source.charAt(this.#current) !== expected) return false;

        this.#advance();

        return true;
    }

    #isDigit(c: string) {
        return /^\d$/.test(c);
    }

    #isBinaryDigit(c: string) {
        return /^[01]$/.test(c);
    }

    #isOctalDigit(c: string) {
        return /^[0-7]$/.test(c);
    }

    #isHexDigit(c: string) {
        return /^[0-9a-fA-F]$/.test(c);
    }

    #isAlpha(c: string) {
        return /^[a-zA-Z_]$/.test(c);
    }

    #isAlphaNumeric(c: string) {
        return /^[a-zA-Z0-9_]$/.test(c);
    }

    #isIdentifierStart(c: string) {
        return /^[a-zA-Z_$]$/.test(c);
    }

    #isIdentifierBody(c: string) {
        return /^[a-zA-Z0-9_$]$/.test(c);
    }

    #addToken(type: TokenType, literal?: unknown) {
        const text = this.source.substring(this.#start, this.#current);

        const token = new Token(type, text, literal ?? "", this.#start, this.#line, this.#col);

        this.#tokens.push(token);

        this.#col += text.length;

        return token;
    }

    #isAtEnd() {
        return this.#current >= this.source.length;
    }
}
