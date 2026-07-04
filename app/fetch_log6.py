import urllib.request
import gzip
import sys

url = 'https://storage.googleapis.com/eas-workflows-production/logs/11c2906f-9e10-4802-a1ad-05733c12a807/43700ad5-76c3-429e-8576-81a7f5765377/2026-07-03T18%3A46%3A11Z-de338bbe-61f9-42c2-948f-0e2b17f64359.txt?X-Goog-Algorithm=GOOG4-RSA-SHA256&X-Goog-Credential=www-production%40exponentjs.iam.gserviceaccount.com%2F20260704%2Fauto%2Fstorage%2Fgoog4_request&X-Goog-Date=20260704T044718Z&X-Goog-Expires=900&X-Goog-SignedHeaders=host&X-Goog-Signature=107bcc2acba412f28f7b97b135ca45b846cfa09e479a2febb94c0a9c26468fabb020c0ce8205fb31df31064d2fd5b2df8906a6822d7ca150169804db966a35d598acef5603b61485ecc063c478ad38b35b5f3b17d0b913d61b4a7d38326bd68c5a555268298d1d2aba6498c7ec2a4867eca8384688c95d08a43d1f90171f986a2ee9a6faafbe6211f09fa6cc47a364b40aca52f15ac35fa250aeae3063db8ff65c78085192b2b1c9424d17899e0a36827978d0e58d06647537edb29ee6777459c6b376b426f517b64fc81f84cffc821c35e1d3cf838234f577649cb319fa6010b96e18497615bde91511ab1a146cf26505d4a0478e17790a1fe928298c721ff4'
req = urllib.request.Request(url)
response = urllib.request.urlopen(req)
data = response.read()

try:
    data = gzip.decompress(data)
except Exception as e:
    pass

text = data.decode('utf-8', errors='replace')
lines = text.split('\n')
for line in lines[-200:]:
    print(line)
