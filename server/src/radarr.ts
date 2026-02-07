interface RadarrRating {
  votes: number;
  value: number;
  type: string;
}

interface RadarrRatings {
  imdb: RadarrRating;
  tmdb: RadarrRating;
  trakt: RadarrRating;
}

interface RadarrStatistics {
  movieFileCount: number;
  sizeOnDisk: number;
  releaseGroups: string[];
}

interface RadarrImage {
  coverType: string;
  url: string;
  remoteUrl: string;
}

interface RadarrOriginalLanguage {
  id: number;
  name: string;
}

interface RadarrMovie {
  title: string;
  originalTitle: string;
  originalLanguage: RadarrOriginalLanguage;
  alternateTitles: any[];
  secondaryYearSourceId: number;
  sortTitle: string;
  sizeOnDisk: number;
  status: string;
  overview: string;
  digitalRelease: string;
  releaseDate: string;
  images: RadarrImage[];
  website: string;
  year: number;
  youTubeTrailerId: string;
  studio: string;
  path: string;
  qualityProfileId: number;
  hasFile: boolean;
  movieFileId: number;
  monitored: boolean;
  minimumAvailability: string;
  isAvailable: boolean;
  folderName: string;
  runtime: number;
  cleanTitle: string;
  imdbId: string;
  tmdbId: number;
  titleSlug: string;
  rootFolderPath: string;
  genres: string[];
  keywords: string[];
  tags: any[];
  added: string;
  ratings: RadarrRatings;
  popularity: number;
  lastSearchTime: string;
  statistics: RadarrStatistics;
  id: number;
}

interface RadarrQuality {
  id: number;
  name: string;
  source: string;
  resolution: number;
  modifier: string;
}

interface RadarrRevision {
  version: number;
  real: number;
  isRepack: boolean;
}

interface RadarrQualityDetails {
  quality: RadarrQuality;
  revision: RadarrRevision;
}

interface RadarrHistoryRecord {
  movieId: number;
  sourceTitle: string;
  languages: RadarrOriginalLanguage[];
  quality: RadarrQualityDetails;
  customFormats: any[];
  customFormatScore: number;
  qualityCutoffNotMet: boolean;
  date: string;
  downloadId: string;
  eventType: string;
  data: {
    indexer: string;
    nzbInfoUrl: string;
    releaseGroup: string | null;
    age: string;
    ageHours: string;
    ageMinutes: string;
    publishedDate: string;
    downloadClient: string;
    downloadClientName: string;
    size: string;
    downloadUrl: string;
    guid: string;
    tmdbId: string;
    imdbId: string;
    protocol: string;
    customFormatScore: string;
    movieMatchType: string;
    releaseSource: string;
    indexerFlags: string;
    indexerId: string;
    torrentInfoHash: string;
  };
  id: number;
}

const radarrUrl = process.env.RADARR_URL!;
const radarrKey = process.env.RADARR_KEY!;

async function radarrGet<T>(endpoint: string): Promise<T> {
    const url = `${radarrUrl}${endpoint}`;

    const response = await fetch(url, {
        method: "GET",
        headers: {
            "X-Api-Key": radarrKey,
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        const responseText = await response.text();
        throw new Error(`Failed to fetch requests: ${response.status}${responseText ? `: ${responseText}` : ''}`);
    }

    return await response.json();
}

export async function getMovieByTmdbid(tmdbId: number): Promise<RadarrMovie[]> {
    return radarrGet<RadarrMovie[]>(`/movie?tmdbid=${tmdbId}`);
}

export async function getMovieHistory(id: number): Promise<RadarrHistoryRecord[]> {
    const result = await radarrGet<RadarrHistoryRecord[]>(`/history/movie?movieId=${id}`);
    return result;
}