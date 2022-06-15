import type chalk from "chalk";
import type { TokenType } from "./core/base/tokentype.js";
import type { ValidationNode } from "./core/providers/node.js";
import type { Synthesized } from "./core/synthesize.js";

export type TryNodeType<T> = T extends ValidationNode<infer U> ? U : T;
export type GetNodeType<T> = T extends ValidationNode<infer U> ? U : never;

export type GetSynthesized<T> = T extends Synthesized<infer N, infer R>
    ? [R] extends [never]
        ? GetNodeType<N>
        : R
    : never;

export type Narrow<T> =
    | (T extends infer U ? U : never)
    | Extract<T, number | string | boolean | bigint | symbol | null | undefined | []>
    | ([T] extends [[]] ? [] : { [K in keyof T]: Narrow<T[K]> });

export type GetTupleType<Modules> = {
    [K in keyof Modules]: TryNodeType<Modules[K]>;
};

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

export type NoOverrideBuiltIns = [`This key already exists as a built-in to Synth.`];

export type HighlightColors = Record<Methods<typeof chalk>, TokenType[]>;

export type Methods<T> = {
    [K in keyof T]: T[K] extends (...args: unknown[]) => any ? K : never;
}[keyof T];

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;

export type OverloadsFrom<S> = UnionToIntersection<S[keyof S]>;

export type InferParams<S extends Record<string, (...args: any[]) => any>> = {
    // Parse `K` into parameter types
    [K in keyof S]: (...args: Parameters<S[K]>) => ReturnType<S[K]>;
};
