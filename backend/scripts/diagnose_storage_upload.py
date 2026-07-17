import os
import traceback

from backend.config import settings
from backend.services.supabase_client import (
    get_supabase_storage,
    get_storage_bucket,
    upload_storage_file,
    list_storage_files,
)

print("SUPABASE_URL=", settings.SUPABASE_URL)
print("SUPABASE_KEY=", settings.SUPABASE_KEY[:8] + "...")

try:
    storage = get_supabase_storage()
    print("Got storage client", type(storage))
    bucket = get_storage_bucket("demo-assets")
    print("Bucket info:", bucket)
    result = upload_storage_file(
        "demo-assets",
        "samples/test-upload.wav",
        b"test bytes",
        {"content-type": "audio/wav", "upsert": True},
    )
    print("Upload result:", result)
    files = list_storage_files("demo-assets")
    print("List files len", len(files))
    print(files[:5])
except Exception:
    traceback.print_exc()
