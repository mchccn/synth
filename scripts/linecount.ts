import { readdir, readFile } from "fs/promises";
import { join } from "path";

async function linecount(directory: string) {
    const dirents = await readdir(directory, { withFileTypes: true });

    let count = 0;
    let sloc = 0;

    await Promise.all(
        dirents.map(async (d) => {
            if (d.isFile() && d.name.endsWith(".ts")) {
                const contents = await readFile(join(directory, d.name), "utf8");

                count += contents.split("\n").length;
                sloc += contents.split("\n").filter((l) => l.trim()).length;

                return;
            }

            if (d.isDirectory()) {
                [count, sloc] = (await linecount(join(directory, d.name))).map((x, i) => x + [count, sloc][i]);

                return;
            }
        }),
    );

    return [count, sloc] as [count: number, sloc: number];
}

const directory = join(process.cwd(), process.argv[2] ?? process.env.LC_PATH ?? ".");

const [lines, sloc] = await linecount(directory);

console.log(`
Total lines: ${lines}
Source lines: ${sloc}
`);
