const store = require("../store/store.js")

// Shared mutable state for the current game session.
// Exported as a single object so all game modules read and write the same reference.
const state = {
  // Reminder throttle timestamps
  lastCallBuyWards: 0,
  lastCallTowerDeny: 0,

  // Day/night cycle tracking (prevents repeat calls on same transition)
  daytimeCalled: false,
  nightCalled: false,

  // Deduplication and timing
  lastGameTime: 0,
  pastEvents: [],

  // Set when a timed event occurs; null when the window has passed
  roshanDeadAt: null,
  aegisPickedAt: null,

  // Live settings synced from electron-store on every change
  storeData: store.getAllData(),
  volume: store.handleUserStoreGet(null, "volume"),

  // Whether a Dota 2 game is currently in progress
  isRunning: null,
  lastEventReceivedAt: null,
}

module.exports = state
