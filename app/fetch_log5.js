const { execSync } = require('child_process');
const https = require('https');
const zlib = require('zlib');
const fs = require('fs');

try {
  const output = execSync('npx eas-cli build:view 43700ad5-76c3-429e-8576-81a7f5765377 --json', { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] });
  const match = output.match(/\{[\s\S]*\}/);
  if (match) {
    const data = JSON.parse(match[0]);
    const url = data.logFiles[0];
    console.log("URL:", url);

    https.get(url, (res) => {
      let chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        const buffer = Buffer.concat(chunks);
        let out = buffer;
        if (buffer[0] === 0x1f && buffer[1] === 0x8b) out = zlib.gunzipSync(buffer);
        fs.writeFileSync('clean_log2.txt', out.toString('utf8'));
        console.log("Written log of length", out.length);
      });
    });
  } else {
    console.error("No JSON found in stdout");
  }
} catch (e) {
  console.error("Command failed", e);
}
