const test = require('node:test');
const assert = require('node:assert/strict');
const { WebSocket } = require('ws');
const { startServer } = require('../server');

function client(url) {
  const socket = new WebSocket(url);
  const messages = [];
  const waiters = [];
  socket.on('message', raw => {
    const message = JSON.parse(raw.toString());
    messages.push(message);
    for (let index = waiters.length - 1; index >= 0; index--) {
      if (waiters[index].matches(message)) {
        const [waiter] = waiters.splice(index, 1);
        clearTimeout(waiter.timer);
        waiter.resolve(message);
      }
    }
  });
  const opened = new Promise((resolve, reject) => {
    socket.once('open', resolve);
    socket.once('error', reject);
  });
  const closed = new Promise(resolve => socket.once('close', resolve));
  function waitFor(matches) {
    const existing = messages.find(matches);
    if (existing) return Promise.resolve(existing);
    return new Promise((resolve, reject) => {
      const waiter = { matches, resolve, timer: null };
      waiter.timer = setTimeout(() => {
        const index = waiters.indexOf(waiter);
        if (index >= 0) waiters.splice(index, 1);
        reject(new Error('Timed out waiting for WebSocket message'));
      }, 2000);
      waiters.push(waiter);
    });
  }
  return { socket, opened, closed, waitFor, messages };
}

function closeSocket(socket) {
  if (socket.readyState === WebSocket.CLOSED) return Promise.resolve();
  return new Promise(resolve => {
    socket.once('close', resolve);
    if (socket.readyState < WebSocket.CLOSING) socket.close();
  });
}

test('the local server serves the game and its multiplayer client', async t => {
  const server = await startServer({ port: 0, host: '127.0.0.1' });
  t.after(async () => {
    await new Promise(resolve => server.webSocketServer.close(resolve));
    await new Promise(resolve => server.httpServer.close(resolve));
  });
  const base = `http://127.0.0.1:${server.port}`;
  const page = await fetch(`${base}/`);
  assert.equal(page.status, 200);
  assert.match(await page.text(), /Deutschstadt/);
  const clientScript = await fetch(`${base}/multiplayer-client.js`);
  assert.equal(clientScript.status, 200);
  assert.match(await clientScript.text(), /createClient/);
  assert.equal((await fetch(`${base}/server.js`)).status, 404);
});

test('room members sync state and movement; leaving removes the room player', async t => {
  const server = await startServer({ port: 0, host: '127.0.0.1' });
  const url = `ws://127.0.0.1:${server.port}/multiplayer`;
  const first = client(url);
  const peers = [first];
  t.after(async () => {
    await Promise.all(peers.map(peer => closeSocket(peer.socket)));
    await new Promise(resolve => server.webSocketServer.close(resolve));
    await new Promise(resolve => server.httpServer.close(resolve));
  });
  await first.opened;
  const firstWelcome = await first.waitFor(message => message.type === 'welcome');
  first.socket.send(JSON.stringify({ type: 'create-room', name: 'Alex', sceneId: 'town', x: 800, y: 590 }));
  const created = await first.waitFor(message => message.type === 'room-joined');
  assert.match(created.room.code, /^GER-\d{4}$/);
  assert.equal(created.room.playerCount, 1);
  first.socket.send(JSON.stringify({ type: 'create-room', name: 'Alex', sceneId: 'town', x: 800, y: 590 }));
  assert.equal((await first.waitFor(message => message.type === 'error')).code, 'already_in_room');

  const second = client(url);
  peers.push(second);
  await second.opened;
  const secondWelcome = await second.waitFor(message => message.type === 'welcome');
  assert.notEqual(firstWelcome.playerId, secondWelcome.playerId);
  second.socket.send(JSON.stringify({ type: 'join-room', roomCode: created.room.code, name: 'Mira', sceneId: 'town', x: 700, y: 500 }));
  const joined = await second.waitFor(message => message.type === 'room-joined');
  assert.ok(joined.room.players.some(player => player.id === firstWelcome.playerId && player.name === 'Alex'));
  await first.waitFor(message => message.type === 'player-joined' && message.player?.id === secondWelcome.playerId);

  first.socket.send(JSON.stringify({ type: 'position', sceneId: 'cafe', x: 640, y: 400 }));
  const update = await second.waitFor(message => message.type === 'player-updated' && message.player?.id === firstWelcome.playerId && message.player.sceneId === 'cafe');
  assert.deepEqual({ x: update.player.x, y: update.player.y }, { x: 640, y: 400 });

  first.socket.send(JSON.stringify({ type: 'leave-room' }));
  const left = await second.waitFor(message => message.type === 'player-left' && message.playerId === firstWelcome.playerId);
  assert.equal(left.playerId, firstWelcome.playerId);
  assert.equal((await second.waitFor(message => message.type === 'room-updated')).room.playerCount, 1);
});

test('rooms reject missing codes, isolate players, and enforce four-player capacity', async t => {
  const server = await startServer({ port: 0, host: '127.0.0.1' });
  const url = `ws://127.0.0.1:${server.port}/multiplayer`;
  const peers = [];
  t.after(async () => {
    await Promise.all(peers.map(peer => closeSocket(peer.socket)));
    await new Promise(resolve => server.webSocketServer.close(resolve));
    await new Promise(resolve => server.httpServer.close(resolve));
  });
  const connect = async () => { const peer = client(url); peers.push(peer); await peer.opened; await peer.waitFor(message => message.type === 'welcome'); return peer; };
  const host = await connect();
  host.socket.send(JSON.stringify({ type: 'create-room', name: 'Host', sceneId: 'town', x: 800, y: 590 }));
  const room = (await host.waitFor(message => message.type === 'room-joined')).room.code;
  const outside = await connect();
  outside.socket.send(JSON.stringify({ type: 'join-room', roomCode: 'GER-9999', name: 'Nope', sceneId: 'town', x: 800, y: 590 }));
  assert.equal((await outside.waitFor(message => message.type === 'error')).code, 'room_not_found');
  const others = [];
  for (const name of ['Two', 'Three', 'Four']) {
    const peer = await connect(); others.push(peer);
    peer.socket.send(JSON.stringify({ type: 'join-room', roomCode: room, name, sceneId: 'town', x: 700, y: 500 }));
    await peer.waitFor(message => message.type === 'room-joined');
  }
  const full = await connect();
  full.socket.send(JSON.stringify({ type: 'join-room', roomCode: room, name: 'Five', sceneId: 'town', x: 700, y: 500 }));
  assert.equal((await full.waitFor(message => message.type === 'error')).code, 'room_full');
  const privateHost = await connect();
  privateHost.socket.send(JSON.stringify({ type: 'create-room', name: 'Private', sceneId: 'town', x: 800, y: 590 }));
  const privateRoom = (await privateHost.waitFor(message => message.type === 'room-joined')).room.code;
  assert.notEqual(privateRoom, room);
  host.socket.send(JSON.stringify({ type: 'position', sceneId: 'town', x: 810, y: 590 }));
  await new Promise(resolve => setTimeout(resolve, 120));
  assert.equal(privateHost.messages.some(message => message.type === 'player-updated' && message.player?.name === 'Host'), false);
});

test('invalid coordinates and malformed frames are rejected and disconnected', async t => {
  const server = await startServer({ port: 0, host: '127.0.0.1' });
  const url = `ws://127.0.0.1:${server.port}/multiplayer`;
  const peers = [];
  t.after(async () => {
    await Promise.all(peers.map(peer => closeSocket(peer.socket)));
    await new Promise(resolve => server.webSocketServer.close(resolve));
    await new Promise(resolve => server.httpServer.close(resolve));
  });
  for (const raw of [
    JSON.stringify({ type: 'position', sceneId: 'town', x: -1, y: 400 }),
    '{'
  ]) {
    const peer = client(url);
    peers.push(peer);
    await peer.opened;
    await peer.waitFor(message => message.type === 'welcome');
    peer.socket.send(JSON.stringify({ type: 'create-room', name: 'Test', sceneId: 'town', x: 800, y: 590 }));
    await peer.waitFor(message => message.type === 'room-joined');
    peer.socket.send(raw);
    await peer.waitFor(message => message.type === 'error');
    await peer.closed;
  }
});
