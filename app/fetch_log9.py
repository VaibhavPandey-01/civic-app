import urllib.request
import gzip

url = 'https://storage.googleapis.com/eas-workflows-production/logs/11c2906f-9e10-4802-a1ad-05733c12a807/43700ad5-76c3-429e-8576-81a7f5765377/2026-07-03T18%3A46%3A11Z-de338bbe-61f9-42c2-948f-0e2b17f64359.txt?X-Goog-Algorithm=GOOG4-RSA-SHA256&X-Goog-Credential=www-production%40exponentjs.iam.gserviceaccount.com%2F20260704%2Fauto%2Fstorage%2Fgoog4_request&X-Goog-Date=20260704T045320Z&X-Goog-Expires=900&X-Goog-SignedHeaders=host&X-Goog-Signature=b8bcae8e10ec2c15ea130d1ff28cb06138dbb333362a5cb5383e10fbf2f362eb65bb2bb40cef9035d516f0bf3a5578b29a227461f211b08b56c18a2f264270f1f709cb5e7a92b02dc54b3bc59d03c1df51a716b19f2c0daf0080b503753daf55f9fb2584fa3842eead82ac6a46eea7bf15de065d57f6c895d84c30135a0c3a039460a07c57c18eb2be8e764aa9dcf87da933202b182f26bd47c99c7b9021b3b392f013327aa3eab65be4a148db52b36787736a4255e1996df42c9391a05312a08df9796b8b4be8b7e62580911b3ad772d795e578bf6d88d9feaf59be3e6f8c27d6721261739757a363778b8b35d0e50f2d61f2b43b415ca1ddb57650e4cd00a8'
req = urllib.request.Request(url)
response = urllib.request.urlopen(req)
data = response.read()

print("Downloaded bytes:", len(data))
print("First bytes:", data[:4])

try:
    dec = gzip.decompress(data)
    print("Decompressed bytes:", len(dec))
except Exception as e:
    print("Gzip error:", e)

