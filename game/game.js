const path = require("path")
const sound = require("../helpers/soundPlay.js")
const store = require("../store/store.js")
const state = require("./gameState.js")
const reminders = require("./reminders.js")
const { IDLE_TIMEOUT_SECONDS, GAME_CHECK_INTERVAL_MS } = require("./constants.js")

// --- Game session tracking ---

const isGameRunning = () => state.isRunning

const checkForGameRunning = () => {
  // Start a polling interval the first time an event is received.
  // The interval clears itself once the game goes idle.
  if (!state.lastEventReceivedAt) {
    const intervalId = setInterval(() => {
      const timeNow = Math.floor(Date.now() / 1000)

      if ((state.lastEventReceivedAt + IDLE_TIMEOUT_SECONDS) < timeNow) {
        state.isRunning = false
        state.lastEventReceivedAt = null
        state.pastEvents = []
        state.roshanDeadAt = null
        state.aegisPickedAt = null
        clearInterval(intervalId)
      }
    }, GAME_CHECK_INTERVAL_MS)
  }

  state.lastEventReceivedAt = Math.floor(Date.now() / 1000)
  state.isRunning = true
}

const playTestSound = () => {
  const filePath = path.join(__dirname, "../sound/test-sound.mp3")
  sound.play(filePath, state.volume)
}

// --- Main event handler ---

const onNewGameEvent = async (gameEvent) => {
  if (!gameEvent.map || gameEvent.map.game_state !== "DOTA_GAMERULES_STATE_GAME_IN_PROGRESS") return

  const gameTime       = gameEvent.map.clock_time
  const wardsPurchaseCd = gameEvent.map.ward_purchase_cooldown
  const isDaytime      = gameEvent.map.daytime
  const buildings      = gameEvent.buildings

  // Deduplicate events from the GSI stream (Dota resends recent events each tick)
  const newEvents = gameEvent.events.filter(ev =>
    !state.pastEvents.some(past =>
      `${past.event_type}-${past.game_time}` === `${ev.event_type}-${ev.game_time}`
    )
  )

  if (newEvents.length > 0) {
    const newEvent = newEvents[0]
    state.pastEvents.push(newEvent)

    if (newEvent.event_type === "roshan_killed" && state.storeData.roshan?.active) {
      state.roshanDeadAt = gameTime
    } else if (newEvent.event_type === "aegis_picked_up" && state.storeData.aegis?.active) {
      state.aegisPickedAt = gameTime
    }
  }

  // Skip duplicate ticks; reset on game restart (clock rewind)
  if (state.lastGameTime === gameTime) return
  if (state.lastGameTime > gameTime) state.lastGameTime = 0

  const isTurbo = state.storeData.turbo?.active

  if (state.storeData.stack?.active)       reminders.checkForStack(gameTime)
  if (state.storeData.midrunes?.active)    reminders.checkForMidRunes(gameTime)
  if (state.storeData.bountyrunes?.active) reminders.checkForBountyRunes(gameTime)
  if (state.storeData.neutral?.active)     reminders.checkNeutralItems(gameTime, isTurbo)
  if (state.storeData.smoke?.active)       reminders.checkForSmoke(gameTime)
  if (state.storeData.ward?.active)        reminders.checkForWards(gameTime, wardsPurchaseCd)
  if (state.storeData.daytime?.active)     reminders.checkForDaytime(isDaytime)
  if (state.storeData.tower?.active)       reminders.checkForTowerDeny(gameTime, buildings)
  if (state.storeData.wisdomrunes?.active) reminders.checkForWisdomRunes(gameTime)
  if (state.storeData.lotus?.active)       reminders.checkForLotus(gameTime, isTurbo)
  if (state.storeData.tormentor?.active)   reminders.checkForFirstTormentor(gameTime)

  if (state.roshanDeadAt && state.storeData.roshan?.active) {
    reminders.checkForRoshanWarnTime(gameTime, state.roshanDeadAt, isTurbo)
  }
  if (state.aegisPickedAt && state.storeData.aegis?.active) {
    reminders.checkForAegisWarnTime(gameTime, state.aegisPickedAt, isTurbo)
  }

  state.lastGameTime = gameTime
}

// --- Keep live state in sync with user settings changes ---

store.onStoreChange((newValue) => {
  const parsed = {}
  for (const key in newValue) {
    parsed[key] = JSON.parse(newValue[key])
  }
  state.storeData = parsed
})

store.onVolumeChange((newValue) => {
  state.volume = newValue
})

module.exports = {
  onNewGameEvent,
  checkForGameRunning,
  isGameRunning,
  playTestSound,
}
