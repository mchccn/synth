import arg from "arg";
import { writeFile } from "fs/promises";
import { join } from "path";
import { root } from "../root.js";
import { allFiles } from "./files.js";
import { generate } from "./generate.js";
import { help } from "./help.js";

export default async () => {
    process.env.SYNTH_CLI_EXECUTING = "true";

    const args = Object.assign(
        {
            "--help": false,
            "--extension": "synth",
            "--clear": false,
            "--show": false,
            "--print": false,
        },
        arg({
            "--help": Boolean,
            "--extension": String,
            "--clear": Boolean,
            "--show": Boolean,
            "--print": Boolean,

            "-h": "--help",
            "-e": "--extension",
            "-c": "--clear",
            "-s": "--show",
            "-p": "--print",
        }),
    );

    if (args["--clear"]) {
        await writeFile(join(root, "..", "precompiled.js"), `export {};`, "utf8");
        await writeFile(join(root, "..", "precompiled.d.ts"), `export {};`, "utf8");

        return;
    }

    if (args["--show"]) process.env.SYNTH_SHOW_LINTS = "true";
    if (args["--print"]) process.env.SYNTH_PRINT_ONLY = "true";

    if (!args._.length || args["--help"]) return console.log(help);

    if (!process.env.SYNTH_PRINT_ONLY) {
        const start = Date.now();

        console.log("📁 Retrieving all files...");

        const paths = await allFiles(join(process.cwd(), args._[0]), { ext: args["--extension"] });

        console.log("🔄 Generating JavaScript and type declarations...");

        console.log();

        const [js, ts] = await generate(paths);

        console.log();

        console.log("📝 Writing results to files...");

        await writeFile(join(root, "..", "precompiled.js"), js, "utf8");
        await writeFile(join(root, "..", "precompiled.d.ts"), ts, "utf8");

        console.log(`⚡︎ Done in ${Date.now() - start}ms!`);
    } else {
        const paths = await allFiles(join(process.cwd(), args._[0]), { ext: args["--extension"] });

        const [out] = await generate(paths);

        console.log(out);
    }
};
