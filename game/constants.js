// Reminder intervals (seconds)
const STACK_INTERVAL = 60
const MID_RUNES_INTERVAL = 120
const BOUNTY_RUNES_INTERVAL = 180
const SMOKE_INTERVAL = 420
const WISDOM_RUNES_INTERVAL = 420
const LOTUS_INTERVAL = 180
const LOTUS_INTERVAL_TURBO = 90
const FIRST_TORMENTOR_TIME = 1200

// Neutral item tier spawn times (seconds)
const NEUTRAL_ITEM_TIMES = [420, 1020, 1620, 2200, 3600]

// Roshan respawn window (seconds after death)
const ROSHAN_MIN_RESPAWN = 469
const ROSHAN_MAX_RESPAWN = 659

// Aegis expiry warnings (seconds after pickup)
const AEGIS_WARN_2MIN = 180
const AEGIS_WARN_30S = 271
const AEGIS_WARN_10S = 291
const AEGIS_EXPIRED = 302
const AEGIS_TURBO_OFFSET = 60 // subtracted from all aegis timings in turbo mode

// Tower deny
const TOWER_DENY_HEALTH_THRESHOLD = 0.1 // 10% HP
const TOWER_DENY_COOLDOWN = 15          // seconds between calls

// Wards
const WARDS_COOLDOWN = 30 // seconds between reminders

// Game session detection
const IDLE_TIMEOUT_SECONDS = 45
const GAME_CHECK_INTERVAL_MS = 20000 // how often to poll for game-ended condition

module.exports = {
  STACK_INTERVAL,
  MID_RUNES_INTERVAL,
  BOUNTY_RUNES_INTERVAL,
  SMOKE_INTERVAL,
  WISDOM_RUNES_INTERVAL,
  LOTUS_INTERVAL,
  LOTUS_INTERVAL_TURBO,
  FIRST_TORMENTOR_TIME,
  NEUTRAL_ITEM_TIMES,
  ROSHAN_MIN_RESPAWN,
  ROSHAN_MAX_RESPAWN,
  AEGIS_WARN_2MIN,
  AEGIS_WARN_30S,
  AEGIS_WARN_10S,
  AEGIS_EXPIRED,
  AEGIS_TURBO_OFFSET,
  TOWER_DENY_HEALTH_THRESHOLD,
  TOWER_DENY_COOLDOWN,
  WARDS_COOLDOWN,
  IDLE_TIMEOUT_SECONDS,
  GAME_CHECK_INTERVAL_MS,
}
