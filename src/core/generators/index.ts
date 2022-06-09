// cd dist/core/generators && for f in $(ls | grep -v index.js | grep -v generators.js | grep .js); do echo "export * from \"./$f\";"; done && cd ../../..
export * from "./boolean.js";
export * from "./max.js";
export * from "./min.js";
export * from "./number.js";
export * from "./range.js";
export * from "./regex.js";
export * from "./string.js";
