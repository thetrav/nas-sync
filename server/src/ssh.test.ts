import test, { describe } from "node:test";
import assert from "node:assert";
import { parseLines } from "./ssh.ts";

const sample = [
  `-rw-rw-r--   1 user user  6524912121 Mar  5 07:24  Foo.mkv`,
  `drwxrwxr-x   3 user user        4096 Mar 12 05:14  Bar`,
  `-rw-rw-r--   1 user user  7916601947 Mar 12 13:47  Ooo.mkv`,
  `drwxrwxr-x   2 user user        4096 Feb 22 03:37  Odf`,
  `drwxrwxr-x   2 user user        4096 Jan 30 07:22  tiblk`,
  `-rw-rw-r--   1 user user  2214529291 May  7 18:53  asdfasdf.asdf`,
];

describe("parseLines", () => {
  const path = "/media";

  test("parses all sample entries", () => {
    const entries = parseLines(sample, path);
    assert.strictEqual(entries.length, 6);
  });

  test("parses file entries correctly", () => {
    const entries = parseLines(sample, path);
    const foo = entries.find((e) => e.name === "Foo.mkv")!;

    assert.strictEqual(foo.isDirectory, false);
    assert.strictEqual(foo.fullPath, "/media/Foo.mkv");
    assert.strictEqual(foo.size, "6.1 GB");
  });

  test("parses directory entries correctly", () => {
    const entries = parseLines(sample, path);
    const bar = entries.find((e) => e.name === "Bar")!;

    assert.strictEqual(bar.isDirectory, true);
    assert.strictEqual(bar.fullPath, "/media/Bar");
    assert.strictEqual(bar.size, "0 B");
  });

  test("parses modified dates with time (current year)", () => {
    const currentYear = new Date().getFullYear();
    const entries = parseLines(sample, path);
    const foo = entries.find((e) => e.name === "Foo.mkv")!;
    const modified = new Date(foo.modified!);

    assert.strictEqual(modified.getFullYear(), currentYear);
    assert.strictEqual(modified.getMonth(), 2); // March
    assert.strictEqual(modified.getDate(), 5);
  });

  test("skips empty lines", () => {
    const lines = ["", "  ", ...sample, ""];
    const entries = parseLines(lines, path);
    assert.strictEqual(entries.length, 6);
  });

  test("skips lines with too few parts", () => {
    const lines = ["not enough parts", ...sample];
    const entries = parseLines(lines, path);
    assert.strictEqual(entries.length, 6);
  });

  test("parses all file sizes correctly", () => {
    const entries = parseLines(sample, path);
    const sizes = Object.fromEntries(entries.map((e) => [e.name, e.size]));

    assert.strictEqual(sizes["Foo.mkv"], "6.1 GB");
    assert.strictEqual(sizes.Bar, "0 B");
    assert.strictEqual(sizes["Ooo.mkv"], "7.4 GB");
    assert.strictEqual(sizes.Odf, "0 B");
    assert.strictEqual(sizes.tiblk, "0 B");
    assert.strictEqual(sizes["asdfasdf.asdf"], "2.1 GB");
  });
});
