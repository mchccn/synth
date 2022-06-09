import { readFile } from "fs/promises";
import { sep } from "path";
import * as providers from "../core/providers/index.js";
import * as validators from "../core/validators/index.js";
import { compile } from "./compile.js";

export async function generate(paths: string[]): Promise<[js: string, ts: string]> {
    const sources = await Promise.all(
        paths.map(async (path) => {
            const source = await readFile(path, "utf8");
            const name = path
                .split(sep)
                .reverse()[0]
                .replace(/\.([^.]+)$/, "");
            return { path, source, name };
        }),
    );

    const compiled = sources.map(({ path, source }) => ((process.env.SYNTH_COMPILING_PATH = path), compile(source)));

    process.env.SYNTH_COMPILING_PATH = undefined;

    const js =
        `\
import { ${Object.keys(validators).join(", ")} } from "./dist/core/validators/index.js";
import { ${Object.keys(providers).join(", ")} } from "./dist/core/providers/index.js";
import { Synthesized } from "./dist/core/synthesize.js";
\n` +
        (sources.length
            ? sources
                  .map(({ path, name }, i) => `// ${path}\nexport const ${name} = new Synthesized(${compiled[i][0]});`)
                  .join("\n\n")
            : `export {};`);

    const ts =
        `\
import { ${Object.keys(validators).join(", ")} } from "./dist/core/validators/index.js";
import { ${Object.keys(providers).join(", ")} } from "./dist/core/providers/index.js";
import { Synthesized } from "./dist/core/synthesize.js";
\n` +
        (sources.length
            ? sources
                  .map(
                      ({ path, name }, i) => `// ${path}\nexport declare const ${name}: Synthesized<${compiled[i][1]}>`,
                  )
                  .join("\n\n")
            : `export {};`);

    return [js, ts];
}
