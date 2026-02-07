interface OverseerUser {
  id: number;
  email: string;
  username: string;
  plexToken: string;
  plexUsername: string;
  userType: number;
  permissions: number;
  avatar: string;
  createdAt: string;
  updatedAt: string;
  requestCount: number;
}

interface OverseerMedia {
  id: number;
  tmdbId: number;
  tvdbId: number;
  status: number;
  requests: string[];
  createdAt: string;
  updatedAt: string;
}

interface OverseerRequest {
  id: number;
  status: number;
  media: OverseerMedia;
  createdAt: string;
  updatedAt: string;
  requestedBy: OverseerUser;
  modifiedBy: OverseerUser;
  is4k: boolean;
  serverId: number;
  profileId: number;
  rootFolder: string;
}

interface OverseerPageInfo {
  page: number;
  pages: number;
  results: number;
}

interface OverseerResponse {
  pageInfo: OverseerPageInfo;
  results: OverseerRequest[];
}

export async function requests(): Promise<OverseerResponse> {
    const overseerUrl = process.env.OVERSEER_URL;
    const overseerKey = process.env.OVERSEER_KEY;
    const overseerUser = process.env.OVERSEER_USER;

    if (!overseerUrl) {
        throw new Error("OVERSEER_URL environment variable is not set");
    }
    if (!overseerKey) {
        throw new Error("OVERSEER_KEY environment variable is not set");
    }

    const url = new URL(`${overseerUrl}/request`);
    if (overseerUser) {
        url.searchParams.append('requestedBy', overseerUser);
    }

    const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
            "X-Api-Key": overseerKey,
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        const responseText = await response.text();
        throw new Error(`Failed to fetch requests: ${response.status}${responseText ? `: ${responseText}` : ''}`);
    }

    return await response.json();
}

