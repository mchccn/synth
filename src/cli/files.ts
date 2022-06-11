import { readdir } from "fs/promises";
import { join } from "path";

export const allFiles = async (dir: string, { ext }: { ext: string }): Promise<string[]> =>
    (
        await Promise.all(
            (await readdir(dir, { withFileTypes: true }).catch(() => [])).map(async (d) => {
                if (d.isFile()) return d.name.endsWith("." + ext) ? [join(dir, d.name)] : [];

                if (d.isDirectory()) return await allFiles(join(dir, d.name), { ext });

                return [];
            }),
        )
    ).flat();
