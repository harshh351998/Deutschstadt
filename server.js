'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');
const { WebSocket, WebSocketServer } = require('ws');
const { parseClientMessage, normalizeRoomCode } = require('./multiplayer-protocol');

const PORT = Number(process.env.PORT) || 8080;
const HOST = process.env.HOST || '0.0.0.0';
const MAX_UPDATES_PER_SECOND = 20;
const MAX_ROOM_PLAYERS = 4;
const PUBLIC_FILES = new Map([
  ['/', 'index.html'], ['/index.html', 'index.html'], ['/style.css', 'style.css'],
  ['/game.js', 'game.js'], ['/world-data.js', 'world-data.js'], ['/lessons.js', 'lessons.js'],
  ['/learning.js', 'learning.js'], ['/multiplayer-client.js', 'multiplayer-client.js']
]);
const CONTENT_TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8' };

function serveGame(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { Allow: 'GET, HEAD' }).end();
    return;
  }
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
  catch { res.writeHead(400).end('Bad request'); return; }
  const filename = PUBLIC_FILES.get(pathname);
  if (!filename) { res.writeHead(404).end('Not found'); return; }
  const filePath = path.join(__dirname, filename);
  fs.readFile(filePath, (error, contents) => {
    if (error) { res.writeHead(500).end('Unable to load game file'); return; }
    res.writeHead(200, {
      'Content-Type': CONTENT_TYPES[path.extname(filePath)] || 'application/octet-stream',
      'Content-Length': contents.length,
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff'
    });
    res.end(req.method === 'HEAD' ? undefined : contents);
  });
}

function generateRoomCode(rooms, randomInt = crypto.randomInt) {
  for (let attempt = 0; attempt < 100; attempt++) {
    const code = `GER-${String(randomInt(0, 10000)).padStart(4, '0')}`;
    if (!rooms.has(code)) return code;
  }
  return null;
}

function createGameServer() {
  const httpServer = http.createServer(serveGame);
  const webSocketServer = new WebSocketServer({
    server: httpServer,
    path: '/multiplayer',
    maxPayload: 2048,
    perMessageDeflate: false,
    verifyClient: ({ origin, req }) => {
      if (!origin) return true; // Non-browser local test clients have no Origin header.
      try { return origin !== 'null' && new URL(origin).host === req.headers.host; }
      catch { return false; }
    }
  });
  const players = new Map();
  const rooms = new Map();
  const lastUpdateAt = new WeakMap();

  function send(socket, message) {
    if (socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify(message));
  }
  function snapshot(player) {
    return { id: player.id, name: player.name, sceneId: player.sceneId, x: player.x, y: player.y };
  }
  function roomSnapshot(room) {
    return {
      code: room.code,
      hostId: room.hostId,
      playerCount: room.members.size,
      maxPlayers: MAX_ROOM_PLAYERS,
      players: [...room.members].map(socket => players.get(socket)).filter(Boolean).map(snapshot)
    };
  }
  function broadcastRoom(room, message, except = null) {
    for (const socket of room.members) if (socket !== except) send(socket, message);
  }
  function reject(socket, code) {
    send(socket, { type: 'error', code });
    socket.close(1008, 'Invalid multiplayer message');
  }
  function reportError(socket, code) { send(socket, { type: 'error', code }); }

  function setPlayerState(player, message) {
    player.name = message.name;
    player.sceneId = message.sceneId;
    player.x = message.x;
    player.y = message.y;
  }

  function createRoom(socket, message) {
    const player = players.get(socket);
    if (player.roomCode) { reportError(socket, 'already_in_room'); return; }
    const code = generateRoomCode(rooms);
    if (!code) { reportError(socket, 'room_code_unavailable'); return; }
    setPlayerState(player, message);
    const room = { code, hostId: player.id, members: new Set([socket]) };
    player.roomCode = code;
    rooms.set(code, room);
    send(socket, { type: 'room-joined', room: roomSnapshot(room) });
  }

  function joinRoom(socket, message) {
    const player = players.get(socket);
    if (player.roomCode) { reportError(socket, 'already_in_room'); return; }
    const code = normalizeRoomCode(message.roomCode);
    const room = code && rooms.get(code);
    if (!room) { reportError(socket, 'room_not_found'); return; }
    if (room.members.size >= MAX_ROOM_PLAYERS) { reportError(socket, 'room_full'); return; }
    setPlayerState(player, message);
    player.roomCode = room.code;
    room.members.add(socket);
    send(socket, { type: 'room-joined', room: roomSnapshot(room) });
    broadcastRoom(room, {
      type: 'player-joined', player: snapshot(player), roomCode: room.code,
      playerCount: room.members.size, hostId: room.hostId
    }, socket);
  }

  function leaveRoom(socket, notifyPlayer = true) {
    const player = players.get(socket);
    if (!player?.roomCode) { if (notifyPlayer) reportError(socket, 'not_in_room'); return; }
    const room = rooms.get(player.roomCode);
    const code = player.roomCode;
    if (!room) { player.roomCode = null; return; }
    room.members.delete(socket);
    player.roomCode = null;
    if (notifyPlayer) send(socket, { type: 'room-left', roomCode: code });
    if (!room.members.size) { rooms.delete(code); return; }
    if (room.hostId === player.id) {
      const nextHost = players.get(room.members.values().next().value);
      room.hostId = nextHost.id;
    }
    broadcastRoom(room, { type: 'player-left', playerId: player.id, roomCode: code, playerCount: room.members.size });
    broadcastRoom(room, { type: 'room-updated', room: roomSnapshot(room) });
  }

  webSocketServer.on('connection', socket => {
    const player = { id: crypto.randomUUID(), name: 'Townsfolk', sceneId: 'town', x: 800, y: 590, roomCode: null };
    players.set(socket, player);
    send(socket, { type: 'welcome', playerId: player.id });

    socket.on('message', raw => {
      const parsed = parseClientMessage(raw);
      if (!parsed.ok) { reject(socket, parsed.code); return; }
      if (parsed.message.type === 'create-room') { createRoom(socket, parsed.message); return; }
      if (parsed.message.type === 'join-room') { joinRoom(socket, parsed.message); return; }
      if (parsed.message.type === 'leave-room') { leaveRoom(socket); return; }
      if (!player.roomCode) { reportError(socket, 'not_in_room'); return; }
      const room = rooms.get(player.roomCode);
      if (!room?.members.has(socket)) { player.roomCode = null; reportError(socket, 'not_in_room'); return; }
      const now = Date.now();
      if (now - (lastUpdateAt.get(socket) || 0) < 1000 / MAX_UPDATES_PER_SECOND) return;
      lastUpdateAt.set(socket, now);
      const next = parsed.message;
      if (player.sceneId === next.sceneId && player.x === next.x && player.y === next.y) return;
      player.sceneId = next.sceneId;
      player.x = next.x;
      player.y = next.y;
      broadcastRoom(room, { type: 'player-updated', player: snapshot(player), roomCode: room.code }, socket);
    });

    socket.on('close', () => {
      leaveRoom(socket, false);
      if (!players.delete(socket)) return;
    });
    socket.on('error', error => console.warn('Multiplayer socket error:', error.message));
  });

  webSocketServer.on('error', error => console.error('WebSocket server error:', error.message));
  return { httpServer, webSocketServer, players, rooms };
}

async function startServer({ port = PORT, host = HOST } = {}) {
  const app = createGameServer();
  await new Promise((resolve, reject) => {
    app.httpServer.once('error', reject);
    app.httpServer.listen(port, host, resolve);
  });
  return { ...app, port: app.httpServer.address().port, host };
}

function printAddresses(port) {
  console.log(`Deutschstadt is available at http://localhost:${port}`);
  console.log(`WebSocket endpoint: ws://localhost:${port}/multiplayer`);
  for (const addresses of Object.values(os.networkInterfaces())) {
    for (const address of addresses || []) {
      if (address.family === 'IPv4' && !address.internal) console.log(`LAN: http://${address.address}:${port}`);
    }
  }
}

if (require.main === module) {
  startServer().then(server => printAddresses(server.port)).catch(error => {
    console.error('Could not start Deutschstadt:', error.message);
    process.exitCode = 1;
  });
}

module.exports = { createGameServer, startServer, generateRoomCode };
