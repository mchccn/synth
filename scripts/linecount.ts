import chalk from "chalk";
import { constants } from "fs";
import { access, readdir, readFile, stat } from "fs/promises";
import { join } from "path";

if (process.platform === "win32") throw new Error("Fuck off, Windows user.");

async function linecount(target: string, extensions = ["ts"]): Promise<[lines: number, sloc: number]> {
    let lines = 0;
    let sloc = 0;

    if (
        await access(target, constants.R_OK)
            .then(() => false)
            .catch(() => true)
    ) {
        console.log(chalk.redBright`error -`, `cannot count ${target.replace(process.env.HOME!, "~")}`);

        return [lines, sloc];
    }

    console.log(chalk.blueBright`info  -`, `now counting ${target.replace(process.env.HOME!, "~")}`);

    const stats = await stat(target);

    if (stats.isDirectory()) {
        const dirents = await readdir(target, { withFileTypes: true });

        for (const d of dirents) {
            if (d.isFile() && extensions.some((ext) => d.name.endsWith("." + ext))) {
                console.log(
                    chalk.magentaBright`event -`,
                    `reading file ${join(target, d.name).replace(process.env.HOME!, "~")}`,
                );

                const contents = await readFile(join(target, d.name), "utf8");

                lines += contents.split("\n").length;
                sloc += contents.split("\n").filter((l) => l.trim()).length;
            }

            if (d.isDirectory()) {
                [lines, sloc] = (await linecount(join(target, d.name), extensions)).map((x, i) => x + [lines, sloc][i]);
            }
        }

        return [lines, sloc];
    }

    if (stats.isFile()) {
        console.log(chalk.magentaBright`event -`, `reading file ${target.replace(process.env.HOME!, "~")}`);

        const contents = await readFile(target, "utf8");

        lines += contents.split("\n").length;
        sloc += contents.split("\n").filter((l) => l.trim()).length;

        return [lines, sloc];
    }

    return [NaN, NaN];
}

const given = (process.argv[2] ?? process.env.LC_PATH ?? ".").split(/(?<!\\),/);
const targets = given.map((path) => join(process.cwd(), path));
const extensions = (process.argv[3] ?? process.env.LC_EXT ?? "ts").split(/(?<!\\),/);

const stats = await Promise.all(targets.map((d) => linecount(d, extensions)));

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
    chalk.bold(`\nline count results\n`),
    stats
        .sort((a, b) => a[0] - b[0])
        .map(
            ([lines, sloc], i) => `
${chalk.dim(targets[i].replace(process.env.HOME!, "~"))}
total lines  ${chalk.gray(":")} ${grade(lines)}
source lines ${chalk.gray(":")} ${grade(sloc)}
`,
        )
        .join(""),
);
