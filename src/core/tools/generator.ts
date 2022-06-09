// takes analyzed tree and generates pattern

import {
    ArrayExpr,
    CallExpr,
    Expr,
    ExprVisitor,
    GroupingExpr,
    LiteralExpr,
    ObjectExpr,
    OptionalExpr,
    PropExpr,
    TupleExpr,
    UnaryExpr,
} from "../base/expr.js";
import { TokenType } from "../base/tokentype.js";
import type { createBaseProvider, createProviderExtension } from "../generators/generators.js";
import * as generators from "../generators/index.js";
import { ArrayNode } from "../providers/array.js";
import { LiteralNode } from "../providers/literal.js";
import type { ValidationNode } from "../providers/node.js";
import { NoopNode } from "../providers/noop.js";
import { ObjectNode } from "../providers/object.js";
import { OptionalNode } from "../providers/optional.js";
import { TupleNode } from "../providers/tuple.js";

export class Generator implements ExprVisitor<ValidationNode> {
    constructor(/* more shit here */) {}

    generate(expr: Expr): ValidationNode {
        return expr.accept(this);
    }

    visitArrayExpr(expr: ArrayExpr): ValidationNode {
        return new ArrayNode(expr.expr.accept(this));
    }

    visitCallExpr(expr: CallExpr): ValidationNode<unknown> {
        const generator = generators[expr.identifier.lexeme as keyof typeof generators];

        if (generator.isModifier)
            throw new Error(`Synthesizer should not have to generate a node for a single call expression.`);

        return generator(
            Object.fromEntries([...expr.raw.entries()].map(([k, v]) => [k, (v as LiteralExpr).value])) as any,
        );
    }

    visitLiteralExpr(expr: LiteralExpr): ValidationNode<unknown> {
        if (expr.value instanceof RegExp)
            return generators.regex(new NoopNode(), { pattern: expr.value.source, flags: "" });

        return new LiteralNode(expr.value as any);
    }

    visitGroupingExpr(expr: GroupingExpr): ValidationNode<unknown> {
        if (expr.expr.length === 1) {
            const provider = expr.expr[0];

            return provider.accept(this);
        }

        const validators = [] as CallExpr[];

        expr.expr.forEach((e) => {
            if (e instanceof CallExpr) {
                validators.push(e);
            }

            // ...
        });

        const index = validators.findIndex(
            (v) => !generators[v.identifier.lexeme as keyof typeof generators].isModifier,
        )!;

        const [provider] = validators.splice(index, 1);

        const node = (
            generators[provider.identifier.lexeme as keyof typeof generators] as ReturnType<typeof createBaseProvider>
        )(Object.fromEntries([...provider.raw.entries()].map(([k, v]) => [k, (v as LiteralExpr).value])) as any);

        validators.forEach((v) => {
            (generators[v.identifier.lexeme as keyof typeof generators] as ReturnType<typeof createProviderExtension>)(
                node,
                Object.fromEntries([...v.raw.entries()].map(([k, v]) => [k, (v as LiteralExpr).value])) as any,
            );
        });

        return node;
    }

    visitObjectExpr(expr: ObjectExpr): ValidationNode<unknown> {
        return new ObjectNode(
            expr.props.map((p) => [p.name, p.value.accept(this), p.optional] as const),
            expr.unstrict,
        );
    }

    visitOptionalExpr(expr: OptionalExpr): ValidationNode<unknown> {
        return new OptionalNode(expr.expr.accept(this));
    }

    visitPropExpr(expr: PropExpr): ValidationNode<unknown> {
        return expr.value.accept(this);
    }

    visitTupleExpr(expr: TupleExpr): ValidationNode<unknown> {
        return new TupleNode(expr.elements.map((e) => e.accept(this)));
    }

    visitUnaryExpr(expr: UnaryExpr): ValidationNode<unknown> {
        if (expr.operator.type === TokenType.Minus)
            throw new Error("No negations should be left after the resolution step.");

        throw new Error("Unknown unary operator received.");
    }

    // ...
}
