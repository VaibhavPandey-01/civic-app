const fetch = require('node-fetch');
const fs = require('fs');
const { execSync } = require('child_process');

async function main() {
  const jsonStr = execSync('npx eas-cli build:view 43700ad5-76c3-429e-8576-81a7f5765377 --json').toString();
  const json = JSON.parse(jsonStr);
  const url = json.logFiles[0];
  
  const res = await fetch(url);
  const buffer = await res.buffer();
  
  fs.writeFileSync('raw_log.bin', buffer);
  
  console.log("Buffer size:", buffer.length);
  console.log("First bytes:", buffer.slice(0, 4));
}
main().catch(console.error);
