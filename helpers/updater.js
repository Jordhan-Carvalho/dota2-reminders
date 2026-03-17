const { autoUpdater, dialog, app } = require("electron")
const log = require("electron-log")
const game = require("../game/game.js")
const ga4 = require("./ga4.js")

const UPDATE_SERVER = "https://d2r-electron-server-release.vercel.app"
const UPDATE_CHECK_INTERVAL_MS = 4 * 60 * 1000 // 4 minutes

const setupAutoUpdater = () => {
  const url = `${UPDATE_SERVER}/update/${process.platform}/${app.getVersion()}`
  autoUpdater.setFeedURL({ url })
  log.info("Auto-updater configured for version:", app.getVersion())

  setInterval(() => {
    ga4.registerEvent({ name: "routine_check" })

    if (!game.isGameRunning()) {
      try {
        autoUpdater.checkForUpdates()
        ga4.registerEvent({ name: "update_check" })
      } catch (error) {
        log.error(error)
      }
    } else {
      log.info("Listening to the game")
    }
  }, UPDATE_CHECK_INTERVAL_MS)

  autoUpdater.on("update-downloaded", (_event, releaseNotes, releaseName) => {
    log.info("Update downloaded:", releaseName)

    ga4.registerEvent({
      name: "update_downloaded",
      params: {
        from_version: app.getVersion(),
        to_version: releaseName,
      },
    })

    const dialogOpts = {
      type: "info",
      buttons: ["Restart", "Later"],
      title: "Dota 2 Reminders Update",
      message: process.platform === "win32" ? releaseNotes : releaseName,
      detail: "A new version has been downloaded. Restart the application to apply the updates.",
    }

    dialog.showMessageBox(dialogOpts).then((returnValue) => {
      if (returnValue.response === 0) autoUpdater.quitAndInstall()
    })
  })

  autoUpdater.on("error", (message) => {
    log.error("There was a problem updating the application", message)
  })
}

module.exports = { setupAutoUpdater }
