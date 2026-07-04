import urllib.request
import gzip
import sys

url = 'https://storage.googleapis.com/eas-workflows-production/logs/11c2906f-9e10-4802-a1ad-05733c12a807/43700ad5-76c3-429e-8576-81a7f5765377/2026-07-03T18%3A46%3A11Z-de338bbe-61f9-42c2-948f-0e2b17f64359.txt?X-Goog-Algorithm=GOOG4-RSA-SHA256&X-Goog-Credential=www-production%40exponentjs.iam.gserviceaccount.com%2F20260704%2Fauto%2Fstorage%2Fgoog4_request&X-Goog-Date=20260704T045038Z&X-Goog-Expires=900&X-Goog-SignedHeaders=host&X-Goog-Signature=a905ba36c71ce06f75d8fa0e309d5637cd17b344b5506d72eafa3905f0eb1bcbe79e70f120ce6c26d70761563713f79897cd909b6586eded5a65876515431091cdf65e827c6c55b9827e3a7b5da3de8c7fb1a60e0004154eb745a73545826a99d0fd7de8196b76dfcfd73ecbc14dd8290532e69f6402c7c5d700679435c401588561312cc22ced27b388cf02a6a6e2ecab905b080cd08a4dbf64efa826884370e1878f06bc367f545ee6ce789dd2d979ce0b21d97eef390076dcfcf8776a75f9fc2d0aaa4d9008df00ea4a42fd8684f3d7492c5645383e3a1b752501ef77bc407c60eff4e2699513dfa8b7da257283167e6eecb401162f435d84fc829ad4e895'
req = urllib.request.Request(url, headers={'Accept-Encoding': 'gzip'})
response = urllib.request.urlopen(req)
data = response.read()

if response.info().get('Content-Encoding') == 'gzip':
    data = gzip.decompress(data)

text = data.decode('utf-8')
lines = text.split('\n')
for line in lines[-200:]:
    print(line)
