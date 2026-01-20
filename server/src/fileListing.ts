export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return [parseFloat((bytes / Math.pow(k, i)).toFixed(1)), sizes[i]].join(" ");
}

interface ParsedLsLine {
  permissions: string;
  owner: string;
  group: string;
  size: number;
  name: string;
}

export function parseLsLine(line: string): ParsedLsLine | null {
  const regex =
    /^([-d][rwx-]{9})\s+\d+\s+(\S+)\s+(\S+)\s+(\d+)\s+\w+\s+\d+\s+[\d:]+\s+(.+)$/;

  const match = regex.exec(line);
  if (!match) return null;

  const [, permissions, owner, group, size, name] = match;

  return {
    permissions,
    owner,
    group,
    size: Number(size),
    name,
  };
}
