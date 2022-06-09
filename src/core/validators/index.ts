// cd dist/functions && for f in $(ls | grep -v index.js | grep -v constraint.js | grep .js); do echo "export * from \"./$f\";"; done && cd ../..
export * from "./min.js";
export * from "./range.js";
export * from "./regex.js";
