const axios = require("axios");
const fs = require("fs");

const JSON_URL = "https://netx.streamstar18.workers.dev/hot1";
const OUTPUT_FILE = "stream.m3u";

async function run() {
  const { data } = await axios.get(JSON_URL);

  let out = "#EXTM3U\n";
  const used = new Set();

  for (const item of data.slice(1)) {   // skips 1st entry only
    const url = item.m3u8_url || item.mpd_url;
    if (!url) continue;

    const uid = item.id + "_" + item.name;
    if (used.has(uid)) continue;
    used.add(uid);

    const name = item.name || "Unknown";
    const logo = item.logo || "";
    const group = "🎬 OTT | JIO CINEMA";

    out += `#EXTINF:-1 tvg-id="${uid}" tvg-logo="${logo}" group-title="${group}",${name}\n`;

    if (item.type === "dash") {
      out += `#KODIPROP:inputstream.adaptive.manifest_type=mpd\n`;

      if (item.license_url) {
        const match = item.license_url.match(/keyid=([^&]+).*key=([^&]+)/i);
        if (match) {
          out += `#KODIPROP:inputstream.adaptive.license_type=clearkey\n`;
          out += `#KODIPROP:inputstream.adaptive.license_key=${match[1]}:${match[2]}\n`;
        }
      }
    }

    out += `${url}\n`;
  }

  fs.writeFileSync(OUTPUT_FILE, out);
  console.log("done");
}

run();
