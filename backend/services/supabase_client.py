from __future__ import annotations

from typing import Any, Dict, List, Optional

from config import settings
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
