import { readFile } from "fs/promises";
import { Scanner } from "../core/base/scanner.js";
import { compress } from "../core/shared/compress.js";

export async function minify(paths: string[]) {
    const sources = await Promise.all(paths.map(async (path) => readFile(path, "utf8")));

    return sources
        .map((s) => {
            const tokens = new Scanner(s).scanTokens();

            return compress(tokens);
        })
        .join("\n\n");
}
