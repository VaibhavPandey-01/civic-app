const fs = require('fs');
const content = fs.readFileSync('raw_log.bin', 'utf-8');
const lines = content.split('\n');
let printed = 0;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].trim() === '') continue;
  try {
    const obj = JSON.parse(lines[i]);
    const msg = obj.msg || obj.message || obj.line || '';
    if (msg.includes('error') || msg.includes('Error') || msg.includes('FAILED') || msg.includes('expo-firebase-core')) {
      console.log('[Line ' + i + '] ' + msg);
      printed++;
    }
  } catch (e) {}
}
console.log('Found ' + printed + ' lines');
