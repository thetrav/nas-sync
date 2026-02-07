import test, { describe } from "node:test";
import { requests } from "./overseer.ts";

describe("overseer", () => {
    test.skip("requests", async () => {
        const result = await requests();
        console.log(JSON.stringify(result, null, 2));
    })
})