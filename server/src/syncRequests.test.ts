import test, { describe } from "node:test";
import { syncRequests } from "./syncRequests.ts";

function log(o:any) {
    console.log(JSON.stringify(o, null, 2));
}

describe("syncRequests", () => {
    test("get", async () => {
        const result = await syncRequests();
        log(result);
    })
})