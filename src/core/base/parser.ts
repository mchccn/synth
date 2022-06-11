import { maybeProperties } from "../shared/constants.js";
import { SynthesizerSyntaxError } from "../shared/errors.js";
import {
    ArrayExpr,
    CallExpr,
    Expr,
    GroupingExpr,
    LiteralExpr,
    ObjectExpr,
    PropExpr,
    TupleExpr,
    UnaryExpr,
} from "./expr.js";
import type { Token } from "./token.js";
import { TokenType } from "./tokentype.js";

export class Parser {
    #current = 0;

    constructor(
        readonly source: string,
        original: Token[],
        readonly tokens = original.filter(({ type }) => type !== TokenType.Comment),
    ) {}

    parseTokens() {
        const pattern = [this.#expression()];

        while (!this.#isAtEnd()) pattern.push(this.#expression());

        // No more tokens should be left after parsing an expression
        if (this.#current < this.tokens.length - 1)
            throw new SynthesizerSyntaxError(this.source, this.#peek(), `Unexpected continuation of input.`);

        return new GroupingExpr(pattern, this.tokens[0], this.tokens[this.tokens.length - 1], undefined);
    }

    #expression(): Expr {
        // Start of an object expression
        if (this.#match(TokenType.LeftBracket)) {
            const start = this.#previous();

            const properties = [];

            while (this.#check(...maybeProperties)) {
                const property = this.#property();

                properties.push(property);

                this.#consume(TokenType.Semicolon, `Expected a semicolon after a property definition.`);
            }

            this.#consume(TokenType.RightBracket, `Expected a closing bracket after this expression.`, true);

            const expr = new ObjectExpr(properties, start, this.#previous());

            return expr;
        }

        // Start of a tuple expression
        if (this.#match(TokenType.LeftBrace)) {
            const start = this.#previous();

            const elements = [];

            do {
                if (this.#check(TokenType.RightBrace)) break;

                const start = this.#current;

                const element = [this.#expression()];

                while (!this.#check(TokenType.Comma) && !this.#isAtEnd()) {
                    if (this.#check(TokenType.RightBrace)) break;

                    element.push(this.#expression());
                }

                elements.push(new GroupingExpr(element, this.tokens[start], this.#previous(), undefined));
            } while (this.#match(TokenType.Comma));

            this.#consume(TokenType.RightBrace, `Expected a closing bracket after this tuple.`, true);

            return new TupleExpr(elements, start, this.#previous());
        }

        return this.#unary();
    }

    // Subroutine to parse a property in an object expression
    #property() {
        if (this.#match(...maybeProperties)) {
            const token = this.#previous();

            const keyname = (() => {
                switch (token.type) {
                    case TokenType.True:
                    case TokenType.False:
                        return TokenType[this.#previous().type].toLowerCase();

                    case TokenType.StringLiteral:
                    case TokenType.NumberLiteral:
                        return (this.#previous().literal as string | number).toString();

                    case TokenType.RegexStringLiteral:
                        return new RegExp(this.#previous().literal as string);

                    case TokenType.Identifier:
                        return this.#previous().lexeme;
                }

                // Should never happen
                throw new Error(`Synthesizer failed to produce a key name.`);
            })();

            const optional = this.#match(TokenType.QuestionMark);

            if (optional && keyname instanceof RegExp)
                throw new SynthesizerSyntaxError(
                    this.source,
                    this.#previous(),
                    `Regular expression properties cannot be optional.`,
                );

            this.#consume(TokenType.Colon, `Expected a colon after property name.`);

            const pattern = [this.#expression()];

            while (!this.#check(TokenType.Semicolon) && !this.#isAtEnd()) {
                if (this.#check(TokenType.RightBracket))
                    throw new SynthesizerSyntaxError(
                        this.source,
                        this.#peek(),
                        `Expected a semicolon after a property definition.`,
                    );

                pattern.push(this.#expression());
            }

            return new PropExpr(keyname, token, new GroupingExpr(pattern, token, this.#peek(), token), optional);
        }

        // Should never happen
        throw new Error(`Synthesizer failed to parse a property.`);
    }

    #unary(): Expr {
        // Nested unary operators are allowed
        if (this.#match(TokenType.Minus)) {
            const operator = this.#previous();
            const right = this.#unary();
            return new UnaryExpr(operator, right);
        }

        return this.#postmod();
    }

    #postmod() {
        const start = this.#peek();

        let expr = this.#primary();

        // Continually checks for "[]"
        while (this.#check(TokenType.LeftBrace)) {
            const end = this.#peek();

            if (this.#match(TokenType.LeftBrace)) {
                this.#consume(TokenType.RightBrace, `Expected a closing bracket for an array type.`);
                expr = new ArrayExpr(expr, start, end);
            }
        }

        return expr;
    }

    #primary(): Expr {
        if (this.#match(TokenType.True)) return new LiteralExpr(true, this.#previous());
        if (this.#match(TokenType.False)) return new LiteralExpr(false, this.#previous());

        if (this.#match(TokenType.StringLiteral, TokenType.SourceStringLiteral, TokenType.NumberLiteral))
            return new LiteralExpr(this.#previous().literal, this.#previous());

        if (this.#match(TokenType.RegexStringLiteral))
            return new LiteralExpr(new RegExp(this.#previous().literal as string), this.#previous());

        if (this.#match(TokenType.Identifier)) {
            const ident = this.#previous();

            const args = new Map<Token, Expr>();

            if (this.#match(TokenType.LeftParen)) {
                if (!this.#check(TokenType.RightParen)) {
                    do {
                        const name = this.#consume(TokenType.Identifier, "Expected a parameter name.");

                        this.#consume(TokenType.Colon, "Expected a colon after parameter name.");

                        args.set(name, this.#expression());
                    } while (this.#match(TokenType.Comma));
                }

                this.#consume(TokenType.RightParen, "Expected a closing parentheses after arguments.");
            }

            return new CallExpr(ident, args);
        }

        if (this.#match(TokenType.LeftParen)) {
            const start = this.#previous();

            const expr = [this.#expression()];

            while (!this.#check(TokenType.RightParen) && !this.#isAtEnd()) expr.push(this.#expression());

            this.#consume(TokenType.RightParen, "Expected a closing parentheses after this expression.", true);

            return new GroupingExpr(expr, start, this.#previous(), undefined);
        }

        throw new SynthesizerSyntaxError(this.source, this.#peek(), "Expected an expression.");
    }

    // --- Utility methods ---

    #consume(type: TokenType, message: string, backtrack?: boolean) {
        if (this.#check(type)) return this.#advance();

        if (backtrack) this.#backtrack();

        throw new SynthesizerSyntaxError(this.source, this.#peek(), message);
    }

    #match(...types: TokenType[]) {
        return types.some((t) => this.#check(t)) ? (this.#advance(), true) : false;
    }

    #check(...types: TokenType[]) {
        return this.#isAtEnd() ? false : types.some((type) => this.#peek().type === type);
    }

    #advance() {
        if (!this.#isAtEnd()) this.#current++;

        return this.#previous();
    }

    #backtrack() {
        if (this.#current > 0) this.#current--;

        return this.#peek();
    }

    #isAtEnd() {
        return this.#peek().type === TokenType.Eof;
    }

    #peek() {
        return this.tokens[this.#current];
    }

    #previous() {
        return this.tokens[this.#current - 1];
    }
}
