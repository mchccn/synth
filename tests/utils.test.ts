import { expect } from "chai";
import { levenGetClosest, mergeWithDefaults, oneOfTheThingsIn } from "../src/core/shared/utils.js";

describe("Project utilities", () => {
    it("Formats lists correctly", () => {
        expect(() => oneOfTheThingsIn([])).to.throw;
        expect(oneOfTheThingsIn(["1"])).to.equal("'1'");
        expect(oneOfTheThingsIn(["1", "2"])).to.equal("'1' or '2'");
        expect(oneOfTheThingsIn(["1", "2", "3"])).to.equal("'1', '2' or '3'");
        expect(oneOfTheThingsIn(["1", "2", "3", "4"])).to.equal("'1', '2', '3' or '4'");
    });

    it("Suggests reasonable things", () => {
        expect(levenGetClosest("somthn", ["something", "smfh", "somersault"])[2]).to.equal("something");
        expect(levenGetClosest("hypurtxt", ["hypertext", "supertext", "ultratxt"])[2]).to.equal("hypertext");
        expect(levenGetClosest("tipeskkript", ["typescript", "coffeescript", "javascript"])[2]).to.equal("typescript");
    });

    it("Merges stuff correctly", () => {
        expect(
            mergeWithDefaults(
                {
                    key: false,
                    other: 0,
                },
                {
                    key: true,
                    other: 42,
                },
            ),
        ).to.deep.equal({
            key: false,
            other: 0,
        });

        expect(
            mergeWithDefaults(
                {
                    key: false,
                },
                {
                    key: true,
                    other: 42,
                },
            ),
        ).to.deep.equal({
            key: false,
            other: 42,
        });

        expect(
            mergeWithDefaults(
                {},
                {
                    key: true,
                    other: 42,
                },
            ),
        ).to.deep.equal({
            key: true,
            other: 42,
        });
    });
});
