from __future__ import annotations

from typing import Any, Dict, List, Optional, Union

from config import settings
from storage3.exceptions import StorageApiError
from supabase import Client, create_client

_supabase_client: Optional[Client] = None


def is_supabase_configured() -> bool:
    return bool(settings.SUPABASE_URL and settings.SUPABASE_KEY)


def get_supabase_client() -> Client:
    global _supabase_client
    if _supabase_client is None:
        if not is_supabase_configured():
            raise RuntimeError("Supabase is not configured. Set SUPABASE_URL and SUPABASE_KEY in .env.")
        _supabase_client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
    return _supabase_client


def insert_detection_record(record: Dict[str, Any]) -> List[Dict[str, Any]]:
    client = get_supabase_client()
    response = client.table("detections").insert(record).execute()
    return response.data or []


def get_supabase_storage():
    """Return the Supabase storage client."""
    return get_supabase_client().storage


def get_storage_bucket(bucket_id: str) -> dict[str, Any]:
    storage = get_supabase_storage()
    try:
        return storage.get_bucket(bucket_id)
    except StorageApiError as exc:
        if getattr(exc, "statusCode", None) == 404 or "Bucket not found" in str(exc):
            raise RuntimeError(
                f"Supabase storage bucket '{bucket_id}' does not exist. Create it manually in your Supabase project, or use an existing bucket name."
            ) from exc
        raise RuntimeError(
            f"Supabase storage bucket access failed for '{bucket_id}': {exc}"
        ) from exc


def list_storage_buckets() -> List[Dict[str, Any]]:
    storage = get_supabase_storage()
    try:
        return storage.list_buckets() or []
    except StorageApiError as exc:
        raise RuntimeError(f"Unable to list Supabase storage buckets: {exc}") from exc


def upload_storage_file(
    bucket_id: str,
    storage_path: str,
    source: Union[str, bytes],
    file_options: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """Upload a local file or bytes object to Supabase Storage."""
    storage = get_supabase_storage()
    bucket_proxy = storage.from_(bucket_id)
    upload_result = bucket_proxy.upload(storage_path, source, file_options or {})
    return upload_result.model_dump() if hasattr(upload_result, "model_dump") else upload_result


def list_storage_files(bucket_id: str, path: Optional[str] = None) -> List[Dict[str, Any]]:
    storage = get_supabase_storage()
    bucket_proxy = storage.from_(bucket_id)
    response = bucket_proxy.list(path=path or "")
    return response or []


def get_storage_public_url(bucket_id: str, path: str) -> str:
    storage = get_supabase_storage()
    bucket_proxy = storage.from_(bucket_id)
    return bucket_proxy.get_public_url(path)


def fetch_detection_history(limit: int = 50, sensor_id: Optional[str] = None) -> List[Dict[str, Any]]:
    client = get_supabase_client()
    query = client.table("detections").select("*")
    if sensor_id:
        query = query.eq("sensor_id", sensor_id)
    query = query.order("timestamp", desc=True).limit(limit)
    response = query.execute()
    return response.data or []


def fetch_health_trend(days: int = 7) -> List[Dict[str, Any]]:
    client = get_supabase_client()
    response = (
        client.table("detections")
        .select("timestamp, shannon_index, species")
        .order("timestamp", desc=True)
        .limit(days)
        .execute()
    )

    points = []
    for row in response.data or []:
        species_richness = len(row.get("species") or [])
        points.append(
            {
                "timestamp": row.get("timestamp") or "",
                "shannon_index": float(row.get("shannon_index") or 0.0),
                "species_richness": species_richness,
            }
        )
    return list(reversed(points))
