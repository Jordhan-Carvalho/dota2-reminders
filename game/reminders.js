const path = require("path")
const sound = require("../helpers/soundPlay.js")
const store = require("../store/store.js")
const state = require("./gameState.js")
const C = require("./constants.js")

const soundPath = (filename) => path.join(__dirname, "../sound", filename)

// --- Interval-based reminders ---
// These fire at a fixed interval, offset by the user-configured delay.

const checkForStack = (gameTime) => {
  const { delay } = store.handleStoreGet(null, "stack")
  if ((gameTime - (C.STACK_INTERVAL - delay)) % C.STACK_INTERVAL === 0) {
    sound.play(soundPath("stack.mp3"), state.volume)
  }
}

const checkForMidRunes = (gameTime) => {
  const { delay } = store.handleStoreGet(null, "midrunes")
  if ((gameTime - (C.MID_RUNES_INTERVAL - delay)) % C.MID_RUNES_INTERVAL === 0) {
    sound.play(soundPath("mid-rune.mp3"), state.volume)
  }
}

const checkForBountyRunes = (gameTime) => {
  const { delay } = store.handleStoreGet(null, "bountyrunes")
  if ((gameTime - (C.BOUNTY_RUNES_INTERVAL - delay)) % C.BOUNTY_RUNES_INTERVAL === 0) {
    sound.play(soundPath("bounty-runes.mp3"), state.volume)
  }
}

const checkForSmoke = (gameTime) => {
  const { delay } = store.handleStoreGet(null, "smoke")
  if ((gameTime - (C.SMOKE_INTERVAL - delay)) % C.SMOKE_INTERVAL === 0) {
    sound.play(soundPath("smoke.mp3"), state.volume)
  }
}

const checkForWisdomRunes = (gameTime) => {
  const { delay } = store.handleStoreGet(null, "wisdomrunes")
  if ((gameTime - (C.WISDOM_RUNES_INTERVAL - delay)) % C.WISDOM_RUNES_INTERVAL === 0) {
    sound.play(soundPath("wisdom-rune.mp3"), state.volume)
  }
}

const checkForLotus = (gameTime, isTurbo) => {
  const interval = isTurbo ? C.LOTUS_INTERVAL_TURBO : C.LOTUS_INTERVAL
  const { delay } = store.handleStoreGet(null, "lotus")
  if ((gameTime - (interval - delay)) % interval === 0) {
    sound.play(soundPath("lotus.mp3"), state.volume)
  }
}

const checkForFirstTormentor = (gameTime) => {
  if (gameTime === C.FIRST_TORMENTOR_TIME) {
    sound.play(soundPath("tormentor.mp3"), state.volume)
  }
}

const checkNeutralItems = (gameTime, isTurbo) => {
  const times = isTurbo
    ? C.NEUTRAL_ITEM_TIMES.map(t => t / 2)
    : C.NEUTRAL_ITEM_TIMES

  times.forEach((spawnTime, tier) => {
    if (gameTime === spawnTime) {
      sound.play(soundPath(`neutralTier${tier + 1}.mp3`), state.volume)
    }
  })
}

// --- Cooldown-based reminders ---
// These fire when a condition is met, throttled by a minimum time between calls.

const checkForWards = (gameTime, wardCd) => {
  if (state.lastCallBuyWards > gameTime) state.lastCallBuyWards = 0

  if (wardCd === 0 && (state.lastCallBuyWards + C.WARDS_COOLDOWN) <= gameTime) {
    sound.play(soundPath("wards.mp3"), state.volume)
    state.lastCallBuyWards = gameTime
  }
}

const checkForDaytime = (isDaytime) => {
  if (isDaytime && !state.daytimeCalled) {
    sound.play(soundPath("daytime.mp3"), state.volume)
    state.daytimeCalled = true
    state.nightCalled = false
  } else if (!isDaytime && !state.nightCalled) {
    sound.play(soundPath("nighttime.mp3"), state.volume)
    state.nightCalled = true
    state.daytimeCalled = false
  }
}

const checkForTowerDeny = (gameTime, buildings) => {
  if (state.lastCallTowerDeny > gameTime) state.lastCallTowerDeny = 0

  const team = buildings.dire ? "dire" : "radiant"

  for (const building in buildings[team]) {
    const isTower = building.includes("tower")
    const isOffCooldown = (state.lastCallTowerDeny + C.TOWER_DENY_COOLDOWN) <= gameTime
    if (!isTower || !isOffCooldown) continue

    const { max_health, health } = buildings[team][building]
    if (health <= max_health * C.TOWER_DENY_HEALTH_THRESHOLD) {
      const lane = building.split("_")[3]
      sound.play(soundPath(`${lane}-tower.mp3`), state.volume)
      state.lastCallTowerDeny = gameTime
    }
  }
}

// --- Timed event reminders ---
// These track a specific moment (Roshan death, Aegis pickup) and warn at fixed offsets.

const checkForRoshanWarnTime = (gameTime, deathTime, isTurbo) => {
  const minRespawn = isTurbo ? C.ROSHAN_MIN_RESPAWN / 2 : C.ROSHAN_MIN_RESPAWN
  const maxRespawn = isTurbo ? C.ROSHAN_MAX_RESPAWN / 2 : C.ROSHAN_MAX_RESPAWN

  if (deathTime + minRespawn === gameTime) {
    sound.play(soundPath("roshanMin.mp3"), state.volume)
  } else if (deathTime + maxRespawn === gameTime) {
    sound.play(soundPath("roshanMax.mp3"), state.volume)
  } else if (deathTime + maxRespawn < gameTime) {
    state.roshanDeadAt = null
  }
}

const checkForAegisWarnTime = (gameTime, pickupTime, isTurbo) => {
  const offset = isTurbo ? C.AEGIS_TURBO_OFFSET : 0
  const warn2min = C.AEGIS_WARN_2MIN - offset
  const warn30s  = C.AEGIS_WARN_30S  - offset
  const warn10s  = C.AEGIS_WARN_10S  - offset
  const expired  = C.AEGIS_EXPIRED   - offset

  if      (pickupTime + warn2min === gameTime) sound.play(soundPath("aegis2min.mp3"), state.volume)
  else if (pickupTime + warn30s  === gameTime) sound.play(soundPath("aegis30s.mp3"), state.volume)
  else if (pickupTime + warn10s  === gameTime) sound.play(soundPath("aegis10s.mp3"), state.volume)
  else if (pickupTime + expired  === gameTime) sound.play(soundPath("aegisExpired.mp3"), state.volume)
  else if (pickupTime + expired  <  gameTime)  state.aegisPickedAt = null
}

module.exports = {
  checkForStack,
  checkForMidRunes,
  checkForBountyRunes,
  checkForSmoke,
  checkForWisdomRunes,
  checkForLotus,
  checkForFirstTormentor,
  checkNeutralItems,
  checkForWards,
  checkForDaytime,
  checkForTowerDeny,
  checkForRoshanWarnTime,
  checkForAegisWarnTime,
}
