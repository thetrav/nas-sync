const serverUrl = process.env.SERVER_URL ?? "";
const apiKey = process.env.API_KEY ?? "";

export async function listSonarr() {
  const result = await Bun.fetch(`${serverUrl}/api/v3/series`, {
    headers: { "X-Api-Key": apiKey },
  });
  return new Response(result.body, {
    headers: { "Content-Type": "application/json" },
  });
}
