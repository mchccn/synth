export function retreive<T>(target: unknown, path: string[]): T {
    return path.reduce(
        (result, key) =>
            (result && typeof result === "object"
                ? key in result
                    ? result[key as keyof typeof result]
                    : undefined
                : undefined) as any,
        target as T,
    );
}
