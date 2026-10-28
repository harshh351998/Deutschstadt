const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

class FakeWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;
  readyState = FakeWebSocket.CONNECTING;
  listeners = new Map();
  sent = [];
  constructor(url) { this.url = url; FakeWebSocket.instances.push(this); }
  addEventListener(type, listener) {
    if (!this.listeners.has(type)) this.listeners.set(type, []);
    this.listeners.get(type).push(listener);
  }
  emit(type, event = {}) { for (const listener of this.listeners.get(type) || []) listener(event); }
  open() { this.readyState = FakeWebSocket.OPEN; this.emit('open'); }
  receive(message) { this.emit('message', { data: JSON.stringify(message) }); }
  send(raw) { this.sent.push(JSON.parse(raw)); }
  close() { this.readyState = FakeWebSocket.CLOSED; this.emit('close'); }
}
FakeWebSocket.instances = [];

function loadClient() {
  FakeWebSocket.instances = [];
  const window = {
    location: { protocol: 'http:', hostname: 'localhost', port: '8080' },
    WebSocket: FakeWebSocket,
    setTimeout,
    clearTimeout
  };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '..', 'multiplayer-client.js'), 'utf8'), { window });
  return window.DeutschstadtMultiplayer;
}

test('room requests, confirmation, leave, and server errors use matching protocol messages', () => {
  const multiplayer = loadClient();
  const statuses = [];
  const rooms = [];
  const client = multiplayer.createClient({ onStatus: value => statuses.push(value), onRoom: room => rooms.push(room) });
  client.createRoom({ name: 'Alex', sceneId: 'town', x: 800, y: 590 });
  client.createRoom({ name: 'Alex', sceneId: 'town', x: 800, y: 590 });
  const socket = FakeWebSocket.instances[0];
  assert.equal(socket.url, 'ws://localhost:8080/multiplayer');
  socket.open();
  socket.receive({ type: 'welcome', playerId: 'server-session-id' });
  assert.deepEqual(socket.sent[0], { type: 'create-room', name: 'Alex', sceneId: 'town', x: 800, y: 590 });
  assert.equal(socket.sent.filter(message => message.type === 'create-room').length, 1, 'a repeated click cannot submit a duplicate create');

  const room = { code: 'GER-4821', playerCount: 1, maxPlayers: 4, players: [{ id: 'server-session-id', name: 'Alex', sceneId: 'town', x: 800, y: 590 }] };
  socket.receive({ type: 'room-joined', room });
  assert.equal(rooms.at(-1).code, 'GER-4821');
  assert.equal(statuses.at(-1).state, 'connected');

  client.leaveRoom();
  assert.deepEqual(socket.sent.at(-1), { type: 'leave-room' });
  socket.receive({ type: 'room-left', roomCode: 'GER-4821' });
  assert.equal(rooms.at(-1), null);

  client.joinRoom('GER-9999', { name: 'Alex', sceneId: 'town', x: 800, y: 590 });
  assert.deepEqual(socket.sent.at(-1), { type: 'join-room', roomCode: 'GER-9999', name: 'Alex', sceneId: 'town', x: 800, y: 590 });
  socket.receive({ type: 'error', code: 'room_not_found' });
  assert.equal(statuses.at(-1).state, 'error');
  assert.match(statuses.at(-1).message, /not found/i);
  client.disconnect();
});
