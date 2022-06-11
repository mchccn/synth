import { expect } from "chai";
import { Scanner } from "../src/core/base/scanner.js";

describe("Synthesizer scanner", () => {
    it("Correctly tokenizes everything", () => {
        const tokens = new Scanner(`\
( ) [ ] { }

: ; , ? -

true false

"string literal"
'single quote'
r"regex string literal"
r'regex single quote'
s"raw string literal"
s'raw single quote'

123 456.789 0b11 0o77 0xff
1_000_000

abcd1234 snake_case camelCase _ $

string number boolean
bigint symbol function
object undefined null
        `).scanTokens();

        expect(tokens.map(({ name }) => name)).to.deep.equal([
            "LeftParen",
            "RightParen",
            "LeftBrace",
            "RightBrace",
            "LeftBracket",
            "RightBracket",
            "Colon",
            "Semicolon",
            "Comma",
            "QuestionMark",
            "Minus",
            "True",
            "False",
            "StringLiteral",
            "StringLiteral",
            "RegexStringLiteral",
            "RegexStringLiteral",
            "SourceStringLiteral",
            "SourceStringLiteral",
            "NumberLiteral",
            "NumberLiteral",
            "NumberLiteral",
            "NumberLiteral",
            "NumberLiteral",
            "NumberLiteral",
            "Identifier",
            "Identifier",
            "Identifier",
            "Identifier",
            "Identifier",
            "Identifier",
            "Identifier",
            "Identifier",
            "Identifier",
            "Identifier",
            "Identifier",
            "Identifier",
            "Identifier",
            "Identifier",
            "Eof",
        ]);
    });

    it("Reports basic syntax errors", () => {
        expect(function UnexpectedDotCharacter() {
            new Scanner(`.`).scanTokens();
        }).to.throw();

        expect(function UnterminatedDoubleQuoteString() {
            new Scanner(`"`).scanTokens();
        }).to.throw();

        expect(function UnterminatedSingleQuoteString() {
            new Scanner(`'`).scanTokens();
        }).to.throw();

        expect(function DisallowIllegalNumberLiteralBase() {
            new Scanner(`9xff`).scanTokens();
        }).to.throw();

        expect(function NoDecimalPointAfterNumericSeparator() {
            new Scanner(`123_.`).scanTokens();
        }).to.throw();

        expect(function NoNumericSeparatorAfterDecimalPoint() {
            new Scanner(`123._`).scanTokens();
        }).to.throw();

        expect(function NoExponentiationAfterNumericSeparator() {
            new Scanner(`123_e`).scanTokens();
        }).to.throw();

        expect(function NoNumericSeparatorAfterExponentiation() {
            new Scanner(`123e_`).scanTokens();
        }).to.throw();

        expect(function DisallowEndingInNumericSeparator() {
            new Scanner(`123_`).scanTokens();
        }).to.throw();

        expect(function DisallowIdentifiersFollowingNumbers() {
            new Scanner(`123abc`).scanTokens();
        }).to.throw();
    });
});
