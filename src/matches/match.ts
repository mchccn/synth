import type { ValidationNode } from "../core/providers/node.js";
import type { Synthesized } from "../core/synthesize.js";
import type { GetNodeType } from "../types.js";
import { is } from "../guards/is.js";

export function match() {
    return new (class UnknownMatcher<Result = never, Default = undefined> {
        #cases = [] as [pattern: Synthesized, executor: (value: any) => any][];
        #default: ((value: unknown) => unknown) | undefined = undefined;

        case<T extends ValidationNode, E extends (value: GetNodeType<T>) => unknown>(
            pattern: Synthesized<T>,
            executor: E,
        ): UnknownMatcher<Result | ReturnType<E>, Default> {
            this.#cases.push([pattern, executor]);

            return this;
        }

        default<E extends (value: unknown) => unknown>(executor: E): UnknownMatcher<Result, ReturnType<E>> {
            this.#default = executor;

            return this as any;
        }

        test(value: unknown): Result | Default {
            const [, executor] = this.#cases.find(([p]) => is(p, value)) ?? [];

            if (!executor) return (this.#default?.(value) ?? undefined) as Default;

            return executor(value);
        }
    })();
}
