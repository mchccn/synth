import { expect } from "chai";
import {
    ArrayNode,
    BooleanNode,
    FunctionNode,
    NullNode,
    NumberNode,
    ObjectNode,
    StringNode,
    SymbolNode,
    TupleNode,
    UndefinedNode,
} from "../src/core/providers/index.js";

describe("Synthesizer validator nodes", () => {
    it("Works for general types", () => {
        expect(new StringNode(false).check("a string")).to.be.true;
        expect(new NumberNode(false).check(42)).to.be.true;
        expect(new BooleanNode(false).check(true)).to.be.true;
        expect(new SymbolNode().check(Symbol())).to.be.true;
        expect(new FunctionNode().check(() => {})).to.be.true;
        expect(new NullNode().check(null)).to.be.true;
        expect(new UndefinedNode().check(undefined)).to.be.true;

        expect(new StringNode(false).check(Symbol())).to.be.false;
        expect(new NumberNode(false).check("quoted")).to.be.false;
        expect(new BooleanNode(false).check(0)).to.be.false;
        expect(new SymbolNode().check(() => {})).to.be.false;
        expect(new FunctionNode().check(false)).to.be.false;
        expect(new NullNode().check(undefined)).to.be.false;
        expect(new UndefinedNode().check(null)).to.be.false;
    });

    it("Works for arrays", () => {
        expect(new ArrayNode(new StringNode(false)).check([])).to.be.true;
        expect(new ArrayNode(new StringNode(false)).check(["single"])).to.be.true;
        expect(new ArrayNode(new StringNode(false)).check(["1", "2", "3"])).to.be.true;
        expect(new ArrayNode(new NumberNode(false)).check([1, 2, 3])).to.be.true;
        expect(new ArrayNode(new ArrayNode(new BooleanNode(false))).check([])).to.be.true;
        expect(new ArrayNode(new ArrayNode(new BooleanNode(false))).check([[]])).to.be.true;
        expect(new ArrayNode(new ArrayNode(new BooleanNode(false))).check([[true]])).to.be.true;
        expect(new ArrayNode(new ArrayNode(new BooleanNode(false))).check([[], [], []])).to.be.true;
        expect(
            new ArrayNode(new ArrayNode(new BooleanNode(false))).check([
                [true, false],
                [false, true],
                [true, false],
            ]),
        ).to.be.true;

        expect(new ArrayNode(new StringNode(false)).check({})).to.be.false;
        expect(new ArrayNode(new StringNode(false)).check([42])).to.be.false;
        expect(new ArrayNode(new NumberNode(false)).check(["1", "2", "3"])).to.be.false;
        expect(new ArrayNode(new ArrayNode(new BooleanNode(false))).check([{}, {}, {}])).to.be.false;
        expect(
            new ArrayNode(new ArrayNode(new BooleanNode(false))).check([
                [0, 1, 0],
                [1, 0, 1],
            ]),
        ).to.be.false;
    });

    it("Works for tuples", () => {
        expect(new TupleNode([new StringNode(false)]).check(["string"])).to.be.true;

        expect(new TupleNode([new StringNode(false)]).check([])).to.be.false;
        expect(new TupleNode([new StringNode(false)]).check({})).to.be.false;
        expect(new TupleNode([new StringNode(false)]).check(["one", "two"])).to.be.false;

        expect(new TupleNode([new NumberNode(false), new BooleanNode(false)]).check([42, true])).to.be.true;

        expect(new TupleNode([new NumberNode(false), new BooleanNode(false)]).check([])).to.be.false;
        expect(new TupleNode([new NumberNode(false), new BooleanNode(false)]).check([true, 0])).to.be.false;
        expect(new TupleNode([new NumberNode(false), new BooleanNode(false)]).check(["42", "true"])).to.be.false;
    });

    it("Works for objects", () => {
        expect(new ObjectNode([]).check({})).to.be.true;
        expect(new ObjectNode([]).check({ extra: 0 })).to.be.true;

        expect(new ObjectNode([["foo", new StringNode(false), false]]).check({ foo: "string" })).to.be.true;
        expect(new ObjectNode([["foo", new StringNode(false), true]]).check({ foo: "string" })).to.be.true;
        expect(new ObjectNode([["foo", new StringNode(false), true]]).check({})).to.be.true;

        expect(
            new ObjectNode([
                ["foo", new StringNode(false), false],
                ["bar", new StringNode(false), false],
            ]).check({ foo: "string" }),
        ).to.be.false;
        expect(
            new ObjectNode([
                ["foo", new StringNode(false), false],
                ["bar", new NumberNode(false), true],
            ]).check({ foo: "string" }),
        ).to.be.true;
        expect(
            new ObjectNode([
                ["foo", new StringNode(false), false],
                ["bar", new NumberNode(false), false],
            ]).check({ foo: "string", bar: 42 }),
        ).to.be.true;
    });
});
