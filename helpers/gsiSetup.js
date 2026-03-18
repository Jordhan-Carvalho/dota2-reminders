const path = require("path")
const fs = require("fs")
const { execSync } = require("child_process")

const CFG_FILENAME = "gamestate_integration_d2reminders.cfg"
const DOTA_RELATIVE_PATH = "steamapps/common/dota 2 beta/game/dota/cfg/gamestate_integration"

function getSteamPath() {
  try {
    const result = execSync(
      'reg query "HKCU\\Software\\Valve\\Steam" /v SteamPath',
      { encoding: "utf8" }
    )
    const match = result.match(/SteamPath\s+REG_SZ\s+(.+)/)
    if (match) return match[1].trim()
  } catch (_) {}

  // Fallback using env vars — resolves correctly regardless of Windows language
  const defaults = [
    process.env["ProgramFiles(x86)"],
    process.env["ProgramFiles"],
  ]
  for (const base of defaults) {
    if (!base) continue
    const p = path.join(base, "Steam")
    if (fs.existsSync(p)) return p
  }

  return null
}

function getCfgSourcePath() {
  if (require("electron").app.isPackaged) {
    return path.join(process.resourcesPath, CFG_FILENAME)
  }
  return path.join(__dirname, "../scripts.o", CFG_FILENAME)
}

function run() {
  const steamPath = getSteamPath()
  if (!steamPath) {
    return { success: false, error: "Steam installation not found." }
  }

  const targetDir = path.join(steamPath, DOTA_RELATIVE_PATH)
  try {
    fs.mkdirSync(targetDir, { recursive: true })
    fs.copyFileSync(getCfgSourcePath(), path.join(targetDir, CFG_FILENAME))
    return { success: true, targetDir }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

module.exports = { run }
