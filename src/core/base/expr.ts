import type { Token } from "./token.js";

// Operations on our expression will need to implement this
export interface ExprVisitor<R> {
    visitArrayExpr(expr: ArrayExpr): R;
    visitGroupingExpr(expr: GroupingExpr): R;
    visitCallExpr(expr: CallExpr): R;
    visitLiteralExpr(expr: LiteralExpr): R;
    visitObjectExpr(expr: ObjectExpr): R;
    visitPropExpr(expr: PropExpr): R;
    visitTupleExpr(expr: TupleExpr): R;
    visitUnaryExpr(expr: UnaryExpr): R;
}

export abstract class Expr {
    readonly label = this.constructor.name;

    readonly copied = false;

    protected provided = [] as any[];

    abstract accept<R>(visitor: ExprVisitor<R>): R;

    clone() {
        return Object.assign(Reflect.construct(this.constructor, this.provided), { copied: true });
    }
}

export class ArrayExpr extends Expr {
    constructor(readonly expr: Expr, readonly start: Token, readonly end: Token) {
        super();

        this.provided = Array.from(arguments);
    }

    accept<R>(visitor: ExprVisitor<R>): R {
        return visitor.visitArrayExpr(this);
    }
}

export class CallExpr extends Expr {
    constructor(
        readonly identifier: Token,
        readonly args: Map<Token, Expr>,
        readonly raw = new Map([...args.entries()].map(([k, v]) => [k.lexeme, v])),
    ) {
        super();

        this.provided = Array.from(arguments);
    }

    accept<R>(visitor: ExprVisitor<R>): R {
        return visitor.visitCallExpr(this);
    }
}

export class GroupingExpr extends Expr {
    constructor(readonly expr: Expr[], readonly start: Token, readonly end: Token, readonly name: Token | undefined) {
        super();

        this.provided = Array.from(arguments);
    }

    accept<R>(visitor: ExprVisitor<R>): R {
        return visitor.visitGroupingExpr(this);
    }
}

export class LiteralExpr extends Expr {
    constructor(readonly value: unknown, readonly token: Token) {
        super();

        this.provided = Array.from(arguments);
    }

    accept<R>(visitor: ExprVisitor<R>): R {
        return visitor.visitLiteralExpr(this);
    }
}

export class ObjectExpr extends Expr {
    constructor(readonly props: PropExpr[], readonly start: Token, readonly end: Token) {
        super();

        this.provided = Array.from(arguments);
    }

    accept<R>(visitor: ExprVisitor<R>): R {
        return visitor.visitObjectExpr(this);
    }
}

export class PropExpr extends Expr {
    constructor(
        readonly name: string | RegExp,
        readonly token: Token,
        readonly value: GroupingExpr,
        readonly optional: boolean,
        readonly root = false,
    ) {
        super();

        this.provided = Array.from(arguments);
    }

    accept<R>(visitor: ExprVisitor<R>): R {
        return visitor.visitPropExpr(this);
    }
}

export class TupleExpr extends Expr {
    constructor(readonly elements: GroupingExpr[], readonly start: Token, readonly end: Token) {
        super();

        this.provided = Array.from(arguments);
    }

    accept<R>(visitor: ExprVisitor<R>): R {
        return visitor.visitTupleExpr(this);
    }
}

export class UnaryExpr extends Expr {
    constructor(readonly operator: Token, readonly expr: Expr) {
        super();

        this.provided = Array.from(arguments);
    }

    accept<R>(visitor: ExprVisitor<R>): R {
        return visitor.visitUnaryExpr(this);
    }
}
