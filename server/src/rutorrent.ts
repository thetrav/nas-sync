import { XMLParser } from "fast-xml-parser";

const url = process.env.RUTORRENT_RPC_URL!;
const rutorrentUser = process.env.RUTORRENT_USER_NAME!;
const rutorrentPassword = process.env.RUTORRENT_PASSWORD!;

const parser = new XMLParser();


function log(o:any) {
    // console.log(JSON.stringify(o, null, 2));
}

type FileData = {array:{data:{value:{string: string}}}};

type MultiFileResponse = {
    "?xml":string,
    methodResponse:{params:{param:{value:{array:{data:{value:FileData[] | FileData}}}}}}
};
type SingleStringResponse = {
    "?xml":string,
    methodResponse:{params:{param:{value:{string: string}}}}
};


async function rpcCall<T>(methodName:string, params: string[]): Promise<T> {
    const xml = `<?xml version="1.0"?>
<methodCall>
  <methodName>${methodName}</methodName>
  <params>
${params.map(p => `    <param><value><string>${p}</string></value></param>`).join("\n")}
  </params>
</methodCall>`
// console.log(`sending`, xml)
    const auth = Buffer.from(`${rutorrentUser}:${rutorrentPassword}`).toString('base64');
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "text/xml",
      "X-Requested-With": "XMLHttpRequest",
      "Authorization": `Basic ${auth}`,
    },
    credentials: "include",
    body: xml,
  });
  const text = await res.text();
 
  const obj =  parser.parse(text) as T;
  log(obj);
  return obj;
}

async function  getSingleString(cmd: string, hash: string): Promise<string> {
    const result = await rpcCall<SingleStringResponse>(cmd, [hash]);
    return result.methodResponse.params.param.value.string;
}

async function getFilePaths(infoHash: string): Promise<string[]> {
  const result = await rpcCall<MultiFileResponse>('f.multicall', [infoHash, '', 'f.path='])
  const maybeArray = result.methodResponse.params.param.value.array.data.value;
  if(Array.isArray(maybeArray)) {
    return maybeArray.map(v => v.array.data.value.string)
  } else {
    return [maybeArray.array.data.value.string];
  }
}


export async function getTorrentInfo(torrentInfoHash: string) {
    const basePath = await getSingleString('d.directory', torrentInfoHash);
    const downloads = await getFilePaths(torrentInfoHash);
    return {
        basePath,
        downloads
    }
}