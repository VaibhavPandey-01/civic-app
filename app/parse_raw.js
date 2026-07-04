const fs = require('fs');

try {
  const content = fs.readFileSync('raw_log.bin', 'utf-8');
  console.log("File is text. Length:", content.length);
  const lines = content.split('\n');
  console.log("Number of lines:", lines.length);
  // It might be JSONL (JSON Lines) or a single JSON array
  if (lines.length > 1) {
    const lastLines = lines.slice(-20).filter(l => l.trim() !== '');
    lastLines.forEach(l => {
      try {
        const obj = JSON.parse(l);
        console.log(obj.msg || obj.message || obj.line || l);
      } catch (e) {
        console.log("Raw:", l.substring(0, 500));
      }
    });
  } else {
    const data = JSON.parse(content);
    console.log("Parsed JSON array of length", data.length);
    const last = data.slice(-20);
    last.forEach(item => {
      console.log(item.msg || item.message || item.line || JSON.stringify(item));
    });
  }
} catch (e) {
  console.error(e);
}
