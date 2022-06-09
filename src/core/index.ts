import { synthesize } from "./synthesize.js";

// ...

const source = `\
{
    type: "PLUS";
    lhs: {
        type: "CONSTANT";
        value: number range(start: 0, end: 100);
    };
    rhs: {
        type: "CONSTANT";
        value: number;
    };
}
`;

const synthed = synthesize(source).lint();

console.log(synthed);

//@ts-ignore
export * from "../../precompiled.js";
