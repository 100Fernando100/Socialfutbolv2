#!/bin/bash
# SocialFootball.ai - Sync Script
# Reemplazá TU_ANON_KEY con tu key real (la que empieza con eyJ...)

ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpc29pdm52eWxqa3lsbWplc3llIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4MTcyMTksImV4cCI6MjA4NDM5MzIxOX0.fnDOWcPuguhBBebjQq97D9C5_WrBiJjMXzAvRIA-0No"
BASE_URL="https://bisoivnvyljkylmjesye.supabase.co/functions/v1"

echo "=== Sync Teams ==="
curl -X POST "$BASE_URL/sync-teams" -H "Authorization: Bearer $" -H "Content-Type: application/json"

echo ""
echo ""
echo "=== Sync Fixtures (today) ==="
curl -X POST "$BASE_URL/sync-fixtures" -H "Authorization: Bearer $ANON_KEY" -H "Content-Type: application/json"

echo ""
echo ""
echo "=== Sync Fixtures (upcoming) ==="
curl -X POST "$BASE_URL/sync-fixtures" -H "Authorization: Bearer $ANON_KEY" -H "Content-Type: application/json" -d '{"mode":"upcoming"}'

echo ""
echo "=== Done ==="
