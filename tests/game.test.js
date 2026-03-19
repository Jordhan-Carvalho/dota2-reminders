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
  lastGameTime: 0,
  pastEvents: [],
  isRunning: null,
  lastEventReceivedAt: null,
  storeData: {},
}))
jest.mock('../game/reminders.js', () => ({
  checkForStack: jest.fn(),
  checkForMidRunes: jest.fn(),
  checkForBountyRunes: jest.fn(),
  checkForSmoke: jest.fn(),
  checkForWisdomRunes: jest.fn(),
  checkForLotus: jest.fn(),
  checkForFirstTormentor: jest.fn(),
  checkNeutralItems: jest.fn(),
  checkForWards: jest.fn(),
  checkForDaytime: jest.fn(),
  checkForTowerDeny: jest.fn(),
  checkForRoshanWarnTime: jest.fn(),
  checkForAegisWarnTime: jest.fn(),
}))

const state = require('../game/gameState.js')
const reminders = require('../game/reminders.js')
const { onNewGameEvent } = require('../game/game.js')

// Builds a minimal valid GSI payload
const makeEvent = (overrides = {}) => ({
  map: {
    game_state: 'DOTA_GAMERULES_STATE_GAME_IN_PROGRESS',
    clock_time: 100,
    ward_purchase_cooldown: 0,
    daytime: true,
    ...overrides.map,
  },
  buildings: overrides.buildings ?? {},
  events: overrides.events ?? [],
})

beforeEach(() => {
  jest.clearAllMocks()
  state.lastGameTime = 0
  state.pastEvents = []
  state.roshanDeadAt = null
  state.aegisPickedAt = null
  state.storeData = {}
})

describe('onNewGameEvent — early exit guards', () => {
  test('returns early when map is missing', async () => {
    await onNewGameEvent({ events: [], buildings: {} })
    expect(reminders.checkForStack).not.toHaveBeenCalled()
  })

  test('returns early when game_state is not in progress', async () => {
    await onNewGameEvent(makeEvent({ map: { game_state: 'DOTA_GAMERULES_STATE_WAIT_FOR_PLAYERS_TO_LOAD' } }))
    expect(reminders.checkForStack).not.toHaveBeenCalled()
  })

  test('skips duplicate tick when gameTime equals lastGameTime', async () => {
    state.lastGameTime = 100
    state.storeData = { stack: { active: true } }
    await onNewGameEvent(makeEvent())
    expect(reminders.checkForStack).not.toHaveBeenCalled()
  })
})

describe('onNewGameEvent — clock rewind', () => {
  test('processes tick normally after clock rewind (game restart)', async () => {
    state.lastGameTime = 500
    state.storeData = { stack: { active: true } }
    await onNewGameEvent(makeEvent({ map: { clock_time: 50 } }))
    expect(reminders.checkForStack).toHaveBeenCalledWith(50)
  })

  test('updates lastGameTime after clock rewind', async () => {
    state.lastGameTime = 500
    await onNewGameEvent(makeEvent({ map: { clock_time: 50 } }))
    expect(state.lastGameTime).toBe(50)
  })
})

describe('onNewGameEvent — reminder routing', () => {
  test('calls checkForStack when stack is active', async () => {
    state.storeData = { stack: { active: true } }
    await onNewGameEvent(makeEvent())
    expect(reminders.checkForStack).toHaveBeenCalledWith(100)
  })

  test('does not call checkForStack when stack is inactive', async () => {
    state.storeData = { stack: { active: false } }
    await onNewGameEvent(makeEvent())
    expect(reminders.checkForStack).not.toHaveBeenCalled()
  })

  test('calls checkForWards with wardCd from event', async () => {
    state.storeData = { ward: { active: true } }
    await onNewGameEvent(makeEvent({ map: { ward_purchase_cooldown: 5 } }))
    expect(reminders.checkForWards).toHaveBeenCalledWith(100, 5)
  })

  test('calls checkForRoshanWarnTime when roshanDeadAt is set and roshan is active', async () => {
    state.roshanDeadAt = 50
    state.storeData = { roshan: { active: true } }
    await onNewGameEvent(makeEvent())
    expect(reminders.checkForRoshanWarnTime).toHaveBeenCalledWith(100, 50, undefined)
  })

  test('does not call checkForRoshanWarnTime when roshanDeadAt is null', async () => {
    state.roshanDeadAt = null
    state.storeData = { roshan: { active: true } }
    await onNewGameEvent(makeEvent())
    expect(reminders.checkForRoshanWarnTime).not.toHaveBeenCalled()
  })

  test('calls checkForAegisWarnTime when aegisPickedAt is set and aegis is active', async () => {
    state.aegisPickedAt = 80
    state.storeData = { aegis: { active: true } }
    await onNewGameEvent(makeEvent())
    expect(reminders.checkForAegisWarnTime).toHaveBeenCalledWith(100, 80, undefined)
  })
})

describe('onNewGameEvent — roshan and aegis state tracking', () => {
  test('sets roshanDeadAt on roshan_killed when roshan is active', async () => {
    state.storeData = { roshan: { active: true } }
    await onNewGameEvent(makeEvent({
      map: { clock_time: 200 },
      events: [{ event_type: 'roshan_killed', game_time: 200 }],
    }))
    expect(state.roshanDeadAt).toBe(200)
  })

  test('does not set roshanDeadAt when roshan is inactive', async () => {
    state.storeData = { roshan: { active: false } }
    await onNewGameEvent(makeEvent({
      map: { clock_time: 200 },
      events: [{ event_type: 'roshan_killed', game_time: 200 }],
    }))
    expect(state.roshanDeadAt).toBeNull()
  })

  test('sets aegisPickedAt on aegis_picked_up when aegis is active', async () => {
    state.storeData = { aegis: { active: true } }
    await onNewGameEvent(makeEvent({
      map: { clock_time: 300 },
      events: [{ event_type: 'aegis_picked_up', game_time: 300 }],
    }))
    expect(state.aegisPickedAt).toBe(300)
  })

  test('does not set aegisPickedAt when aegis is inactive', async () => {
    state.storeData = { aegis: { active: false } }
    await onNewGameEvent(makeEvent({
      map: { clock_time: 300 },
      events: [{ event_type: 'aegis_picked_up', game_time: 300 }],
    }))
    expect(state.aegisPickedAt).toBeNull()
  })
})

describe('onNewGameEvent — event deduplication', () => {
  test('ignores events already seen (same event_type + game_time)', async () => {
    state.storeData = { roshan: { active: true } }
    state.pastEvents = [{ event_type: 'roshan_killed', game_time: 200 }]
    await onNewGameEvent(makeEvent({
      map: { clock_time: 250 },
      events: [{ event_type: 'roshan_killed', game_time: 200 }],
    }))
    expect(state.roshanDeadAt).toBeNull()
  })

  test('processes a new event not yet in pastEvents', async () => {
    state.storeData = { roshan: { active: true } }
    state.pastEvents = [{ event_type: 'roshan_killed', game_time: 100 }]
    await onNewGameEvent(makeEvent({
      map: { clock_time: 250 },
      events: [{ event_type: 'roshan_killed', game_time: 250 }],
    }))
    expect(state.roshanDeadAt).toBe(250)
  })

  test('adds new events to pastEvents', async () => {
    state.pastEvents = []
    await onNewGameEvent(makeEvent({
      events: [{ event_type: 'roshan_killed', game_time: 200 }],
    }))
    expect(state.pastEvents).toHaveLength(1)
  })
})
