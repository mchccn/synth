import leven from "leven";

export function levenGetClosest(source: string, targets: string[]) {
    const scores = targets.map((target, i) => leven(target, source));

    const min = Math.min(...scores);

    const i = scores.indexOf(min);

    return [i, scores[i], targets[i]] as [index: number, score: number, target: string];
}

export function didYouMean(source: string, targets: string[]) {
    const [, score, target] = levenGetClosest(source, targets);

    if (score <= 2) return `Did you mean '${target}'?`;

    return undefined;
}

export function oneOfTheThingsIn(list: readonly string[]) {
    if (!list.length) throw new Error(`List to format was empty.`);

    if (list.length === 1) return `'${list[0]}'`;

    if (list.length === 2) return `'${list[0]}' or '${list[1]}'`;

    return `${list
        .slice(0, -1)
        .map((item) => `'${item}'`)
        .join(", ")} or '${list[list.length - 1]}'`;
}
