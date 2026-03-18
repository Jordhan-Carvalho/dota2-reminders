const { app, BrowserWindow, ipcMain, dialog } = require("electron")
const path = require("path")
const store = require("./store/store.js")
const server = require("./server.js")
const game = require("./game/game.js")
const ga4 = require("./helpers/ga4.js")
const { setupAutoUpdater } = require("./helpers/updater.js")
const gsiSetup = require("./helpers/gsiSetup")

if (require("electron-squirrel-startup")) return;

const appVersion = app.getVersion()

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
    title: `Dota 2 Reminders - v${appVersion}`,
    autoHideMenuBar: app.isPackaged,
    icon: path.join(__dirname, "/assets/dota2reminders.ico"),
  })

  mainWindow.loadFile("./home/home.html")
  mainWindow.webContents.send("app-version", appVersion)

  // Open links in the system browser instead of a new Electron window
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    require("electron").shell.openExternal(url)
    return { action: "deny" }
  })
}

app.whenReady().then(() => {
  server.startServer()

  ipcMain.handle("store:set",     store.handleStoreSet)
  ipcMain.handle("store:get",     store.handleStoreGet)
  ipcMain.handle("userStore:get", store.handleUserStoreGet)
  ipcMain.handle("userStore:set", store.handleUserStoreSet)
  ipcMain.handle("playTestSound", game.playTestSound)

  createWindow()

  if (processArg === "--squirrel-firstrun") {
    const result = gsiSetup.run()
    if (result.success) {
      dialog.showMessageBox({
        type: "info",
        title: "Dota 2 Reminders",
        message: "Gamestate Integration config installed automatically!\nYou're ready to play.",
      })
    } else {
      dialog.showMessageBox({
        type: "warning",
        title: "Dota 2 Reminders — Manual setup required",
        message: `Could not install GSI config automatically.\n\nReason: ${result.error}\n\nPlease follow the manual setup steps in the README.`,
      })
    }
  }

  ga4.registerEvent({ name: "app_opened", params: { version: appVersion } })
})

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit()
})

const processArg = process.argv[1]

if (processArg === "--squirrel-firstrun") {
  ga4.registerEvent({ name: "first_time_run", params: { version: appVersion } })
}

if (app.isPackaged && processArg !== "--squirrel-firstrun") {
  setupAutoUpdater()
}
