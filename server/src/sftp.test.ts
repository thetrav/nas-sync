import { expect, test, describe } from "node:test";
import { SFTP } from "./sftp";

const sftpOutput = `sftp> cd /pool/public
sftp> ls -la
drwxrwxr-x   9 user user 4096 Jan 16 14:43 .
drwxr-xr-x   3 root root 4096 Oct  7  2024 ..
-rw-r--r--   1 user user 10244 Dec 28 15:56 .DS_Store
-rw-r--r--   1 user user 6140975104 Oct  9  2024 largefile.iso
drwxrwxr-x  91 user user 4096 Jan 16 13:41 TV
drwxrwxr-x   4 user user 4096 Apr  2  2025 books`;

describe("SFTP Module", () => {
  test("createScript should generate correct SFTP commands", () => {
    const script = new SFTP().createScript("/pool/public");
    expect(script).toBe("cd /pool/public\nls -la\nquit");
  });

  test("parseScriptExecution should parse SFTP listing correctly", () => {
    const entries = new SFTP().parseScriptExecution(sftpOutput, "/pool/public");

    expect(entries).toHaveLength(4); // 4 items excluding . and .. (DS_Store, largefile.iso, TV, books)

    // Check directory parsing
    const tvDir = entries.find((e) => e.name === "TV");
    expect(tvDir?.isDirectory).toBe(true);
    expect(tvDir?.fullPath).toBe("/pool/public/TV");
    expect(tvDir?.size).toBe(""); // directories have no size

    // Check file parsing
    const dsStore = entries.find((e) => e.name === ".DS_Store");
    expect(dsStore?.isDirectory).toBe(false);
    expect(dsStore?.size).toBe("10 KB"); // 10244 bytes = 10.0 KB

    // Check large file parsing
    const largeFile = entries.find((e) => e.name === "largefile.iso");
    expect(largeFile?.isDirectory).toBe(false);
    expect(largeFile?.size).toBe("5.7 GB"); // 6140975104 bytes = 5.7 GB

    // Check large file parsing
    const books = entries.find((e) => e.name === "books");
    expect(books?.isDirectory).toBe(true);
    expect(books?.size).toBe(""); // 6140975104 bytes = 5.7 GB
  });

  test("listFolderStructure plumbing", async () => {
    const sftp = new SFTP();
    sftp.executeScript = () => Promise.resolve(sftpOutput);
    const result = await sftp.listFolderContents("testPath");
    expect(result).toEqual([
      {
        fullPath: "testPath/.DS_Store",
        isDirectory: false,
        name: ".DS_Store",
        size: "10 KB",
      },
      {
        fullPath: "testPath/largefile.iso",
        isDirectory: false,
        name: "largefile.iso",
        size: "5.7 GB",
      },
      {
        fullPath: "testPath/TV",
        isDirectory: true,
        name: "TV",
        size: "",
      },
      {
        fullPath: "testPath/books",
        isDirectory: true,
        name: "books",
        size: "",
      },
    ]);
  });
});
