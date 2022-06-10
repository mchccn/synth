// resolves references and simplifies parsed expression

import {
    ArrayExpr,
    // BinaryExpr,
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
import * as constraints from "../generators/index.js";
import { SynthesizerSyntaxError } from "../shared/errors.js";

export class Resolver implements ExprVisitor<Expr> {
    private source!: string;

    constructor(/* more shit here */) {}

    resolve(source: string, expr: Expr) {
        this.source = source;

        try {
            return expr.accept(this);
        } finally {
            this.source = undefined as never;
        }
    }

    visitArrayExpr(expr: ArrayExpr): Expr {
        Reflect.set(expr, "expr", expr.expr.accept(this));

        return expr;
    }

    visitCallExpr(expr: CallExpr): Expr {
        [...expr.args.entries()].forEach(([name, arg]) => {
            if (!(arg instanceof LiteralExpr))
                throw new SynthesizerSyntaxError(this.source, name, `Arguments must be literals.`);

            return arg.accept(this);
        });

        if (!(expr.identifier.lexeme in constraints))
            throw new SynthesizerSyntaxError(
                this.source,
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
        if (!(expr.expr instanceof LiteralExpr) || typeof expr.expr.value !== "number")
            throw new SynthesizerSyntaxError(
                this.source,
                expr.operator,
                `Unary negation operator can only be used on number literals.`,
            );

        Reflect.set(expr, "expr", new LiteralExpr(-expr.expr.value, expr.expr.token));

        return expr;
    }
}
