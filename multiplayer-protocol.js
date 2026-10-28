'use strict';

const SCENE_BOUNDS = Object.freeze({
  town: Object.freeze({ width: 2400, height: 1400 }),
  cafe: Object.freeze({ width: 900, height: 680 }),
  bakery: Object.freeze({ width: 900, height: 680 }),
  bank: Object.freeze({ width: 900, height: 680 }),
  supermarket: Object.freeze({ width: 900, height: 680 }),
  station: Object.freeze({ width: 900, height: 680 }),
  train: Object.freeze({ width: 900, height: 680 })
});

function validKeys(message, allowed) {
  return Object.keys(message).every(key => allowed.includes(key));
}

function normalizeRoomCode(value) {
  return typeof value === 'string' && /^GER-\d{4}$/i.test(value.trim()) ? value.trim().toUpperCase() : null;
}

function parsePlayerFields(value, allowed) {
  if (!validKeys(value, allowed) || typeof value.name !== 'string') return null;
  const name = value.name.trim().replace(/[\u0000-\u001f\u007f<>]/g, '').slice(0, 18);
  const scene = SCENE_BOUNDS[value.sceneId];
  if (!name || !scene || !Number.isFinite(value.x) || !Number.isFinite(value.y)
    || value.x < 13 || value.y < 13 || value.x > scene.width - 13 || value.y > scene.height - 13) return null;
  return { name, sceneId: value.sceneId, x: value.x, y: value.y };
}

function parseClientMessage(raw) {
  let value;
  try {
    value = JSON.parse(Buffer.isBuffer(raw) ? raw.toString('utf8') : String(raw));
  } catch {
    return { ok: false, code: 'invalid_json' };
  }
  if (!value || typeof value !== 'object' || Array.isArray(value) || typeof value.type !== 'string') {
    return { ok: false, code: 'invalid_message' };
  }

  if (value.type === 'create-room') {
    const player = parsePlayerFields(value, ['type', 'name', 'sceneId', 'x', 'y']);
    return player ? { ok: true, message: { type: value.type, ...player } } : { ok: false, code: 'invalid_room_request' };
  }

  if (value.type === 'join-room') {
    const player = parsePlayerFields(value, ['type', 'roomCode', 'name', 'sceneId', 'x', 'y']);
    const roomCode = normalizeRoomCode(value.roomCode);
    return player && roomCode ? { ok: true, message: { type: value.type, roomCode, ...player } } : { ok: false, code: 'invalid_room_request' };
  }

  if (value.type === 'leave-room') {
    return validKeys(value, ['type']) ? { ok: true, message: { type: value.type } } : { ok: false, code: 'invalid_room_request' };
  }

  if (value.type === 'position') {
    if (!validKeys(value, ['type', 'sceneId', 'x', 'y'])) return { ok: false, code: 'invalid_position' };
    const scene = SCENE_BOUNDS[value.sceneId];
    if (!scene || !Number.isFinite(value.x) || !Number.isFinite(value.y)
      || value.x < 13 || value.y < 13 || value.x > scene.width - 13 || value.y > scene.height - 13) {
      return { ok: false, code: 'invalid_position' };
    }
    return { ok: true, message: { type: 'position', sceneId: value.sceneId, x: value.x, y: value.y } };
  }

  return { ok: false, code: 'unknown_message_type' };
}

module.exports = { SCENE_BOUNDS, normalizeRoomCode, parseClientMessage };
