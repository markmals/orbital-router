import { describe, expect, test } from "vitest"
import { greet } from "./greet"

describe("package name", () => {
    let testCases = [
        { input: "Mark", output: "Hello Mark" },
        { input: "Melissa", output: "Hello Melissa" },
    ]

    for (let { input, output } of testCases) {
        test(`greet with name ${input}`, () => {
            let result = greet(input)
            expect(result).toEqual(output)
        })
    }
})
