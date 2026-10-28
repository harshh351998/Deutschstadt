const test = require('node:test');
const assert = require('node:assert/strict');
const { EventEmitter } = require('node:events');
const { WebSocket } = require('ws');
const { createGameServer, generateRoomCode } = require('../server');

class FakeSocket extends EventEmitter {
  readyState = WebSocket.OPEN;
  messages = [];
  send(raw) { this.messages.push(JSON.parse(raw)); }
  close() { this.readyState = WebSocket.CLOSED; this.emit('close'); }
  message(value) { this.emit('message', Buffer.from(JSON.stringify(value))); }
  take(type) { return this.messages.find(message => message.type === type); }
}

function createConnectedSocket(server) {
  const socket = new FakeSocket();
  server.webSocketServer.emit('connection', socket, { headers: {} });
  return socket;
}

const player = (type, name, x = 800) => ({ type, name, sceneId: 'town', x, y: 590 });

test('room codes retry collisions and stop after the bounded attempts', () => {
  const rooms = new Map([['GER-0001', {}]]);
  const code = generateRoomCode(rooms, (() => { let n = 0; return () => [1, 2][n++]; })());
  assert.equal(code, 'GER-0002');
  assert.equal(generateRoomCode(new Map(), () => 1), 'GER-0001');
  assert.equal(generateRoomCode(new Map(Array.from({ length: 10000 }, (_, n) => [`GER-${String(n).padStart(4, '0')}`, {}])), () => 1), null);
});

test('room creation, membership, capacity, movement isolation, and cleanup are authoritative', () => {
  const server = createGameServer();
  const host = createConnectedSocket(server);
  const firstId = host.take('welcome').playerId;
  host.message(player('create-room', 'Alex'));
  const roomCode = host.take('room-joined').room.code;
  assert.match(roomCode, /^GER-\d{4}$/);
  assert.equal(server.rooms.get(roomCode).members.size, 1);
  host.message(player('create-room', 'Alex'));
  assert.equal(host.messages.at(-1).code, 'already_in_room');
  assert.equal(host.take('room-joined').room.playerCount, 1);

  const members = [];
  for (const name of ['Mira', 'Jonas', 'Lena']) {
    const socket = createConnectedSocket(server); members.push(socket);
    socket.message({ ...player('join-room', name, 700), roomCode });
    assert.equal(socket.take('room-joined').room.playerCount, members.length + 1);
  }
  const full = createConnectedSocket(server);
  full.message({ ...player('join-room', 'Erik'), roomCode });
  assert.equal(full.take('error').code, 'room_full');
  full.message({ ...player('join-room', 'Erik'), roomCode: 'GER-9999' });
  assert.equal(full.messages.at(-1).code, 'room_not_found');

  const isolated = createConnectedSocket(server);
  isolated.message(player('create-room', 'Other'));
  const otherRoom = isolated.take('room-joined').room.code;
  host.message({ type: 'position', sceneId: 'cafe', x: 640, y: 400 });
  assert.equal(members[0].messages.some(message => message.type === 'player-updated' && message.player?.id === firstId && message.player.sceneId === 'cafe'), true);
  assert.equal(isolated.messages.some(message => message.type === 'player-updated'), false);

  host.close();
  assert.equal(server.players.has(host), false);
  assert.equal(server.rooms.get(roomCode).hostId, members[0].take('welcome').playerId);
  assert.equal(members[0].messages.at(-1).room.playerCount, 3);
  members.forEach(socket => socket.close());
  assert.equal(server.rooms.has(roomCode), false);
  assert.equal(server.rooms.has(otherRoom), true);
  isolated.close();
  assert.equal(server.rooms.has(otherRoom), false);
});

test('invalid coordinates and forged client ids are rejected before room state changes', () => {
  const server = createGameServer();
  const socket = createConnectedSocket(server);
  socket.message({ ...player('create-room', 'Alex'), id: 'forged' });
  assert.equal(socket.take('error').code, 'invalid_room_request');
  assert.equal(server.rooms.size, 0);
  socket.message({ type: 'create-room', name: 'Alex', sceneId: 'town', x: -1, y: 590 });
  assert.equal(socket.messages.at(-1).code, 'invalid_room_request');
  assert.equal(server.rooms.size, 0);
});
