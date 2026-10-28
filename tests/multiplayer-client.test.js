const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { WebSocket } = require('ws');
const { startServer } = require('../server');

function loadBrowserClient(url) {
  const address = new URL(url);
  const window = {
    location: { protocol: address.protocol === 'wss:' ? 'https:' : 'http:', hostname: address.hostname, port: address.port },
    WebSocket, setTimeout, clearTimeout
  };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '..', 'multiplayer-client.js'), 'utf8'), { window });
  return window.DeutschstadtMultiplayer;
}

test('only remote players in the local scene are eligible for rendering', () => {
  const multiplayer = loadBrowserClient('ws://localhost:8080/multiplayer');
  const players = [
    { id: 'local', sceneId: 'town' },
    { id: 'town-peer', sceneId: 'town' },
    { id: 'cafe-peer', sceneId: 'cafe' }
  ];
  const visible = multiplayer.playersInScene(players, 'town', 'local');
  assert.equal(visible.length, 1);
  assert.equal(visible[0].id, 'town-peer');
});

test('browser clients join a room, synchronize movement, and clear remote state', async t => {
  const server = await startServer({ port: 0, host: '127.0.0.1' });
  const url = `ws://127.0.0.1:${server.port}/multiplayer`;
  const multiplayer = loadBrowserClient(url);
  let remotePlayers = [];
  let room = null;
  const statusHistory = [];
  const client = multiplayer.createClient({
    onStatus: value => statusHistory.push(value),
    onPlayers: players => { remotePlayers = players; },
    onRoom: value => { room = value; }
  });
  let peerClient = null;
  t.after(async () => {
    client.disconnect();
    peerClient?.disconnect();
    await new Promise(resolve => server.webSocketServer.close(resolve));
    await new Promise(resolve => server.httpServer.close(resolve));
  });

  client.createRoom({ name: 'Alex', sceneId: 'town', x: 800, y: 590 });
  await new Promise((resolve, reject) => {
    const started = Date.now();
    const check = () => {
      if (room?.code) { resolve(); return; }
      if (Date.now() - started > 1500) { reject(new Error('Browser client did not create a room')); return; }
      setTimeout(check, 10);
    };
    check();
  });
  let peerRemotes = [];
  peerClient = multiplayer.createClient({ onPlayers: players => { peerRemotes = players; } });
  peerClient.joinRoom(room.code, { name: 'Mira', sceneId: 'town', x: 700, y: 500 });
  await new Promise((resolve, reject) => {
    const started = Date.now();
    const check = () => {
      if (remotePlayers.some(player => player.name === 'Mira') && peerRemotes.some(player => player.name === 'Alex')) { resolve(); return; }
      if (Date.now() - started > 1500) { reject(new Error('Room members did not receive each other')); return; }
      setTimeout(check, 10);
    };
    check();
  });

  client.updateLocalPlayer({ sceneId: 'cafe', x: 640, y: 400 });
  await new Promise((resolve, reject) => {
    const started = Date.now();
    const check = () => {
      const update = peerRemotes.find(player => player.name === 'Alex' && player.sceneId === 'cafe');
      if (update) { assert.deepEqual({ x: update.x, y: update.y }, { x: 640, y: 400 }); resolve(); return; }
      if (Date.now() - started > 1500) { reject(new Error('Browser client position was not relayed')); return; }
      setTimeout(check, 10);
    };
    check();
  });

  peerClient.disconnect();
  await new Promise((resolve, reject) => {
    const started = Date.now();
    const check = () => {
      if (!remotePlayers.some(player => player.name === 'Mira')) { resolve(); return; }
      if (Date.now() - started > 1500) { reject(new Error('Disconnected peer remained in the browser client')); return; }
      setTimeout(check, 10);
    };
    check();
  });
  assert.equal(remotePlayers.some(player => player.name === 'Mira'), false, 'remote list removes disconnected peers');
  client.disconnect();
  assert.equal(remotePlayers.length, 0, 'disconnect clears the remote list');
});

test('browser client reconnects and rejoins its room after a dropped connection', async t => {
  const server = await startServer({ port: 0, host: '127.0.0.1' });
  const multiplayer = loadBrowserClient(`ws://127.0.0.1:${server.port}/multiplayer`);
  let localSessionId = null;
  let clientRoom = null;
  const client = multiplayer.createClient({ onPlayers: (_players, id) => { if (id) localSessionId = id; }, onRoom: room => { clientRoom = room; } });
  const peerClient = multiplayer.createClient();
  t.after(async () => {
    client.disconnect();
    peerClient.disconnect();
    await new Promise(resolve => server.webSocketServer.close(resolve));
    await new Promise(resolve => server.httpServer.close(resolve));
  });
  client.createRoom({ name: 'Reconnecter', sceneId: 'town', x: 800, y: 590 });
  const waitFor = async predicate => {
    const started = Date.now();
    while (Date.now() - started < 3000) {
      if (predicate()) return;
      await new Promise(resolve => setTimeout(resolve, 20));
    }
    throw new Error('Timed out waiting for reconnect');
  };
  await waitFor(() => server.players.size === 1 && localSessionId && clientRoom?.code);
  peerClient.joinRoom(clientRoom.code, { name: 'Friend', sceneId: 'town', x: 700, y: 500 });
  await waitFor(() => server.players.size === 2);
  const firstId = localSessionId;
  for (const [socket, player] of server.players) if (player.id === firstId) socket.close(1012, 'Test reconnect');
  await waitFor(() => server.players.size === 2 && localSessionId && localSessionId !== firstId && clientRoom?.playerCount === 2);
  assert.equal([...server.players.values()].filter(player => player.roomCode === clientRoom.code).length, 2, 'the session rejoins without duplicating membership');
});
