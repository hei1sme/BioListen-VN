import urllib.request
import urllib.parse
import json
import os
import sys

BASE = 'http://127.0.0.1:8000'

print('health:', urllib.request.urlopen(BASE + '/health', timeout=10).read().decode())
print('root:', urllib.request.urlopen(BASE + '/', timeout=10).read().decode())

file_path = 'backend\\cua_xich.wav'
boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW'
crlf = b'\r\n'
body = []
body.append(b'--' + boundary.encode() + crlf)
body.append(f'Content-Disposition: form-data; name="file"; filename="{os.path.basename(file_path)}"'.encode() + crlf)
body.append(b'Content-Type: audio/wav' + crlf + crlf)
body.append(open(file_path, 'rb').read() + crlf)
body.append(b'--' + boundary.encode() + b'--' + crlf)
data = b''.join(body)

req = urllib.request.Request(BASE + '/api/audio/predict', data=data, method='POST')
req.add_header('Content-Type', f'multipart/form-data; boundary={boundary}')
req.add_header('Content-Length', str(len(data)))
resp = urllib.request.urlopen(req, timeout=60)
pred = json.loads(resp.read().decode())
print('predict ok, keys:', sorted(pred.keys()))
print(' gradcam_base64:', pred.get('gradcam_base64'))
print(' species:', pred['species_detections'][0]['common_name'], pred['species_detections'][0]['confidence'], pred['species_detections'][0]['uncertainty'])
print(' threat:', pred['threat_detections'][0]['threat_type'], pred['threat_detections'][0]['confidence'], pred['threat_detections'][0]['uncertainty'])

req = urllib.request.Request(BASE + '/api/audio/storage/upload?bucket_id=demo-assets', data=data, method='POST')
req.add_header('Content-Type', f'multipart/form-data; boundary={boundary}')
req.add_header('Content-Length', str(len(data)))
resp = urllib.request.urlopen(req, timeout=60)
upload = json.loads(resp.read().decode())
print('upload ok:', upload)

list_raw = json.loads(urllib.request.urlopen(BASE + '/api/audio/storage/list?bucket_id=demo-assets', timeout=20).read().decode())
print('list count:', len(list_raw))
for item in list_raw:
    print(' item:', item['path'], item['public_url'])

if list_raw:
    path = list_raw[0]['path']
    download_url = f"{BASE}/api/audio/storage/download?bucket_id=demo-assets&path={urllib.parse.quote(path)}"
    print('download url:', download_url)
    resp = urllib.request.urlopen(download_url, timeout=20)
    print('download code:', resp.getcode(), 'len:', len(resp.read()))
else:
    print('no files to download')
