from __future__ import annotations

import sys
from config import settings
from services.supabase_client import (
    is_supabase_configured,
    get_supabase_client,
    fetch_detection_history,
    fetch_health_trend,
)


def print_header(title: str) -> None:
    print("\n" + "#" * 60)
    print(f"# {title}")
    print("#" * 60 + "\n")


def main() -> int:
    print_header("Phase 1 Supabase Live Check")
    print(f"SUPABASE_URL configured: {'YES' if bool(settings.SUPABASE_URL) else 'NO'}")
    print(f"SUPABASE_KEY configured: {'YES' if bool(settings.SUPABASE_KEY) else 'NO'}")

    if not is_supabase_configured():
        print("\nERROR: Supabase is not configured. Create a .env file in backend/ with SUPABASE_URL and SUPABASE_KEY.")
        return 1

    try:
        client = get_supabase_client()
        response = client.table("detections").select("*").limit(1).execute()
        print("\nSupabase connection OK.")
        print(f"Detected {len(response.data or [])} records in detections (sample fetch).")
    except Exception as exc:
        print(f"\nSupabase connection FAILED: {exc}")
        return 2

    try:
        history = fetch_detection_history(limit=3)
        print(f"History fetch OK. Retrieved {len(history)} record(s).")
    except Exception as exc:
        print(f"History fetch FAILED: {exc}")
        return 3

    try:
        trend = fetch_health_trend(days=3)
        print(f"Health trend fetch OK. Retrieved {len(trend)} point(s).")
    except Exception as exc:
        print(f"Health trend fetch FAILED: {exc}")
        return 4

    print("\nPhase 1 live Supabase check completed successfully.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
