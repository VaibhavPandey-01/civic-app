const fetch = require('node-fetch');
const fs = require('fs');
const { execSync } = require('child_process');

async function main() {
  const jsonStr = execSync('npx eas-cli build:view 43700ad5-76c3-429e-8576-81a7f5765377 --json').toString();
  const json = JSON.parse(jsonStr);
  const url = json.logFiles[0];
  
  const res = await fetch(url);
  console.log("Headers:");
  console.log(res.headers.raw());
  
  const buffer = await res.buffer();
  console.log("Buffer size:", buffer.length);
  console.log("First bytes:", buffer.slice(0, 10));
}
main().catch(console.error);
