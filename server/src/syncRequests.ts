import { requests } from "./overseer.ts";
import { getMovieByTmdbid, getMovieHistory } from "./radarr.ts";
import { getTorrentInfo } from "./rutorrent.ts";

export async function syncRequests() {
    const toCheck = await requests();
    const results = [];
    for(const r of toCheck.results) {
        if(r.media?.tmdbId) {
            const [movie] = await getMovieByTmdbid(r.media.tmdbId);
            if(movie) {
                const [history] = await getMovieHistory(movie.id);
                if(history?.data?.torrentInfoHash) {
                    const torrent = await getTorrentInfo(history.data.torrentInfoHash);
                    results.push(torrent);
                    //todo: check if torrent is already downloaded
                    //todo: add to queue if required
                }
            }
        }
    }
    return results;
}