jest.mock('electron', () => ({ app: { isPackaged: false } }))
jest.mock('child_process', () => ({ execSync: jest.fn() }))
jest.mock('fs', () => ({
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
  copyFileSync: jest.fn(),
}))

const { execSync } = require('child_process')
const fs = require('fs')
const gsiSetup = require('../helpers/gsiSetup')

// Simulates the output of: reg query "HKCU\Software\Valve\Steam" /v SteamPath
const makeRegOutput = (steamPath) =>
  `\nHKEY_CURRENT_USER\\Software\\Valve\\Steam\n    SteamPath    REG_SZ    ${steamPath}\n`

const STEAM_PATH = 'C:\\Steam'

beforeEach(() => {
  jest.clearAllMocks()
  delete process.env['ProgramFiles(x86)']
  delete process.env['ProgramFiles']
})

describe('gsiSetup.run() — registry success', () => {
  beforeEach(() => {
    execSync.mockReturnValue(makeRegOutput(STEAM_PATH))
    fs.mkdirSync.mockReturnValue(undefined)
    fs.copyFileSync.mockReturnValue(undefined)
  })

  test('returns success', () => {
    const result = gsiSetup.run()
    expect(result.success).toBe(true)
  })

  test('target dir contains the gamestate_integration folder', () => {
    const result = gsiSetup.run()
    expect(result.targetDir).toContain('gamestate_integration')
  })

  test('target dir is rooted at the Steam path from registry', () => {
    const result = gsiSetup.run()
    expect(result.targetDir).toContain(STEAM_PATH)
  })

  test('creates the target directory with recursive flag', () => {
    gsiSetup.run()
    expect(fs.mkdirSync).toHaveBeenCalledWith(expect.any(String), { recursive: true })
  })

  test('copies the CFG file into the target directory', () => {
    gsiSetup.run()
    const destPath = fs.copyFileSync.mock.calls[0][1]
    expect(destPath).toContain('gamestate_integration_d2reminders.cfg')
    expect(destPath).toContain('gamestate_integration')
  })
})

describe('gsiSetup.run() — registry failure, env var fallback', () => {
  beforeEach(() => {
    execSync.mockImplementation(() => { throw new Error('registry lookup failed') })
    fs.mkdirSync.mockReturnValue(undefined)
    fs.copyFileSync.mockReturnValue(undefined)
  })

  test('succeeds using ProgramFiles(x86) env var when Steam folder exists', () => {
    process.env['ProgramFiles(x86)'] = 'C:\\Program Files (x86)'
    fs.existsSync.mockReturnValue(true)
    const result = gsiSetup.run()
    expect(result.success).toBe(true)
  })

  test('falls back to ProgramFiles when ProgramFiles(x86) is missing', () => {
    process.env['ProgramFiles'] = 'C:\\Program Files'
    fs.existsSync.mockReturnValue(true)
    const result = gsiSetup.run()
    expect(result.success).toBe(true)
  })

  test('target dir is built from env var path', () => {
    process.env['ProgramFiles(x86)'] = 'C:\\Program Files (x86)'
    fs.existsSync.mockReturnValue(true)
    const result = gsiSetup.run()
    expect(result.targetDir).toContain('Program Files (x86)')
  })
})

describe('gsiSetup.run() — Steam not found', () => {
  test('returns failure when registry fails and no env var path exists', () => {
    execSync.mockImplementation(() => { throw new Error('registry lookup failed') })
    fs.existsSync.mockReturnValue(false)
    const result = gsiSetup.run()
    expect(result.success).toBe(false)
    expect(result.error).toBe('Steam installation not found.')
  })
})

describe('gsiSetup.run() — file system errors', () => {
  test('returns failure when copyFileSync throws', () => {
    execSync.mockReturnValue(makeRegOutput(STEAM_PATH))
    fs.mkdirSync.mockReturnValue(undefined)
    fs.copyFileSync.mockImplementation(() => { throw new Error('permission denied') })
    const result = gsiSetup.run()
    expect(result.success).toBe(false)
    expect(result.error).toBe('permission denied')
  })

  test('returns failure when mkdirSync throws', () => {
    execSync.mockReturnValue(makeRegOutput(STEAM_PATH))
    fs.mkdirSync.mockImplementation(() => { throw new Error('access denied') })
    const result = gsiSetup.run()
    expect(result.success).toBe(false)
    expect(result.error).toBe('access denied')
  })
})
