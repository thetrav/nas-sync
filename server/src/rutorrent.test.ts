import test, { describe } from "node:test";
import { getTorrentInfo } from "./rutorrent.ts";

function log(o:any) {
    console.log(JSON.stringify(o, null, 2));
}

describe("rutorrent", () => {
    test.skip("getTorrentInfo", async () => {
        const result = await getTorrentInfo("SOMEHASH");
        log(result);
    })
})