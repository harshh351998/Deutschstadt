(() => {
  'use strict';

  const MIN_SEND_INTERVAL = 100;
  const MAX_RECONNECT_DELAY = 8000;

  function playersInScene(players, sceneId, localPlayerId = null) {
    return [...players].filter(player => player.id !== localPlayerId && player.sceneId === sceneId);
  }

  function createClient({ onStatus = () => {}, onPlayers = () => {}, onRoom = () => {} } = {}) {
    let socket = null;
    let enabled = false;
    let playerId = null;
    let playerName = 'Townsfolk';
    let localPlayer = { sceneId: 'town', x: 800, y: 590 };
    let room = null;
    let desiredRoomCode = null;
    let pendingAction = null;
    let roomActionInFlight = false;
    let remotes = new Map();
    let lastSent = null;
    let lastSentAt = 0;
    let sendTimer = null;
    let retryTimer = null;
    let retryDelay = 1000;

    function status(state, message) { onStatus({ state, message }); }
    function publishPlayers() { onPlayers([...remotes.values()].map(player => ({ ...player })), playerId); }
    function publishRoom() { onRoom(room ? { ...room, players: room.players?.map(player => ({ ...player })) || [] } : null); }
    function setRoom(nextRoom) {
      room = nextRoom;
      remotes.clear();
      for (const player of room?.players || []) if (player.id !== playerId) remotes.set(player.id, player);
      publishPlayers();
      publishRoom();
    }
    function endpoint() {
  if (window.location.protocol === 'file:') return null;

  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = window.DEUTSCHSTADT_WS_HOST || window.location.host;
  const path = window.DEUTSCHSTADT_WS_PATH || '/multiplayer';

  return `${protocol}//${host}${path}`;
}

    function send(message) {
      if (!socket || socket.readyState !== window.WebSocket.OPEN) return false;
      try { socket.send(JSON.stringify(message)); return true; }
      catch { return false; }
    }

    function sendPendingAction() {
      if (!playerId || !pendingAction) return;
      if (send(pendingAction)) pendingAction = null;
    }

    function sendPosition(force = false) {
      if (!socket || socket.readyState !== window.WebSocket.OPEN) return;
      const position = { type: 'position', ...localPlayer };
      if (!force && lastSent && lastSent.sceneId === position.sceneId && lastSent.x === position.x && lastSent.y === position.y) return;
      const wait = MIN_SEND_INTERVAL - (Date.now() - lastSentAt);
      if (!force && wait > 0) {
        if (!sendTimer) sendTimer = window.setTimeout(() => { sendTimer = null; sendPosition(); }, wait);
        return;
      }
      if (send(position)) { lastSent = localPlayer; lastSentAt = Date.now(); }
    }

    function handleMessage(connection, event) {
      if (socket !== connection) return;
      let message;
      try { message = JSON.parse(event.data); }
      catch { status('error', 'Received an unreadable server message'); return; }
      if (!message || typeof message.type !== 'string') return;
      if (message.type === 'welcome') {
        playerId = message.playerId;
        status('connected', 'Connected · choose a room');
        if (desiredRoomCode) pendingAction = roomRequest('join-room', desiredRoomCode);
        sendPendingAction();
      } else if (message.type === 'room-joined' || message.type === 'room-updated') {
        if (!message.room?.code) return;
        if (message.type === 'room-joined') roomActionInFlight = false;
        desiredRoomCode = message.room.code;
        pendingAction = null;
        setRoom(message.room);
        status('connected', `In room ${room.code}`);
      } else if (message.type === 'player-joined' || message.type === 'player-updated') {
        const player = message.player;
        if (room && message.roomCode === room.code && player?.id && player.id !== playerId) {
          remotes.set(player.id, player);
          if (message.playerCount) room.playerCount = message.playerCount;
          publishPlayers(); publishRoom();
        }
      } else if (message.type === 'player-left') {
        if (room && message.roomCode === room.code) {
          remotes.delete(message.playerId);
          if (message.playerCount) room.playerCount = message.playerCount;
          publishPlayers(); publishRoom();
        }
      } else if (message.type === 'room-left') {
        roomActionInFlight = false;
        desiredRoomCode = null;
        setRoom(null);
        status('connected', 'Left room · ready to join another');
      } else if (message.type === 'error') {
        pendingAction = null;
        roomActionInFlight = false;
        if (['room_not_found', 'room_full'].includes(message.code)) {
          desiredRoomCode = null;
          setRoom(null);
        }
        const errors = {
          room_not_found: 'Room code not found. Check the code and try again.',
          room_full: 'That room already has four players.',
          already_in_room: 'Leave your current room first.',
          not_in_room: 'You are not in a room.',
          invalid_room_code: 'Use a code like GER-4821.',
          invalid_room_request: 'The room request was rejected. Check the room code and player details.',
          room_code_unavailable: 'A room code could not be generated. Please retry.',
          invalid_position: 'The server rejected this player position.',
          invalid_json: 'The server rejected an unreadable request.',
          invalid_message: 'The server rejected an invalid request.',
          unknown_message_type: 'The server does not recognize this request.'
        };
        status('error', errors[message.code] || `Multiplayer error (${message.code || 'unknown'}).`);
      }
    }

    function roomRequest(type, code = null) {
      return {
        type,
        ...(code ? { roomCode: code } : {}),
        name: playerName,
        sceneId: localPlayer.sceneId,
        x: localPlayer.x,
        y: localPlayer.y
      };
    }

    function scheduleReconnect() {
      if (!enabled || retryTimer) return;
      status('reconnecting', 'Offline · retrying');
      retryTimer = window.setTimeout(() => {
        retryTimer = null;
        openConnection();
      }, retryDelay);
      retryDelay = Math.min(retryDelay * 2, MAX_RECONNECT_DELAY);
    }

    function openConnection() {
      if (!enabled || !endpoint()) {
        status('disconnected', 'Multiplayer needs the local game server');
        return;
      }
      if (socket && (socket.readyState === window.WebSocket.CONNECTING || socket.readyState === window.WebSocket.OPEN)) return;
      status('connecting', 'Connecting…');
      let connection;
      try { connection = new window.WebSocket(endpoint()); }
      catch {
        status('disconnected', 'Solo play · server unavailable');
        scheduleReconnect();
        return;
      }
      socket = connection;
      connection.addEventListener('open', () => {
        if (socket !== connection) return;
        retryDelay = 1000;
        lastSent = null;
        status('connected', 'Connected · choose a room');
      });
      connection.addEventListener('message', event => handleMessage(connection, event));
      connection.addEventListener('error', () => {
        if (socket === connection) status('disconnected', 'Solo play · server unavailable');
      });
      connection.addEventListener('close', () => {
        if (socket !== connection) return;
        socket = null;
        playerId = null;
        remotes.clear();
        room = null;
        publishPlayers();
        publishRoom();
        if (enabled) scheduleReconnect();
        else status('disconnected', 'Multiplayer disconnected');
      });
    }

    function updateConnectionPlayer(player = {}) {
      enabled = true;
      playerName = typeof player.name === 'string' && player.name.trim() ? player.name.trim().slice(0, 18) : 'Townsfolk';
      localPlayer = {
        sceneId: typeof player.sceneId === 'string' ? player.sceneId : 'town',
        x: Number.isFinite(player.x) ? player.x : 800,
        y: Number.isFinite(player.y) ? player.y : 590
      };
      if (retryTimer) { window.clearTimeout(retryTimer); retryTimer = null; }
      openConnection();
    }

    function requestRoom(type, code, player = {}) {
      if (roomActionInFlight) return;
      if (room) { status('error', 'Leave your current room first.'); return; }
      roomActionInFlight = true;
      updateConnectionPlayer(player);
      if (type === 'create-room') desiredRoomCode = null;
      else desiredRoomCode = code;
      pendingAction = roomRequest(type, code);
      if (socket?.readyState === window.WebSocket.OPEN && playerId) sendPendingAction();
      else openConnection();
    }

    function createRoom(player) { requestRoom('create-room', null, player); }
    function joinRoom(code, player) { requestRoom('join-room', code, player); }
    function leaveRoom() {
      desiredRoomCode = null;
      pendingAction = null;
      roomActionInFlight = false;
      if (room && socket?.readyState === window.WebSocket.OPEN) send({ type: 'leave-room' });
      else setRoom(null);
    }

    function updateLocalPlayer(player) {
      if (!player || !Number.isFinite(player.x) || !Number.isFinite(player.y) || typeof player.sceneId !== 'string') return;
      if (localPlayer.sceneId === player.sceneId && localPlayer.x === player.x && localPlayer.y === player.y) return;
      localPlayer = { sceneId: player.sceneId, x: player.x, y: player.y };
      if (enabled && room) sendPosition();
    }

    function disconnect() {
      enabled = false;
      if (retryTimer) window.clearTimeout(retryTimer);
      if (sendTimer) window.clearTimeout(sendTimer);
      retryTimer = null; sendTimer = null;
      const oldSocket = socket;
      socket = null; playerId = null; remotes.clear(); lastSent = null; room = null; desiredRoomCode = null; pendingAction = null; roomActionInFlight = false;
      if (oldSocket && oldSocket.readyState < window.WebSocket.CLOSING) oldSocket.close(1000, 'Leaving game');
      publishPlayers();
      publishRoom();
      status('disconnected', 'Multiplayer disconnected');
    }

    return { createRoom, joinRoom, leaveRoom, updateLocalPlayer, disconnect };
  }

  window.DeutschstadtMultiplayer = { createClient, playersInScene };
})();
