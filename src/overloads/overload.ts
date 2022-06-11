import { TupleNode } from "../core/providers/tuple.js";
import { synthesizedModuleKey } from "../core/shared/constants.js";
import { Synthesized } from "../core/synthesize.js";
import { is } from "../guards/is.js";
import type { GetNodeType, InferParams, Narrow, OverloadsFrom } from "../types.js";

class OverloadedFunction<Result = {}> {
    #signatures = [] as [signature: Synthesized, executor: (...args: any[]) => any][];

    signature<
        S extends readonly Synthesized[],
        E extends (...args: { [K in keyof S]: S[K] extends Synthesized<infer T> ? GetNodeType<T> : S[K] }) => unknown,
    >(signature: Narrow<S>, executor: E): OverloadedFunction<Result & { (...args: Parameters<E>): ReturnType<E> }> {
        this.#signatures.push([
            new Synthesized(new TupleNode(signature.map((s) => Reflect.get(s, Symbol.for(synthesizedModuleKey))))),
            executor,
        ]);

        return this as any;
    }

    finalize(): Result extends (...args: any[]) => any ? Result : never {
        if (!this.#signatures.length)
            throw new Error(`Unable to finalize overloaded function; no signatures were provided.`);

        return ((...args: unknown[]) => {
            const [, executor] = this.#signatures.find(([s]) => is(s, args)) ?? [];

            if (!executor) throw new TypeError(`No overload matches this call.`);

            return executor(...args);
        }) as ReturnType<OverloadedFunction<Result>["finalize"]>;
    }
}

export function overload(): OverloadedFunction;
export function overload<S extends Record<string, (...args: any[]) => any>>(
    signatures: InferParams<S>,
): OverloadsFrom<S>;
export function overload() {
    return new OverloadedFunction();
}
