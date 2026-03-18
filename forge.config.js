const path = require('path')
const pjson = require('./package.json');

module.exports = {
  publishers: [
    {
      name: '@electron-forge/publisher-github',
      config: {
        repository: {
          owner: 'jordhan-carvalho',
          name: 'd2r-electron',
        },
        prerelease: false,
        draft: true,
      },
    },
  ],
  packagerConfig: {
    executableName: "Dota 2 Reminders",
    icon: path.join(__dirname, '/assets/dota2reminders'),
    name: "Dota 2 Reminders",
    extraResource: [
      path.join(__dirname, 'scripts.o/gamestate_integration_d2reminders.cfg'),
    ],
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
         setupExe: `dota2-reminders-installer-v${pjson.version}.exe`,
         iconUrl: "https://store5.gofile.io/download/e8fb2a30-1420-4d10-b961-949f92575634/dota2reminders.ico",
         setupIcon: path.join(__dirname, '/assets/dota2reminders.ico'),
         loadingGif: path.join(__dirname, '/assets/ursa.gif'),
      },
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {},
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {},
    },
  ],
};
