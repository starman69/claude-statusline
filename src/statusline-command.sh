#!/usr/bin/env bash
# Read all of stdin into a variable
input=$(cat)

# Extract fields with jq, "// 0" provides fallback for null
MODEL=$(echo "$input" | jq -r '.model.display_name')
PCT=$(echo "$input" | jq -r '.context_window.used_percentage // 0' | cut -d. -f1)

# Rate limits (Pro/Max only, present after first API response)
FIVE_PCT=$(echo "$input" | jq -r '.rate_limits.five_hour.used_percentage // empty' | cut -d. -f1)
FIVE_RESET=$(echo "$input" | jq -r '.rate_limits.five_hour.resets_at // empty')
WEEK_PCT=$(echo "$input" | jq -r '.rate_limits.seven_day.used_percentage // empty' | cut -d. -f1)

# Build context progress bar: printf -v creates a run of spaces, then
# ${var// /▓} replaces each space with a block character
BAR_WIDTH=10
FILLED=$((PCT * BAR_WIDTH / 100))
EMPTY=$((BAR_WIDTH - FILLED))
BAR=""
[ "$FILLED" -gt 0 ] && printf -v FILL "%${FILLED}s" && BAR="${FILL// /▓}"
[ "$EMPTY" -gt 0 ] && printf -v PAD "%${EMPTY}s" && BAR="${BAR}${PAD// /░}"

OUT="[$MODEL] $BAR $PCT%"
if [ -n "$FIVE_PCT" ]; then
  RESET_FMT=""
  [ -n "$FIVE_RESET" ] && RESET_FMT=" ↻$(date -d "@$FIVE_RESET" +%H:%M 2>/dev/null)"
  OUT="$OUT | 5h ${FIVE_PCT}%${RESET_FMT}"
fi
[ -n "$WEEK_PCT" ] && OUT="$OUT | 7d ${WEEK_PCT}%"

echo "$OUT"
