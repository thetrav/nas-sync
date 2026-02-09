import { requests } from "./overseer.ts";
import { getMovieByTmdbid, getMovieHistory } from "./radarr.ts";
import { getTorrentInfo } from "./rutorrent.ts";
import { filterExistingFiles } from "./localFileSystem.ts";

export type RequestsService = typeof requests;
export interface RadarrService {
    getMovieByTmdbid: typeof getMovieByTmdbid;
    getMovieHistory: typeof getMovieHistory;
}
export type RutorrentService = typeof getTorrentInfo;
export type LocalFileSystemService = typeof filterExistingFiles;

export class SyncRequests {
    private requestsService: RequestsService;
    private radarrService: RadarrService;
    private rutorrentService: RutorrentService;
    private localFileSystemService: LocalFileSystemService;

    constructor(
        requestsService: RequestsService = requests,
        radarrService: RadarrService = {
            getMovieByTmdbid,
            getMovieHistory
        },
        rutorrentService: RutorrentService = getTorrentInfo,
        localFileSystemService: LocalFileSystemService = filterExistingFiles
    ) {
        this.requestsService = requestsService;
        this.radarrService = radarrService;
        this.rutorrentService = rutorrentService;
        this.localFileSystemService = localFileSystemService;
    }

    async sync() {
        const toCheck = await this.requestsService();
        const results = [];
        const remoteRoot = process.env.REMOTE_ROOT ?? "/home/username/downloads";
        
        for(const r of toCheck.results) {
            if(r.media?.tmdbId) {
                const [movie] = await this.radarrService.getMovieByTmdbid(r.media.tmdbId);
                if(movie) {
                    const [history] = await this.radarrService.getMovieHistory(movie.id);
                    if(history?.data?.torrentInfoHash) {
                        const torrent = await this.rutorrentService(history.data.torrentInfoHash);
                        
                        // Check which files don't exist locally
                        const missingFiles = await this.localFileSystemService(remoteRoot, torrent.downloads);
                        
                        if(missingFiles.length > 0) {
                            results.push({
                                ...torrent,
                                missingFiles
                            });
                        }
                    }
                }
            }
        }
        return results;
    }
}

// Export a convenience function that uses the default implementations
export async function syncRequests() {
    const sync = new SyncRequests();
    return sync.sync();
}