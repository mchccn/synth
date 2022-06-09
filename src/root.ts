import { sep } from "path";

export const root = new URL(import.meta.url).pathname.replaceAll("/", sep).replace(/\/([^/]+)$/, "");
