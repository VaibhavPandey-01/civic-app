const https = require('https');
const fs = require('fs');
const zlib = require('zlib');

const url = 'https://storage.googleapis.com/eas-workflows-production/logs/11c2906f-9e10-4802-a1ad-05733c12a807/43700ad5-76c3-429e-8576-81a7f5765377/2026-07-03T18%3A46%3A11Z-de338bbe-61f9-42c2-948f-0e2b17f64359.txt?X-Goog-Algorithm=GOOG4-RSA-SHA256&X-Goog-Credential=www-production%40exponentjs.iam.gserviceaccount.com%2F20260704%2Fauto%2Fstorage%2Fgoog4_request&X-Goog-Date=20260704T045215Z&X-Goog-Expires=900&X-Goog-SignedHeaders=host&X-Goog-Signature=872938c8f9cfa8bec89b7e7d98b0e72a24589285d638e3889e68f94bf8aabcd12ec8f93f56bf1ebd8b1567ecd7072c86cd08d0a0bb0d6e64ff63a294271ad059d6610c6fcebeaac63326d024dbfbfdd50abc160c30043f5e28f4734684e8a4024e06a8aa8bbb435e5b2df93417383519f0e71495562b38f4f280ae0346ee13dbb115d798bf6031d0b60d3d248cf725f068cfb912f3572578a7e7d5f519174bbfc52e850b7a91006e6d257197be0361a2fb0262a1ee41caf7219d435fb170befa3f736a3fefaf2be8e63a1905b07023728e0894d359b380b3c552fcbeefaaf1388b3dca207ca42d8f3ca26680994e0546176b294f8630135298265b0fd411d891';

https.get(url, (res) => {
  let stream = res;
  // GCS might send the gzip file without content-encoding if it's a direct URL
  const chunks = [];
  res.on('data', chunk => chunks.push(chunk));
  res.on('end', () => {
    const buffer = Buffer.concat(chunks);
    let outBuf = buffer;
    try {
      if (buffer[0] === 0x1f && buffer[1] === 0x8b) {
        outBuf = zlib.gunzipSync(buffer);
      }
    } catch (e) {
      console.error(e);
    }
    fs.writeFileSync('clean_log.txt', outBuf.toString('utf8'));
  });
});
