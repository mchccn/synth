import { writeFileSync } from "fs";
import { join, sep } from "path";
import * as generators from "../dist/core/generators/index.js";

const tmLanguage = {
    $schema: "https://raw.githubusercontent.com/martinring/tmlanguage/master/tmlanguage.json",
    name: "Synth",
    patterns: [
        { include: "#comments" },
        { include: "#punctuation" },
        { include: "#keywords" },
        { include: "#strings" },
        { include: "#property" },
        { include: "#constants" },
    ],
    repository: {
        punctuation: {
            patterns: [
                {
                    name: "punctuation.terminator.statement.synth",
                    match: ";",
                },
                {
                    name: "keyword.operator.synth",
                    match: ":",
                },
                {
                    name: "punctuation.definition.block.synth",
                    match: "[\\{\\}\\[\\]]",
                },
                {
                    name: "meta.brace.synth",
                    match: "[\\(\\)]",
                },
            ],
        },
        comments: {
            patterns: [
                {
                    name: "comment.single-line.synth",
                    begin: "#",
                    end: "\n",
                },
            ],
        },
        keywords: {
            patterns: [
                {
                    name: "type.synth",
                    match: `\\b(${Object.entries(generators)
                        .filter(([, v]) => !v.isModifier)
                        .map(([k]) => k)
                        .join("|")})\\b`,
                },
                {
                    name: "function.synth",
                    match: `\\b(${Object.entries(generators)
                        .filter(([, v]) => v.isModifier)
                        .map(([k]) => k)
                        .join("|")})\\b`,
                },
            ],
        },
        property: {
            patterns: [
                {
                    name: "variable.synth",
                    match: "[a-zA-Z_$][a-zA-Z0-9_$]*",
                },
            ],
        },
        strings: {
            patterns: [
                {
                    name: "string.source.double.quo",
                    begin: 's"',
                    end: '"',
                    patterns: [
                        {
                            name: "constant.character.escape.synth",
                            match: "\\\\.",
                        },
                    ],
                },
                {
                    name: "string.source.single.quo",
                    begin: "s'",
                    end: "'",
                    patterns: [
                        {
                            name: "constant.character.escape.synth",
                            match: "\\\\.",
                        },
                    ],
                },
                {
                    name: "string.regexp.double.quo",
                    begin: 'r"',
                    end: '"',
                    patterns: [
                        {
                            name: "constant.character.escape.synth",
                            match: "\\\\.",
                        },
                    ],
                },
                {
                    name: "string.regexp.single.quo",
                    begin: "r'",
                    end: "'",
                    patterns: [
                        {
                            name: "constant.character.escape.synth",
                            match: "\\\\.",
                        },
                    ],
                },
                {
                    name: "string.quoted.double.quo",
                    begin: '"',
                    end: '"',
                    patterns: [
                        {
                            name: "constant.character.escape.synth",
                            match: "\\\\.",
                        },
                    ],
                },
                {
                    name: "string.quoted.single.quo",
                    begin: "'",
                    end: "'",
                    patterns: [
                        {
                            name: "constant.character.escape.synth",
                            match: "\\\\.",
                        },
                    ],
                },
            ],
        },
        constants: {
            patterns: [
                {
                    name: "constant.numeric.binary.synth",
                    match: "0b[01_]+(\\.[01_]*)?(e[01_]+(\\.[01_]*)?)?",
                },
                {
                    name: "constant.numeric.octal.synth",
                    match: "0o[0-7_]+(\\.[0-7_]*)?(e[0-7_]+(\\.[0-7_]*)?)?",
                },
                {
                    name: "constant.numeric.hex.synth",
                    match: "0x[0-9a-fA-F_]+(\\.[0-9a-fA-F_]*)?(e[0-9a-fA-F_]+(\\.[0-9a-fA-F_]*)?)?",
                },
                {
                    name: "constant.numeric.decimal.synth",
                    match: "[\\d_]+(\\.[\\d_]*)?(e[\\d_]+(\\.[\\d_]*)?)?",
                },
                {
                    name: "support.variable.synth",
                    match: "\\b(true|false)\\b",
                },
            ],
        },
    },
    scopeName: "source.synth",
};

const folder = new URL(import.meta.url).pathname.replace(/\//, sep).replace(/\/([^/]+)$/, "");

writeFileSync(
    join(folder, "..", "extension", "syntaxes", "synth.tmLanguage.json"),
    JSON.stringify(tmLanguage, undefined, 4),
    "utf8",
);
