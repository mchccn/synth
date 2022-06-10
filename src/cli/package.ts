import { readFileSync } from "fs";
import { join } from "path";
import { root } from "../root.js";

export const pkg = JSON.parse(readFileSync(join(root, "..", "package.json"), "utf8"));
