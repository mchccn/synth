import { expect } from "chai";
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
} from "../src/core/base/expr.js";
import { Parser } from "../src/core/base/parser.js";
import { Scanner } from "../src/core/base/scanner.js";
import { Token } from "../src/core/base/token.js";

describe("Synthesizer parser", () => {
    function suite<S extends readonly string[]>(
        message: string,
        sources: S,
        tester: (exprs: { [K in keyof S]: Expr }) => void,
    ) {
        it(message, () => {
            const exprs = sources.map((source) => {
                const tokens = new Scanner(source).scanTokens();

                const expr = new Parser(source, tokens).parseTokens();

                return expr.expr[0];
            });

            tester(exprs as never);
        });
    }

    suite(
        "Correctly parses primitive types",
        [`string`, `number`, `boolean`, `null`, `undefined`] as const,
        ([string, number, boolean, nil, undef]) => {
            expect(string)
                .to.be.an.instanceof(CallExpr)
                .and.to.have.a.property("identifier")
                .that.is.an.instanceof(Token)
                .and.to.have.a.property("lexeme")
                .that.equals("string");
            expect(number)
                .to.be.an.instanceof(CallExpr)
                .and.to.have.a.property("identifier")
                .that.is.an.instanceof(Token)
                .and.to.have.a.property("lexeme")
                .that.equals("number");
            expect(boolean)
                .to.be.an.instanceof(CallExpr)
                .and.to.have.a.property("identifier")
                .that.is.an.instanceof(Token)
                .and.to.have.a.property("lexeme")
                .that.equals("boolean");
            expect(nil)
                .to.be.an.instanceof(CallExpr)
                .and.to.have.a.property("identifier")
                .that.is.an.instanceof(Token)
                .and.to.have.a.property("lexeme")
                .that.equals("null");
            expect(undef)
                .to.be.an.instanceof(CallExpr)
                .and.to.have.a.property("identifier")
                .that.is.an.instanceof(Token)
                .and.to.have.a.property("lexeme")
                .that.equals("undefined");
        },
    );

    suite("Correctly parses a unary operator", [`-42`] as const, ([expr]) => {
        expect(expr)
            .to.be.an.instanceof(UnaryExpr)
            .and.to.have.a.property("expr")
            .that.is.an.instanceof(LiteralExpr)
            .and.to.have.a.property("value")
            .that.equals(42);
    });

    suite("Correctly parses post modifiers", [`string[]`] as const, ([ar]) => {
        expect(ar)
            .to.be.an.instanceof(ArrayExpr)
            .and.to.have.a.property("expr")
            .that.is.an.instanceof(CallExpr)
            .and.to.have.a.property("identifier")
            .that.is.an.instanceof(Token)
            .and.to.have.a.property("lexeme")
            .that.equals("string");
    });

    suite(
        "Correctly parses literal types",
        [`"hello"`, `r"regex"`, `s"source\\n"`, `42`, `0b11`, `0o77`, `0xff`, `true`] as const,
        ([str, rx, raw, num, numb, numo, numx, bool]) => {
            expect(str).to.be.an.instanceof(LiteralExpr).and.to.have.a.property("value").that.equals("hello");
            expect(rx)
                .to.be.an.instanceof(LiteralExpr)
                .and.to.have.a.property("value")
                .that.is.an.instanceof(RegExp)
                .and.has.a.property("source")
                .that.equals("regex");
            expect(raw).to.be.an.instanceof(LiteralExpr).and.to.have.a.property("value").that.equals("source\\n");
            expect(num).to.be.an.instanceof(LiteralExpr).and.to.have.a.property("value").that.equals(42);
            expect(numb).to.be.an.instanceof(LiteralExpr).and.to.have.a.property("value").that.equals(3);
            expect(numo).to.be.an.instanceof(LiteralExpr).and.to.have.a.property("value").that.equals(63);
            expect(numx).to.be.an.instanceof(LiteralExpr).and.to.have.a.property("value").that.equals(255);
            expect(bool).to.be.an.instanceof(LiteralExpr).and.to.have.a.property("value").that.equals(true);
        },
    );

    suite("Correctly parses a grouping expression", [`("group")`] as const, ([expr]) => {
        expect(expr)
            .to.be.an.instanceof(GroupingExpr)
            .and.to.have.a.property("expr")
            .that.has.a.property("0")
            .that.is.an.instanceof(LiteralExpr)
            .and.to.have.a.property("value")
            .that.equals("group");
    });

    suite("Correctly parses object expressions", [`{}`, `{ foo: symbol; }`] as const, ([empty, foo]) => {
        expect(empty)
            .to.be.an.instanceof(ObjectExpr)
            .and.to.have.a.property("props")
            .that.is.an.instanceof(Array)
            .and.to.have.a.lengthOf(0);

        expect(foo)
            .to.be.an.instanceof(ObjectExpr)
            .and.to.have.a.property("props")
            .that.is.an.instanceof(Array)
            .and.satisfies((props: any[]) => props.every((p) => p instanceof PropExpr))
            .and.to.have.a.lengthOf(1);
    });

    suite(
        "Correctly parses tuple expressions",
        [`[]`, `[string]`, `[string, number]`] as const,
        ([empty, one, two]) => {
            expect(empty)
                .to.be.an.instanceof(TupleExpr)
                .and.to.have.a.property("elements")
                .that.is.an.instanceof(Array)
                .and.to.have.a.lengthOf(0);

            expect(one)
                .to.be.an.instanceof(TupleExpr)
                .and.to.have.a.property("elements")
                .that.is.an.instanceof(Array)
                .and.to.have.a.lengthOf(1);

            expect(two)
                .to.be.an.instanceof(TupleExpr)
                .and.to.have.a.property("elements")
                .that.is.an.instanceof(Array)
                .and.to.have.a.lengthOf(2);
        },
    );
});
