import urllib.request
import gzip
import sys

url = ''
req = urllib.request.Request(url)
response = urllib.request.urlopen(req)
data = response.read()

print("Downloaded", len(data), "bytes")
print("Starts with", data[:2])

try:
    data = gzip.decompress(data)
    print("Decompressed to", len(data), "bytes")
except Exception as e:
    print("Gzip decompress failed:", repr(e))

