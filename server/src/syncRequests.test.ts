/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/require-await */
import { test, describe, beforeEach } from "node:test";
import assert from "node:assert";
import { SyncRequests, type RequestsService, type RadarrService, type RutorrentService, type LocalFileSystemService } from "./syncRequests.ts";

describe("SyncRequests", () => {
  const mockRequests: RequestsService = async () => ({
    pageInfo: { page: 1, pages: 1, results: 1 },
    results: [
      {
        id: 1,
        status: 1,
        media: { tmdbId: 123 },
        createdAt: "2023-01-01",
        updatedAt: "2023-01-01",
        requestedBy: { id: 1, email: "test@test.com", username: "test" },
        modifiedBy: { id: 1, email: "test@test.com", username: "test" },
        is4k: false,
        serverId: 1,
        profileId: 1,
        rootFolder: "/test",
      },
    ],
  });

  const mockRadarrService: RadarrService = {
    getMovieByTmdbid: async () => [{ id: 456 }],
    getMovieHistory: async () => [
      {
        data: { torrentInfoHash: "abc123" },
      },
    ],
  };

  const mockRutorrentService: RutorrentService = async () => ({
    basePath: "/home/username/downloads/movie",
    downloads: [
      "/home/username/downloads/movie/file1.mkv",
      "/home/username/downloads/movie/file2.mkv",
    ],
  });

  const mockLocalFileSystemService: LocalFileSystemService = async (remoteRoot: string, filePaths: string[]) =>
    filePaths.filter((path) => path.includes("file1"));

  beforeEach(() => {
    process.env.REMOTE_ROOT = "/home/username/downloads";
  });

  test("returns torrents with missing files only", async () => {
    const sync = new SyncRequests(
      mockRequests,
      mockRadarrService,
      mockRutorrentService,
      mockLocalFileSystemService
    );

    const result = await sync.sync();

    assert.equal(result.length, 1);
    assert.equal(result[0].basePath, "/home/username/downloads/movie");
    assert.deepStrictEqual(result[0].downloads, [
      "/home/username/downloads/movie/file1.mkv",
      "/home/username/downloads/movie/file2.mkv",
    ]);
    assert.deepStrictEqual(result[0].missingFiles, [
      "/home/username/downloads/movie/file1.mkv",
    ]);
  });

  test("returns empty array when all files exist locally", async () => {
    const allFilesExistService: LocalFileSystemService = async () => [];
    const sync = new SyncRequests(
      mockRequests,
      mockRadarrService,
      mockRutorrentService,
      allFilesExistService
    );

    const result = await sync.sync();

    assert.deepStrictEqual(result, []);
  });

  test("handles missing torrent info hash", async () => {
    const noTorrentHashService: RadarrService = {
      getMovieByTmdbid: async () => [{ id: 456 }],
      getMovieHistory: async () => [{}],
    };
    const sync = new SyncRequests(
      mockRequests,
      noTorrentHashService,
      mockRutorrentService,
      mockLocalFileSystemService
    );

    const result = await sync.sync();

    assert.deepStrictEqual(result, []);
  });

  test("handles missing tmdbId", async () => {
    const noTmdbIdRequests: RequestsService = async () => ({
      pageInfo: { page: 1, pages: 1, results: 1 },
      results: [
        {
          id: 1,
          status: 1,
          media: { tmdbId: 0 }, // tmdbId = 0 (falsy)
          createdAt: "2023-01-01",
          updatedAt: "2023-01-01",
          requestedBy: { id: 1, email: "test@test.com", username: "test" },
          modifiedBy: { id: 1, email: "test@test.com", username: "test" },
          is4k: false,
          serverId: 1,
          profileId: 1,
          rootFolder: "/test",
        },
      ],
    });
    const sync = new SyncRequests(
      noTmdbIdRequests,
      mockRadarrService,
      mockRutorrentService,
      mockLocalFileSystemService
    );

    const result = await sync.sync();

    assert.deepStrictEqual(result, []);
  });
});