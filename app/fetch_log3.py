import urllib.request
import gzip

url = 'https://storage.googleapis.com/eas-workflows-production/logs/11c2906f-9e10-4802-a1ad-05733c12a807/43700ad5-76c3-429e-8576-81a7f5765377/2026-07-03T18%3A46%3A11Z-de338bbe-61f9-42c2-948f-0e2b17f64359.txt?X-Goog-Algorithm=GOOG4-RSA-SHA256&X-Goog-Credential=www-production%40exponentjs.iam.gserviceaccount.com%2F20260704%2Fauto%2Fstorage%2Fgoog4_request&X-Goog-Date=20260704T044824Z&X-Goog-Expires=900&X-Goog-SignedHeaders=host&X-Goog-Signature=6ca6500f136c46facb01c9cb0dd9d6e8542ceb09bedbb2b9dcf3627462d102b0f3e976515bf62c5fe8b78af1547f01d5a8779091d385ec09ab13f0f7dcec44572e203c9d3d6ef8ce3c3783143bfb62df85f9c1a7b3623979b2c7ae5095d4cdbb8a10ec7e6f022cd356ecb72438f6ccc26a1c83984afb4aaa0ce4e8a845ae12ae86ed4dc23a1191680ee546223e8f8a6f23f0e9f9b8797a0c86f337b884043e2cd7e867ca3608779fd7d53274b13a9babd675efe33bbc8858a512bd59f5bdbb6feea89944a4534481b9cf1153195e2926a425a98e93a8febda8c62108e389dd61c032439c16a296c5d5e9a3042de8535ba5f182aa43df5ff9b426e90b43cf0aed'
req = urllib.request.Request(url, headers={'Accept-Encoding': 'gzip'})
response = urllib.request.urlopen(req)
data = response.read()

if data.startswith(b'\x1f\x8b'):
    data = gzip.decompress(data)

text = data.decode('utf-8', errors='replace')
with open('extracted_log.txt', 'w', encoding='utf-8') as f:
    f.write(text)
