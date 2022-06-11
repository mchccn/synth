import type chalk from "chalk";
import type { TokenType } from "./base/tokentype.js";
import type { ValidationNode } from "./providers/node.js";
import type { Synthesized } from "./synthesize.js";

export type TryNodeType<T> = T extends ValidationNode<infer U> ? U : T;
export type GetNodeType<T> = T extends ValidationNode<infer U> ? U : never;

export type GetSynthesized<T> = T extends Synthesized<infer N> ? GetNodeType<N> : never;

// Replace with better Narrow
type NarrowHelper<T> =
    | (T extends [] ? [] : never)
    | (T extends string | number | bigint | boolean ? T : never)
    | { [K in keyof T]: T[K] extends (...args: any[]) => unknown ? T[K] : NarrowHelper<T[K]> };

type Try<A1 extends any, A2 extends any, Catch = never> = A1 extends A2 ? A1 : Catch;

export type Narrow<T> = Try<T, [], NarrowHelper<T>>;
//

export type GetTupleType<Modules> = { [K in keyof Modules]: TryNodeType<Modules[K]> };

export type GetObjectType<T extends readonly (readonly [string | RegExp, ValidationNode, boolean])[]> = {
    [K in Extract<T[number], readonly [any, any, false]>[0] as K extends RegExp ? string : K]: K extends RegExp
        ? GetNodeType<Extract<T[number], readonly [RegExp, any, any]>[1]>
        : GetNodeType<Extract<T[number], readonly [K, any, any]>[1]>;
} & {
    [K in Extract<T[number], readonly [any, any, true]>[0]]?: GetNodeType<
        Extract<T[number], readonly [K, any, any]>[1]
    >;
} extends infer O
    ? { [K in keyof O]: O[K] }
    : never;

export type NoStrictObjectNodesInIntersection = `Strict object nodes are disallowed in an intersection.`;

export type HighlightColors = Record<Methods<typeof chalk>, TokenType[]>;

export type Methods<T> = {
    [K in keyof T]: T[K] extends (...args: unknown[]) => any ? K : never;
}[keyof T];
