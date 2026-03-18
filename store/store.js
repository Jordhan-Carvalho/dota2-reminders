const Store = require('electron-store');

// Two stores are used:
//   store     — reminder settings ({ active, delay } objects serialised as JSON strings)
//   userStore — flat user preferences (volume, clientId) stored as raw values
//
// Values in `store` are JSON-stringified so electron-store's schema can stay
// simple (type: 'string') while still holding structured objects at runtime.
const schema = {
	stack: {
		type: 'string',
	},
	midrunes: {
		type: 'string',
	},
	bountyrunes: {
		type: 'string',
	},
	smoke: {
		type: 'string',
	},
	wards: {
		type: 'string',
	},
	neutral: {
		type: 'string',
	},
  daytime: {
    type: 'string'
  },
  tower: {
    type: 'string'
  },
  roshan: {
    type: 'string'
  },
  aegis: {
    type: 'string'
  },
  wisdomrunes: {
		type: 'string',
	},
  lotus: {
		type: 'string',
	},
  tormentor: {
    type: 'string',
  }
};

const store = new Store({schema})
const userStore = new Store({name: "userStore"})

// Assuming that the value will always be an object
function handleStoreSet(_event, key, value) {
  const jsonValue = JSON.stringify(value) 
  store.set(key, jsonValue)
}

// Same assumption as above
function handleStoreGet(_event, key) {
  const value = JSON.parse(store.get(key, null)) 
  return value
}

function getAllData() {
  const parsedData = {}
  for (const key in store.store) {
    parsedData[key] = JSON.parse(store.store[key])
  }
  return parsedData
}

function onVolumeChange(callback) {
  userStore.onDidChange("volume", callback)
} 

function onStoreChange(callback) {
  store.onDidAnyChange(callback);
}


function handleUserStoreSet(_event, key, value) {
  userStore.set(key, value)
}

function handleUserStoreGet(_event, key) {
  const value = userStore.get(key, null) 
  return value
}

module.exports = {
  handleStoreGet,
  handleStoreSet,
  handleUserStoreGet,
  handleUserStoreSet,
  getAllData,
  onStoreChange,
  onVolumeChange,
  userStore
} 
