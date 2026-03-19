jest.mock('../helpers/soundPlay.js', () => ({ play: jest.fn() }))
jest.mock('../store/store.js', () => ({
  handleStoreGet: jest.fn(),
  getAllData: jest.fn(() => ({})),
  handleUserStoreGet: jest.fn(() => null),
  onStoreChange: jest.fn(),
  onVolumeChange: jest.fn(),
}))
jest.mock('../game/gameState.js', () => ({
  volume: 1,
  lastCallBuyWards: 0,
  lastCallTowerDeny: 0,
  daytimeCalled: false,
  nightCalled: false,
  roshanDeadAt: null,
  aegisPickedAt: null,
}))

const sound = require('../helpers/soundPlay.js')
const store = require('../store/store.js')
const state = require('../game/gameState.js')
const C = require('../game/constants.js')
const reminders = require('../game/reminders.js')

beforeEach(() => {
  jest.clearAllMocks()
  store.handleStoreGet.mockReturnValue({ delay: 0 })
  state.lastCallBuyWards = 0
  state.lastCallTowerDeny = 0
  state.daytimeCalled = false
  state.nightCalled = false
  state.roshanDeadAt = null
  state.aegisPickedAt = null
})

// --- Interval reminders ---

describe('checkForStack', () => {
  test('fires at t=60 with delay=0', () => {
    reminders.checkForStack(60)
    expect(sound.play).toHaveBeenCalledTimes(1)
  })

  test('fires at t=120 with delay=0', () => {
    reminders.checkForStack(120)
    expect(sound.play).toHaveBeenCalledTimes(1)
  })

  test('does not fire at t=59', () => {
    reminders.checkForStack(59)
    expect(sound.play).not.toHaveBeenCalled()
  })

  test('fires at t=50 with delay=10', () => {
    store.handleStoreGet.mockReturnValue({ delay: 10 })
    reminders.checkForStack(50)
    expect(sound.play).toHaveBeenCalledTimes(1)
  })

  test('does not fire at t=60 when delay=10', () => {
    store.handleStoreGet.mockReturnValue({ delay: 10 })
    reminders.checkForStack(60)
    expect(sound.play).not.toHaveBeenCalled()
  })
})

describe('checkForMidRunes', () => {
  test('fires at t=120 with delay=0', () => {
    reminders.checkForMidRunes(120)
    expect(sound.play).toHaveBeenCalledTimes(1)
  })

  test('fires at t=240 with delay=0', () => {
    reminders.checkForMidRunes(240)
    expect(sound.play).toHaveBeenCalledTimes(1)
  })

  test('does not fire at t=119', () => {
    reminders.checkForMidRunes(119)
    expect(sound.play).not.toHaveBeenCalled()
  })
})

describe('checkForLotus', () => {
  test('fires at t=180 in normal mode', () => {
    reminders.checkForLotus(180, false)
    expect(sound.play).toHaveBeenCalledTimes(1)
  })

  test('fires at t=90 in turbo mode', () => {
    reminders.checkForLotus(90, true)
    expect(sound.play).toHaveBeenCalledTimes(1)
  })

  test('does not fire at t=90 in normal mode', () => {
    reminders.checkForLotus(90, false)
    expect(sound.play).not.toHaveBeenCalled()
  })

  test('does not fire at t=135 in turbo mode (not a 90s multiple)', () => {
    reminders.checkForLotus(135, true)
    expect(sound.play).not.toHaveBeenCalled()
  })
})

describe('checkForFirstTormentor', () => {
  test('fires at t=1200', () => {
    reminders.checkForFirstTormentor(C.FIRST_TORMENTOR_TIME)
    expect(sound.play).toHaveBeenCalledTimes(1)
  })

  test('does not fire at t=1199', () => {
    reminders.checkForFirstTormentor(1199)
    expect(sound.play).not.toHaveBeenCalled()
  })

  test('does not fire at t=1201', () => {
    reminders.checkForFirstTormentor(1201)
    expect(sound.play).not.toHaveBeenCalled()
  })
})

describe('checkNeutralItems', () => {
  test('fires at all 5 tier times in normal mode', () => {
    C.NEUTRAL_ITEM_TIMES.forEach((t, tier) => {
      jest.clearAllMocks()
      reminders.checkNeutralItems(t, false)
      expect(sound.play).toHaveBeenCalledTimes(1)
      expect(sound.play.mock.calls[0][0]).toContain(`neutralTier${tier + 1}.mp3`)
    })
  })

  test('fires at halved times in turbo mode', () => {
    C.NEUTRAL_ITEM_TIMES.forEach(t => {
      jest.clearAllMocks()
      reminders.checkNeutralItems(t / 2, true)
      expect(sound.play).toHaveBeenCalledTimes(1)
    })
  })

  test('does not fire at turbo times in normal mode', () => {
    reminders.checkNeutralItems(210, false) // tier 1 turbo time
    expect(sound.play).not.toHaveBeenCalled()
  })

  test('does not fire at off times', () => {
    reminders.checkNeutralItems(421, false)
    expect(sound.play).not.toHaveBeenCalled()
  })
})

// --- Timed event reminders ---

describe('checkForRoshanWarnTime', () => {
  test('plays min warning at deathTime + ROSHAN_MIN_RESPAWN', () => {
    reminders.checkForRoshanWarnTime(100 + C.ROSHAN_MIN_RESPAWN, 100, false)
    expect(sound.play).toHaveBeenCalledTimes(1)
    expect(sound.play.mock.calls[0][0]).toContain('roshanMin.mp3')
  })

  test('plays max warning at deathTime + ROSHAN_MAX_RESPAWN', () => {
    reminders.checkForRoshanWarnTime(100 + C.ROSHAN_MAX_RESPAWN, 100, false)
    expect(sound.play).toHaveBeenCalledTimes(1)
    expect(sound.play.mock.calls[0][0]).toContain('roshanMax.mp3')
  })

  test('clears roshanDeadAt after max respawn window passes', () => {
    state.roshanDeadAt = 100
    reminders.checkForRoshanWarnTime(100 + C.ROSHAN_MAX_RESPAWN + 1, 100, false)
    expect(state.roshanDeadAt).toBeNull()
  })

  test('halves min respawn time in turbo mode', () => {
    const turboMin = C.ROSHAN_MIN_RESPAWN / 2
    reminders.checkForRoshanWarnTime(100 + turboMin, 100, true)
    expect(sound.play).toHaveBeenCalledTimes(1)
    expect(sound.play.mock.calls[0][0]).toContain('roshanMin.mp3')
  })

  test('halves max respawn time in turbo mode', () => {
    const turboMax = C.ROSHAN_MAX_RESPAWN / 2
    reminders.checkForRoshanWarnTime(100 + turboMax, 100, true)
    expect(sound.play).toHaveBeenCalledTimes(1)
    expect(sound.play.mock.calls[0][0]).toContain('roshanMax.mp3')
  })

  test('does not fire at normal times in turbo mode', () => {
    reminders.checkForRoshanWarnTime(100 + C.ROSHAN_MIN_RESPAWN, 100, true)
    expect(sound.play).not.toHaveBeenCalled()
  })
})

describe('checkForAegisWarnTime', () => {
  test('plays 2-minute warning at pickupTime + AEGIS_WARN_2MIN', () => {
    reminders.checkForAegisWarnTime(100 + C.AEGIS_WARN_2MIN, 100, false)
    expect(sound.play.mock.calls[0][0]).toContain('aegis2min.mp3')
  })

  test('plays 30s warning at pickupTime + AEGIS_WARN_30S', () => {
    reminders.checkForAegisWarnTime(100 + C.AEGIS_WARN_30S, 100, false)
    expect(sound.play.mock.calls[0][0]).toContain('aegis30s.mp3')
  })

  test('plays 10s warning at pickupTime + AEGIS_WARN_10S', () => {
    reminders.checkForAegisWarnTime(100 + C.AEGIS_WARN_10S, 100, false)
    expect(sound.play.mock.calls[0][0]).toContain('aegis10s.mp3')
  })

  test('plays expired warning at pickupTime + AEGIS_EXPIRED', () => {
    reminders.checkForAegisWarnTime(100 + C.AEGIS_EXPIRED, 100, false)
    expect(sound.play.mock.calls[0][0]).toContain('aegisExpired.mp3')
  })

  test('clears aegisPickedAt after expiry window passes', () => {
    state.aegisPickedAt = 100
    reminders.checkForAegisWarnTime(100 + C.AEGIS_EXPIRED + 1, 100, false)
    expect(state.aegisPickedAt).toBeNull()
  })

  test('applies turbo offset — 2min warning fires 60s earlier', () => {
    const turboWarn = C.AEGIS_WARN_2MIN - C.AEGIS_TURBO_OFFSET
    reminders.checkForAegisWarnTime(100 + turboWarn, 100, true)
    expect(sound.play.mock.calls[0][0]).toContain('aegis2min.mp3')
  })

  test('does not fire at normal timing in turbo mode', () => {
    reminders.checkForAegisWarnTime(100 + C.AEGIS_WARN_2MIN, 100, true)
    expect(sound.play).not.toHaveBeenCalled()
  })
})

// --- Cooldown-based reminders ---

describe('checkForWards', () => {
  test('fires when wardCd=0 and no prior call', () => {
    state.lastCallBuyWards = 0
    reminders.checkForWards(100, 0)
    expect(sound.play).toHaveBeenCalledTimes(1)
  })

  test('fires when wardCd=0 and cooldown has fully elapsed', () => {
    state.lastCallBuyWards = 60 // 40s ago, cooldown is 30s
    reminders.checkForWards(100, 0)
    expect(sound.play).toHaveBeenCalledTimes(1)
  })

  test('does not fire when wardCd > 0', () => {
    reminders.checkForWards(100, 5)
    expect(sound.play).not.toHaveBeenCalled()
  })

  test('does not fire when still on cooldown', () => {
    state.lastCallBuyWards = 80 // only 20s ago, cooldown is 30s
    reminders.checkForWards(100, 0)
    expect(sound.play).not.toHaveBeenCalled()
  })

  test('updates lastCallBuyWards to current gameTime on fire', () => {
    state.lastCallBuyWards = 0
    reminders.checkForWards(100, 0)
    expect(state.lastCallBuyWards).toBe(100)
  })
})

describe('checkForDaytime', () => {
  test('fires daytime sound on day transition', () => {
    state.daytimeCalled = false
    reminders.checkForDaytime(true)
    expect(sound.play.mock.calls[0][0]).toContain('daytime.mp3')
    expect(state.daytimeCalled).toBe(true)
    expect(state.nightCalled).toBe(false)
  })

  test('does not fire daytime again when already called', () => {
    state.daytimeCalled = true
    reminders.checkForDaytime(true)
    expect(sound.play).not.toHaveBeenCalled()
  })

  test('fires nighttime sound on night transition', () => {
    state.daytimeCalled = true
    state.nightCalled = false
    reminders.checkForDaytime(false)
    expect(sound.play.mock.calls[0][0]).toContain('nighttime.mp3')
    expect(state.nightCalled).toBe(true)
    expect(state.daytimeCalled).toBe(false)
  })

  test('does not fire nighttime again when already called', () => {
    state.nightCalled = true
    reminders.checkForDaytime(false)
    expect(sound.play).not.toHaveBeenCalled()
  })
})

describe('checkForTowerDeny', () => {
  const makeBuildings = (building, health, maxHealth) => ({
    dire: { [building]: { health, max_health: maxHealth } },
  })

  test('fires when tower health is exactly at 10% threshold', () => {
    reminders.checkForTowerDeny(100, makeBuildings('dota_badguys_tower1_mid', 100, 1000))
    expect(sound.play).toHaveBeenCalledTimes(1)
    expect(sound.play.mock.calls[0][0]).toContain('mid-tower.mp3')
  })

  test('fires when tower health is below 10%', () => {
    reminders.checkForTowerDeny(100, makeBuildings('dota_badguys_tower1_mid', 50, 1000))
    expect(sound.play).toHaveBeenCalledTimes(1)
  })

  test('does not fire when tower health is above 10%', () => {
    reminders.checkForTowerDeny(100, makeBuildings('dota_badguys_tower1_mid', 200, 1000))
    expect(sound.play).not.toHaveBeenCalled()
  })

  test('respects 15s cooldown between calls', () => {
    state.lastCallTowerDeny = 90 // only 10s ago
    reminders.checkForTowerDeny(100, makeBuildings('dota_badguys_tower1_mid', 50, 1000))
    expect(sound.play).not.toHaveBeenCalled()
  })

  test('fires after cooldown has elapsed', () => {
    state.lastCallTowerDeny = 84 // 16s ago, cooldown is 15s
    reminders.checkForTowerDeny(100, makeBuildings('dota_badguys_tower1_mid', 50, 1000))
    expect(sound.play).toHaveBeenCalledTimes(1)
  })

  test('extracts correct lane: mid', () => {
    reminders.checkForTowerDeny(100, makeBuildings('dota_badguys_tower1_mid', 50, 1000))
    expect(sound.play.mock.calls[0][0]).toContain('mid-tower.mp3')
  })

  test('extracts correct lane: bot', () => {
    reminders.checkForTowerDeny(100, makeBuildings('dota_badguys_tower1_bot', 50, 1000))
    expect(sound.play.mock.calls[0][0]).toContain('bot-tower.mp3')
  })

  test('extracts correct lane: top', () => {
    reminders.checkForTowerDeny(100, makeBuildings('dota_badguys_tower1_top', 50, 1000))
    expect(sound.play.mock.calls[0][0]).toContain('top-tower.mp3')
  })

  test('does not fire for non-tower buildings', () => {
    const buildings = { dire: { dota_badguys_rax_melee_mid: { health: 50, max_health: 1000 } } }
    reminders.checkForTowerDeny(100, buildings)
    expect(sound.play).not.toHaveBeenCalled()
  })
})
