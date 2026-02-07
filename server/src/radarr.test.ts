import test, { describe } from "node:test";
import { getMovieByTmdbid, getMovieHistory } from "./radarr.ts";

function log(o:any) {
    console.log(JSON.stringify(o, null, 2));
}

describe("radarr", () => {
    test.skip("getChain", async () => {
        const [movie] = await getMovieByTmdbid(1234);
        
        const [history] = await getMovieHistory(movie.id);

        //TODO: take history.data.torrentInfoHash and use it to get file path from rutorrent

        log(history);
    })
})