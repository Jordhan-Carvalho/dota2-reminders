// ─── Reminder definitions ────────────────────────────────────────────────────
// Single source of truth for the left-panel toggle list.
// Adding a new reminder only requires a new entry here + a matching store key.
const REMINDERS = [
  { id: 'stack',       icon: '⚔', label: 'Stack'            },
  { id: 'midrunes',    icon: '✦', label: 'Mid Runes'        },
  { id: 'bountyrunes', icon: '◆', label: 'Bounty Runes'     },
  { id: 'neutral',     icon: '⚗', label: 'Neutral Items'    },
  { id: 'smoke',       icon: '≋', label: 'Smoke'            },
  { id: 'ward',        icon: '◉', label: 'Wards'            },
  { id: 'daytime',     icon: '☽', label: 'Day / Night'      },
  { id: 'tower',       icon: '△', label: 'Tower Deny'       },
  { id: 'roshan',      icon: '☠', label: 'Roshan'           },
  { id: 'aegis',       icon: '◈', label: 'Aegis'            },
  { id: 'wisdomrunes', icon: '✧', label: 'Wisdom Runes'     },
  { id: 'lotus',       icon: '❀', label: 'Lotus'            },
  { id: 'tormentor',   icon: '✠', label: 'First Tormentor'  },
]

// Default config applied when no saved value exists in the store
const DEFAULT_CONFIG = {
  stack:       { active: false, delay: 13 },
  midrunes:    { active: true,  delay: 4  },
  bountyrunes: { active: true,  delay: 3  },
  neutral:     { active: true,  delay: 0  },
  smoke:       { active: true,  delay: 1  },
  ward:        { active: true,  delay: 0  },
  daytime:     { active: true,  delay: 0  },
  tower:       { active: true,  delay: 0  },
  roshan:      { active: true,  delay: 0  },
  aegis:       { active: true,  delay: 0  },
  wisdomrunes: { active: true,  delay: 6  },
  lotus:       { active: true,  delay: 3  },
  tormentor:   { active: true,  delay: 0  },
  turbo:       { active: false, delay: 0  },
}

// ─── Render reminder rows ────────────────────────────────────────────────────
const renderReminderRows = () => {
  const list = document.querySelector('.reminder-list')
  list.innerHTML = REMINDERS.map(({ id, icon, label }) => `
    <div class="reminder-row">
      <span class="rune-icon">${icon}</span>
      <span class="reminder-name">${label}</span>
      <label class="gem-toggle">
        <input type="checkbox" id="${id}-checkbox" />
        <span class="toggle-track">
          <span class="toggle-label--off">Off</span>
          <span class="toggle-gem"></span>
          <span class="toggle-label--on">On</span>
        </span>
      </label>
    </div>
  `).join('')
}

// ─── Wire up a single reminder (checkbox + optional delay input) ─────────────
const setHTMLvalues = async (reminderName, values) => {
  const checkBox = document.getElementById(`${reminderName}-checkbox`)
  checkBox.checked = values.active

  checkBox.addEventListener('change', async () => {
    const reminderValues = await window.mainApi.storeGet(reminderName)
    await window.mainApi.storeSet(reminderName, { ...reminderValues, active: checkBox.checked })
  })

  const delayElem = document.getElementById(`${reminderName}-delay`)
  if (delayElem) {
    delayElem.value = values.delay

    delayElem.addEventListener('change', async () => {
      const reminderValues = await window.mainApi.storeGet(reminderName)
      await window.mainApi.storeSet(reminderName, { ...reminderValues, delay: Number(delayElem.value) })
    })
  }

  await window.mainApi.storeSet(reminderName, values)
}

// ─── Load all reminder settings from the store ───────────────────────────────
const getUserConfiguration = async () => {
  const config = { ...DEFAULT_CONFIG }

  for (const key in config) {
    const saved = await window.mainApi.storeGet(key)
    if (saved) {
      config[key].active = saved.active
      config[key].delay  = saved.delay
    }
  }

  for (const key in config) {
    setHTMLvalues(key, config[key])
  }
}

// ─── Volume ──────────────────────────────────────────────────────────────────
const volumeListener = async () => {
  const volumeInputElem = document.getElementById('volume-input')
  const saved = await window.mainApi.userStoreGet('volume')

  volumeInputElem.value = saved ? String(saved) : '0.5'

  volumeInputElem.addEventListener('change', async () => {
    await window.mainApi.userStoreSet('volume', Number(volumeInputElem.value))
  })
}

// ─── Test sound button ───────────────────────────────────────────────────────
const playTestSoundListener = () => {
  document.getElementById('test-sound').addEventListener('click', async () => {
    await window.mainApi.playTestSound()
  })
}

// ─── App version display ─────────────────────────────────────────────────────
const setVersion = () => {
  const versionElem = document.getElementById('d2r-version')
  window.versions.app((_event, value) => {
    versionElem.innerText = value
  })
}

// ─── Init ────────────────────────────────────────────────────────────────────
renderReminderRows()
volumeListener()
playTestSoundListener()
setVersion()
getUserConfiguration()
