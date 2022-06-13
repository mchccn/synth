import type { createBaseProvider, createProviderExtension } from "../core/generators/generators.js";
import type * as builtinGenerators from "../core/generators/index.js";
import type * as builtinProviders from "../core/providers/index.js";
import type { ValidationNode } from "../core/providers/node.js";
import type { NodeConstraint } from "../core/validators/constraint.js";
import type * as builtinValidators from "../core/validators/index.js";
import type { NoOverrideBuiltIns } from "../types.js";
import { registeredGenerators, registeredProviders, registeredValidators } from "./registered.js";

export function registerGenerator<N extends string>(
    name: N extends keyof typeof builtinGenerators ? NoOverrideBuiltIns : N,
    generator: ReturnType<typeof createBaseProvider | typeof createProviderExtension>,
) {
    registeredGenerators[name] = generator;

    return generator;
}

export function registerProvider<N extends string>(
    name: N extends keyof typeof builtinProviders ? NoOverrideBuiltIns : N,
    provider: ValidationNode,
) {
    registeredProviders[name] = provider;

    return provider;
}

export function registerValidator<N extends string>(
    name: N extends keyof typeof builtinValidators ? NoOverrideBuiltIns : N,
    validator: NodeConstraint,
) {
    registeredValidators[name] = validator;

    return validator;
}
