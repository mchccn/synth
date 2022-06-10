import type {
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

// should have options like max-width
// needs to preserve padding goddamnit
export class Formatter implements ExprVisitor<string> {
    static pad = (s: string) =>
        s
            .split("\n")
            .map((s) => "    " + s)
            .join("\n");

    constructor(/* more shit here */) {}

    format(expr: Expr) {
        return expr.accept(this);
    }

    visitArrayExpr(expr: ArrayExpr): string {
        return `${expr.expr.accept(this)}[]`;
    }

    visitCallExpr(expr: CallExpr): string {
        return expr.args.size
            ? `${expr.identifier.lexeme}(${[...expr.args.entries()]
                  .map(([n, a]) => `${n}: ${a.accept(this)}`)
                  .join(", ")})`
            : expr.identifier.lexeme;
    }

    visitGroupingExpr(expr: GroupingExpr): string {
        return `(${expr.expr.map((e) => e.accept(this)).join(" ")})`;
    }

    visitLiteralExpr(expr: LiteralExpr): string {
        return expr.token.lexeme;
    }

    visitObjectExpr(expr: ObjectExpr): string {
        return `{\n${Formatter.pad(expr.props.map((prop) => prop.accept(this)).join("\n"))}\n}`;
    }

    visitPropExpr(expr: PropExpr): string {
        return `${expr.name instanceof RegExp ? `r"${expr.name.source}"` : expr.name}: ${expr.value.accept(this)};`;
    }

    visitTupleExpr(expr: TupleExpr): string {
        return `[${expr.elements.map((e) => e.accept(this)).join(", ")}]`;
    }

    visitUnaryExpr(expr: UnaryExpr): string {
        return `${expr.operator.lexeme}${expr.operator.lexeme === "not" ? " " : ""}${expr.expr.accept(this)}`;
    }
}
