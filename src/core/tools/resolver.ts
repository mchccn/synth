import {
    ArrayExpr,
    CallExpr,
    Expr,
    ExprVisitor,
    GroupingExpr,
    LiteralExpr,
    ObjectExpr,
    PropExpr,
    TupleExpr,
    UnaryExpr,
} from "../base/expr.js";
import { Token } from "../base/token.js";
import { TokenType } from "../base/tokentype.js";
import * as constraints from "../generators/index.js";
import { SynthesizerSyntaxError } from "../shared/errors.js";

export class Resolver implements ExprVisitor<Expr> {
    #source!: string;

    constructor(/* more shit here */) {}

    resolve(source: string, expr: Expr) {
        this.#source = source;

        try {
            return expr.accept(this);
        } finally {
            this.#source = undefined as never;
        }
    }

    visitArrayExpr(expr: ArrayExpr): Expr {
        Reflect.set(expr, "expr", expr.expr.accept(this));

        return expr;
    }

    visitCallExpr(expr: CallExpr): Expr {
        [...expr.args.entries()].forEach(([name, arg]) => {
            if (!(arg instanceof LiteralExpr))
                throw new SynthesizerSyntaxError(this.#source, name, `Arguments must be literals.`);

            return arg.accept(this);
        });

        if (expr.identifier.name === "NaN") {
            if (expr.raw.size)
                throw new SynthesizerSyntaxError(this.#source, expr.identifier, `NaN does not expect any arguments.`);

            return new LiteralExpr(
                NaN,
                new Token(
                    TokenType.NumberLiteral,
                    "NaN",
                    NaN,
                    expr.identifier.index,
                    expr.identifier.line,
                    expr.identifier.col,
                ),
            );
        }

        if (expr.identifier.name === "Infinity") {
            if (expr.raw.size)
                throw new SynthesizerSyntaxError(
                    this.#source,
                    expr.identifier,
                    `Infinity does not expecet any arguments`,
                );

            return new LiteralExpr(
                Infinity,
                new Token(
                    TokenType.NumberLiteral,
                    "Infinity",
                    Infinity,
                    expr.identifier.index,
                    expr.identifier.line,
                    expr.identifier.col,
                ),
            );
        }

        if (!(expr.identifier.lexeme in constraints))
            throw new SynthesizerSyntaxError(
                this.#source,
                expr.identifier,
                `The identifier '${expr.identifier.lexeme}' does not exist.`,
            );

        return expr;
    }

    visitGroupingExpr(expr: GroupingExpr): Expr {
        Reflect.set(
            expr,
            "expr",
            expr.expr.map((e) => e.accept(this)),
        );

        return expr;
    }

    visitLiteralExpr(expr: LiteralExpr): Expr {
        return expr;
    }

    visitObjectExpr(expr: ObjectExpr): Expr {
        Reflect.set(
            expr,
            "props",
            expr.props.map((prop) => prop.accept(this)),
        );

        return expr;
    }

    visitPropExpr(expr: PropExpr): Expr {
        Reflect.set(expr, "value", expr.value.accept(this));

        return expr;
    }

    visitTupleExpr(expr: TupleExpr): Expr {
        Reflect.set(
            expr,
            "elements",
            expr.elements.map((e) => e.accept(this)),
        );

        return expr;
    }

    visitUnaryExpr(expr: UnaryExpr): Expr {
        if (expr.operator.type === TokenType.Minus) {
            Reflect.set(expr, "expr", expr.expr.accept(this));

            if (!(expr.expr instanceof LiteralExpr) || typeof expr.expr.value !== "number")
                throw new SynthesizerSyntaxError(
                    this.#source,
                    expr.operator,
                    `Unary negation operator can only be used on number literals.`,
                );

            return new LiteralExpr(-expr.expr.value, expr.expr.token);
        }

        throw new Error("Unknown unary operator received.");
    }
}
