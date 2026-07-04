const fs = require('fs');
const content = fs.readFileSync('raw_log_new.bin', 'utf-8');
const lines = content.split('\n');
for (let i = 1430; i < 1450; i++) {
  try {
    const obj = JSON.parse(lines[i]);
    console.log(obj.msg || obj.message || obj.line || '');
  } catch (e) {}
}
