import { clone, deepEqual, getShortPeerID } from './Utils'
import * as objectHash from 'object-hash'

const HEARTBEAT_INTERVAL = 10 * 1000
const HEARTBEAT_TIMEOUT = 3 * 60 * 1000
const HEARTBEAT_DEATH = 15 * 60 * 10000

const LOBBY = 'Lobby'
const STATION = 'Station'
const MAX_MESSAGES = 100

type Message = {
  id: number
  msg: string
  user: string
}

export default class State {
  private doc: any = { users: {}, rooms: {} }
  private backupDoc: any = { users: {}, rooms: {} }

  private chat: any = {
    hash: objectHash({}),
    messages: {},
    truncated: false,
  }

  private userID: string = ''
  private heartbeatID?: number

  private isStation: boolean = false

  private userSettings: any = {
    displayName: '',
    room: LOBBY,
    role: 'student',
    dateJoined: Date.now(),
    handRaised: false,
    connections: [
      {
        id: '',
        target: {},
      },
    ],
    timestamp: Date.now(),
    tombstone: false,
  }

  private callback?: (config: { room?: boolean; chat?: boolean }) => void

  constructor(userID: string) {
    this.userID = userID

    this.initUser()
    this.initRooms(0)
  }

  init(role: string, defaultRooms: number = 0) {
    this.userSettings.role = role

    if (this.userID.startsWith(STATION)) {
      this.isStation = true
    }

    this.initUser()
    this.initRooms(defaultRooms)

    if (this.heartbeatID) {
      clearInterval(this.heartbeatID)
    }

    const self = this
    this.heartbeatID = setInterval(() => {
      self.heartBeat()
    }, HEARTBEAT_INTERVAL)
  }

  initUser() {
    this.userSettings.displayName = this.userID
    this.userSettings.room = this.isStation ? this.userID : LOBBY

    this.userSettings.dateJoined = Date.now()
    this.userSettings.timestamp = Date.now()
    this.userSettings.tombstone = false

    this.doc.users[this.userID] = this.userSettings
  }

  // basic initialize rooms configuration
  initRooms(defaultRooms: number) {
    for (let i = 1; i <= defaultRooms; i++) {
      this.addRoom(false, 'Room ' + i)
    }

    this.addRoom(false, LOBBY)

    if (this.isStation) {
      this.addRoom(true, this.userID)
    }
  }

  toJSON(doc?: any) {
    const createBackup = !doc

    if (createBackup) {
      doc = this.doc
    }

    const newDoc = {
      rooms: this.filterTombstones(clone(doc.rooms)),
      users: this.filterTombstones(clone(doc.users)),
    }

    if (createBackup && deepEqual(newDoc, this.backupDoc)) {
      return this.backupDoc
    }

    if (createBackup) {
      this.backupDoc = newDoc
    }

    return newDoc
  }

  getChat(): { messages: Message[]; truncated: boolean } {
    const messages: Message[] = []

    const keys = Object.keys(this.chat.messages).sort()

    for (const key of keys) {
      let { user, msg } = this.chat.messages[key]

      messages.push({ id: parseInt(key), user, msg })
    }

    return { messages, truncated: this.chat.truncated }
  }

  addMessage(msg: string) {
    const timestamp = Date.now()
    const user = getShortPeerID(this.userID)

    this.chat.messages[timestamp] = {
      user,
      msg,
    }

    if (!this.truncateMessages()) {
      this.chat.hash = objectHash(this.chat.messages)
    }

    this.update({ chat: true })
  }

  filterTombstones(obj: any) {
    const newObj: any = {}

    for (const id in obj) {
      if (!obj[id].tombstone) {
        newObj[id] = clone(obj[id])
        delete newObj[id].tombstone
        delete newObj[id].timestamp
      }
    }

    return newObj
  }

  getUsers() {
    return this.filterTombstones(this.doc.users)
  }

  getUsersInRoom(room: string) {
    const users = this.doc.getMap('users').toJSON()
    const userIDs: string[] = []
    for (const id in users) {
      if (users[id].room === room) {
        userIDs.push(id)
      }
    }
    return userIDs
  }

  addRoom(withTimestamp: boolean, name?: string) {
    if (name) {
      this.doc.rooms[name] = {
        studentPublicState: '',
        teacherPublicState: '',
        teacherPrivateState: '',
        timestamp: withTimestamp ? Date.now() : 0,
        tombstone: false,
      }

      this.update({ room: withTimestamp })
    } else {
      const roomIDs: number[] = Object.keys(this.doc.rooms)
        .filter((e) => e.match(/Room/))
        .map((e) => e.split(' ')[1])
        .map((e) => parseInt(e))
        .sort((a, b) => a - b)

      let newRoomID = 1
      for (const id of roomIDs) {
        if (id !== newRoomID) {
          break
        }
        newRoomID++
      }

      return this.addRoom(true, 'Room ' + newRoomID)
    }
  }

  gotoRoom(roomID: string) {
    if (this.isRoomAlive(roomID)) {
      this.userSettings.room = roomID
    } else {
      this.userSettings.room = LOBBY
    }

    this.userSettings.timestamp = Date.now()
    this.userSettings.tombstone = false

    this.doc.users[this.userID] = this.userSettings

    this.update({ room: true })
  }

  isRoomAlive(roomID: string) {
    return this.doc.rooms[roomID] && !this.doc.rooms[roomID].tombstone
  }

  isUserAlive(userID: string) {
    return this.doc.users[userID] && !this.doc.users[userID].tombstone
  }

  encode(withChat: boolean) {
    const rooms = clone(this.doc.rooms)
    const users = clone(this.doc.users)
    const chat = {
      hash: this.chat.hash,
      messages: withChat ? clone(this.chat.messages) : {},
      truncated: this.chat.truncated,
    }

    return { rooms, users, chat }
  }

  update(config: { room?: boolean; chat?: boolean }) {
    if (this.callback) {
      this.callback(config)
    }
  }

  merge(doc: any) {
    const rooms = this.doc.rooms
    const users = this.doc.users

    for (const id in doc.rooms) {
      if (!rooms[id]) {
        rooms[id] = doc.rooms[id]
      } else if (rooms[id].timestamp < doc.rooms[id].timestamp) {
        rooms[id] = doc.rooms[id]
      }
    }

    for (const id in doc.users) {
      if (!users[id]) {
        users[id] = doc.users[id]
      } else if (users[id].timestamp < doc.users[id].timestamp) {
        users[id] = doc.users[id]
      }
    }

    this.doc.rooms = clone(rooms)
    this.doc.users = clone(users)

    let updateRoom = !deepEqual(this.toJSON(doc), this.toJSON(this.doc))
    let updateChat

    if (this.chat.hash !== doc.chat.hash) {
      updateChat = true
      this.chat.truncated = this.chat.truncated || doc.chat.truncated

      if (Object.keys(doc.chat.messages).length !== 0) {
        this.chat.messages = { ...doc.chat.messages, ...this.chat.messages }

        if (!this.truncateMessages()) {
          this.chat.hash = objectHash(this.chat.messages)
        }

        if (this.chat.hash === doc.chat.hash) {
          updateChat = false
        }
      }
    }

    this.update({ room: updateRoom, chat: updateChat })
  }

  removeUser(userID: string, performUpdate: boolean = false) {
    this.doc.users[userID].tombstone = true
    this.doc.users[userID].timestamp = Date.now()

    if (userID.startsWith(STATION) && this.isRoomAlive(userID)) {
      this.removeRoom(userID)
    }

    if (performUpdate) {
      this.update({ room: true })
    }
  }

  removeRoom(roomID: string) {
    this.doc.rooms[roomID].tombstone = true
    this.doc.rooms[roomID].timestamp = Date.now()

    if (roomID.startsWith(STATION) && this.isUserAlive(roomID)) {
      this.removeUser(roomID)
    }

    for (const id in this.doc.users) {
      if (this.isUserAlive(id) && this.doc.users[id].room === roomID) {
        this.doc.users[id].room = LOBBY
        this.doc.users[id].timestamp = Date.now()
      }
    }
  }

  heartBeat() {
    const timeNow = Date.now()

    this.userSettings.timestamp = timeNow
    this.userSettings.tombstone = false

    this.doc.users[this.userID] = this.userSettings

    if (this.isStation) {
      this.doc.rooms[this.userID].timestamp = timeNow
      this.doc.rooms[this.userID].tombstone = false
    }

    let tombstones: string[] = []

    for (const id in this.doc.users) {
      if (this.isUserAlive(id)) {
        let timestamp = this.doc.users[id].timestamp || 0

        if (timestamp + HEARTBEAT_TIMEOUT < timeNow) {
          tombstones.push(id)
        }
      }
    }

    /*
    for (const id of tombstones) {
      console.warn('TOMBSTONE', id)
      this.removeUser(id)
    }

    // remove users entirely if they have been dead for a while

    for (const id in this.doc.users) {
      if (!this.isUserAlive(id)) {
        let timestamp = this.doc.users[id].timestamp || 0

        if (timestamp + HEARTBEAT_DEATH < timeNow) {
          delete this.doc.users[id]
        }
      }
    }
    */
    this.update({ room: true })
  }

  truncateMessages() {
    const ids = Object.keys(this.chat.messages).sort()

    if (ids.length <= MAX_MESSAGES) {
      return false
    }

    let toDelete = ids.length - MAX_MESSAGES

    for (const id of ids) {
      delete this.chat.messages[id]
      toDelete--

      if (toDelete <= 0) {
        break
      }
    }

    this.chat.hash = objectHash(this.chat.messages)
    this.chat.truncated = true

    return true
  }

  on(
    event: 'update',
    callback: (config: { room?: boolean; chat?: boolean }) => void
  ) {
    this.callback = callback
  }
}

function throttle(
  cb: (full: boolean) => void,
  delay: number = HEARTBEAT_TIMEOUT
) {
  let timerID: number | null = null

  function execute() {
    try {
      cb(true)
      timerID = window.setTimeout(execute, delay)
    } catch (e) {
      timerID = null
    }
  }

  return (full: boolean) => {
    cb(full)

    if (timerID && full) {
      window.clearTimeout(timerID)
      timerID = null
    }

    if (!timerID) {
      timerID = window.setTimeout(execute, delay)
    }
  }
}
