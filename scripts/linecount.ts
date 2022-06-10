import chalk from "chalk";
import { readdir, readFile, stat } from "fs/promises";
import { join } from "path";

async function linecount(target: string, ext = "ts"): Promise<[count: number, sloc: number]> {
    const stats = await stat(target);

    let count = 0;
    let sloc = 0;

    if (stats.isDirectory()) {
        const dirents = await readdir(target, { withFileTypes: true });

        await Promise.all(
            dirents.map(async (d) => {
                if (d.isFile() && d.name.endsWith("." + ext)) {
                    const contents = await readFile(join(target, d.name), "utf8");

                    count += contents.split("\n").length;
                    sloc += contents.split("\n").filter((l) => l.trim()).length;

                    return;
                }

                if (d.isDirectory()) {
                    [count, sloc] = (await linecount(join(target, d.name), ext)).map((x, i) => x + [count, sloc][i]);

                    return;
                }
            }),
        );

        return [count, sloc];
    }

    if (stats.isFile()) {
        const contents = await readFile(target, "utf8");

        count += contents.split("\n").length;
        sloc += contents.split("\n").filter((l) => l.trim()).length;

        return [count, sloc];
    }

    return [NaN, NaN];
}

const given = (process.argv[2] ?? process.env.LC_PATH ?? ".").split(/(?<!\\),/);
const targets = given.map((path) => join(process.cwd(), path));
const extension = process.argv[3] ?? "ts";

const stats = await Promise.all(targets.map((d) => linecount(d, extension)));

const min = Math.min(...stats.flat());
const max = Math.max(...stats.flat());

const scale = (value: number, [a1, a2]: [number, number], [b1, b2]: [number, number]) =>
    ((value - a1) * (b2 - b1)) / (a2 - a1) + b1;

const grade = (count: number) =>
    chalk.level === 3
        ? chalk.rgb(
              Math.round(255 - scale(count, [min, max], [0, 1]) * 255),
              Math.round(128 + scale(count, [min, max], [0, 1]) * 127),
              Math.round(128 + scale(count, [min, max], [0, 1]) * 127),
          )(count)
        : count;

console.log(
    chalk.bold(`\nLine count results\n`),
    stats
        .sort((a, b) => a[0] - b[0])
        .map(
            ([lines, sloc], i) => `
${chalk.dim(given[i])}
Total lines  ${chalk.gray(":")} ${grade(lines)}
Source lines ${chalk.gray(":")} ${grade(sloc)}
`,
        )
        .join(""),
);
