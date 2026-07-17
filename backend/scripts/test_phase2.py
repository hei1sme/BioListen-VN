"""Phase 2 API test script.

Kiểm tra trực tiếp các endpoint của Phase 2:
- POST /api/audio/predict
- GET /api/audio/history
- GET /api/audio/health-trend
"""

import os
import urllib.request

BASE_URL = "http://127.0.0.1:8000"


def build_multipart(file_path: str, field_name: str = "file") -> tuple[str, bytes]:
    boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW"
    crlf = b"\r\n"
    file_name = os.path.basename(file_path)
    file_data = open(file_path, "rb").read()

    body = []
    body.append(b"--" + boundary.encode() + crlf)
    body.append(
        f'Content-Disposition: form-data; name="{field_name}"; filename="{file_name}"'.encode()
        + crlf
    )
    body.append(b"Content-Type: audio/wav" + crlf + crlf)
    body.append(file_data + crlf)
    body.append(b"--" + boundary.encode() + b"--" + crlf)

    return boundary, b"".join(body)


def post_predict(file_path: str) -> str:
    boundary, body = build_multipart(file_path)
    url = f"{BASE_URL}/api/audio/predict"
    req = urllib.request.Request(url, data=body, method="POST")
    req.add_header("Content-Type", f"multipart/form-data; boundary={boundary}")
    req.add_header("Content-Length", str(len(body)))
    with urllib.request.urlopen(req, timeout=60) as resp:
        return resp.read().decode("utf-8")


def get_json(path: str) -> str:
    url = f"{BASE_URL}{path}"
    with urllib.request.urlopen(url, timeout=20) as resp:
        return resp.read().decode("utf-8")


if __name__ == "__main__":
    sample_file = os.path.join(os.path.dirname(__file__), "..", "cua_xich.wav")
    sample_file = os.path.abspath(sample_file)

    print("Phase 2 local API test")
    print("======================")
    print("1) Health check:")
    print(get_json("/health"))

    print("\n2) Root info:")
    print(get_json("/"))

    print("\n3) Predict audio:")
    print(post_predict(sample_file))

    print("\n4) History endpoint:")
    print(get_json("/api/audio/history?limit=5"))

    print("\n5) Health trend endpoint:")
    print(get_json("/api/audio/health-trend?days=7"))
