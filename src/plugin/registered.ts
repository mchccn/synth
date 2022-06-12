import type { createBaseProvider, createProviderExtension } from "../core/generators/generators.js";
import type { ValidationNode } from "../core/providers/node.js";
import type { NodeConstraint } from "../core/validators/constraint.js";

export const registeredGenerators = {} as Record<
    string,
    ReturnType<typeof createBaseProvider | typeof createProviderExtension>
>;

export const registeredProviders = {} as Record<string, ValidationNode>;

export const registeredValidators = {} as Record<string, NodeConstraint>;
