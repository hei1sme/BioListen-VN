-- Supabase schema for BioListen VN
-- Run in Supabase SQL Editor after creating the project.

-- Table: sensors
CREATE TABLE IF NOT EXISTS sensors (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  park_name TEXT,
  status TEXT DEFAULT 'active'
);

INSERT INTO sensors (id, name, lat, lng, park_name, status)
VALUES
  ('demo-sensor-1', 'Trạm A - Suối Lớn', 20.2373, 105.6157, 'Cúc Phương', 'active'),
  ('demo-sensor-2', 'Trạm B - Đỉnh Mây', 20.2410, 105.6200, 'Cúc Phương', 'active'),
  ('demo-sensor-3', 'Trạm C - Rừng Già', 20.2350, 105.6100, 'Cúc Phương', 'active')
ON CONFLICT (id) DO NOTHING;

-- Table: detections
CREATE TABLE IF NOT EXISTS detections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sensor_id TEXT NOT NULL REFERENCES sensors(id),
  timestamp TIMESTAMPTZ DEFAULT now(),
  audio_url TEXT,
  species JSONB NOT NULL DEFAULT '[]',
  threats JSONB NOT NULL DEFAULT '[]',
  shannon_index DOUBLE PRECISION,
  is_alert BOOLEAN DEFAULT false,
  llm_report TEXT,
  processing_time_ms INT
);

-- Example insert to verify the schema
INSERT INTO detections (sensor_id, audio_url, species, threats, shannon_index, is_alert, llm_report, processing_time_ms)
VALUES (
  'demo-sensor-1',
  'https://example.com/sample.wav',
  '[{"species_id":"pycnonotus_jocosus","common_name":"Chào mào","confidence":0.94,"uncertainty":0.02,"time_window":{"start_sec":1.0,"end_sec":3.5},"is_confident":true}]',
  '[{"threat_type":"chainsaw","confidence":0.91,"uncertainty":0.03,"is_alert":true}]',
  0.54,
  true,
  '🚨 CẢNH BÁO ĐỎ: Ghi nhận chainsaw detected... Đề nghị kiểm lâm tiếp cận.',
  420
)
ON CONFLICT DO NOTHING;
