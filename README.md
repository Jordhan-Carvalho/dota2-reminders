# Dota 2 reminders - Desktop App 

![Electron app](dev_assets.o/elec.png?raw=true "Electron app")


## General
This is a Windows app (based on Electron) that listens to events in your Dota 2 game and plays a sound to remind you of important timings, such as bounty rune spawns or stack.

## Architecture

```mermaid
flowchart TD
    D2["🎮 Dota 2 Client\n(Gamestate Integration)"]

    subgraph Electron["Electron App"]
        Server["server.js\nHTTP Server :29301"]
        Main["main.js\nMain Process\n(window, auto-update)"]
        Game["game/game.js\nGame Logic\n(reminder checks)"]
        Store["store/store.js\nPersistence\n(electron-store)"]
        Sound["helpers/soundPlay.js\nAudio Queue"]
        Preload["preload.js\nIPC Bridge"]

        subgraph Renderer["Renderer Process"]
            UI["home/home.html\nSettings UI\n(toggles + delays)"]
        end
    end

    Audio["🔊 Audio Output\n(afplay / PowerShell)"]

    D2 -- "HTTP POST (JSON)" --> Server
    Server -- "game events" --> Game
    Game -- "read settings" --> Store
    Game -- "play reminder" --> Sound
    Sound --> Audio

    Main --> Server
    Main --> Preload
    Preload -- "IPC (contextBridge)" --> UI
    UI -- "save settings" --> Store
```

## Features

- Automatically monitors your game status.
- Offers a range of different reminders:
  - Stack (reminds every minute).
  - Wards (reminds every time it is available in the shop, with a delay of 40 seconds to avoid spam).
  - Smoke (reminds every time it restocks, which takes 7 minutes).
  - Bounty runes
  - Mid runes
  - Neutral items (reminds every time a new tier is available to drop).
  - Day/Night time
  - Tower in deny range (reminds with a minimum delay of 10 seconds between calls).
  - Roshan/Aegis (reminds with minimum and maximum Roshan spawn time).
  - Aegis (reminds at 2 minutes, 30 seconds, 10 seconds of the expiration)
  - Lotus 
  - Windom runes
  - First tormentor
- Allows you to add a delay (in seconds) to some reminders, such as stack and runes.

## How to install
To install the app, please follow these three steps:

1 - Download the app 

2 - Configure the Dota client to send events to the app

3 - Run the app

### Step 1: Download the App or Build from Source
You can either build the app from source code using Electron Forge CLI or download the installer and CFG file.

Here are the download links:

App:
- https://d2r-electron-server-release.vercel.app

CFG file:
- https://gofile.io/d/9nD2y9
- https://mega.nz/file/zUEQEbgY#vBTxM_nbOhYUbdruY3XleiEzpcHDZQgSj4AXlVQUXl4
- https://www.dropbox.com/s/ut1nkjsk138i8rc/gamestate_integration_d2reminders.cfg?dl=0



**Note: You may receive a warning about the app being an untrusted application. This is because Microsoft requires an annual fee for the Windows Authenticode code signing certificate, which is beyond my financial means.*


### Step 2: Gamestate Integration
To allow the app to receive in-game information from Dota, you need to enable game state integration. You can follow the Overwolf guide for instructions on how to do this:
https://support.overwolf.com/en/support/solutions/articles/9000212745-how-to-enable-game-state-integration-for-dota-2

After enabling game state integration, copy the gamestate_integration_d2reminders.cfg file to your Dota CFG folder. If you have never used Overwolf before, you may not have the gamestate_integration folder. In that case, create the folder manually.
![DotaFolder](dev_assets.o/gamestatePath.png?raw=true "Gamestate path")

**Note: The gamestate_integration_d2reminders.cfg is found on this repository and also included on the zip file*


## Roadmap
- Optimization
- Reminder to use Midas
- Reminder about an ally being smoked
- Record video of app demo and installation
- Optional set reminder when watching games
- Custom reminders
- Dark Mode
- Turbo game mode
- Config ESLINT
- Tests
- Rework UI

## MIT License

Copyright (c) 2012-2023 Jordhan Carvalho and others

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
