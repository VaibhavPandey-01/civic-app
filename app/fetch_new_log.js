const fetch = require('node-fetch');
const fs = require('fs');
const { execSync } = require('child_process');

async function main() {
  const jsonStr = execSync('npx eas-cli build:view 0173ea55-ea86-45c9-a429-808142014f1f --json').toString();
  const json = JSON.parse(jsonStr);
  const url = json.logFiles[0];
  
  const res = await fetch(url);
  const buffer = await res.buffer();
  fs.writeFileSync('raw_log_new.bin', buffer);
  
  const content = buffer.toString('utf-8');
  const lines = content.split('\n');
  let printed = 0;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === '') continue;
    try {
      const obj = JSON.parse(lines[i]);
      const msg = obj.msg || obj.message || obj.line || '';
      if (msg.includes('error') || msg.includes('Error') || msg.includes('FAILED') || msg.includes('Exception') || msg.includes('What went wrong')) {
        console.log('[Line ' + i + '] ' + msg);
        printed++;
      }
    } catch (e) {}
  }
  console.log('Found ' + printed + ' lines with error/FAILED');
}
main().catch(console.error);
