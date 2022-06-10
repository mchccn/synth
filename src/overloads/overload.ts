import { is } from "src/guards/is.js";
import { TupleNode } from "../core/providers/tuple.js";
import { Synthesized } from "../core/synthesize.js";
import type { GetNodeType, Narrow } from "../core/types.js";

export function overload() {
    const signatures = [] as [signature: Synthesized, executor: (...args: any[]) => any][];

    return new (class _<Result = {}> {
        signature<S extends readonly Synthesized[]>(
            signature: Narrow<S>,
            executor: (
                ...args: { [K in keyof S]: S[K] extends Synthesized<infer T> ? GetNodeType<T> : S[K] }
            ) => unknown,
        ) {
            signatures.push([new Synthesized(new TupleNode(signature.map((s) => Reflect.get(s, "module")))), executor]);

            return this;
        }

        finalize(): Result extends (...args: any[]) => any ? Result : never {
            if (!signatures) throw new Error(`Unable to finalize overloaded function; no signatures were provided.`);

            return ((...args: unknown[]) => {
                const [, executor] = signatures.find(([s]) => is(s, args)) ?? [];

                if (!executor) throw new TypeError(`No overload matches this call.`);

                return executor(...args);
            }) as ReturnType<_<Result>["finalize"]>;
        }
    })();
}
