const test = require('node:test');
const assert = require('node:assert/strict');
const { parseClientMessage, normalizeRoomCode } = require('../multiplayer-protocol');

test('room codes are normalized and strictly formatted', () => {
  assert.equal(normalizeRoomCode(' ger-4821 '), 'GER-4821');
  assert.equal(normalizeRoomCode('GER-123'), null);
  assert.equal(normalizeRoomCode('ABC-1234'), null);
});

test('room requests sanitize names and never accept client-chosen IDs', () => {
  assert.deepEqual(parseClientMessage('{"type":"create-room","name":"  Alex<>  ","sceneId":"town","x":800,"y":590}'), {
    ok: true, message: { type: 'create-room', name: 'Alex', sceneId: 'town', x: 800, y: 590 }
  });
  assert.equal(parseClientMessage('{"type":"create-room","name":"Alex","sceneId":"town","x":800,"y":590,"id":"claimed"}').ok, false);
  assert.equal(parseClientMessage('{"type":"join-room","roomCode":"GER-4821","name":"Mira","sceneId":"town","x":700,"y":500}').ok, true);
  assert.equal(parseClientMessage('{"type":"join-room","roomCode":"bad","name":"Mira","sceneId":"town","x":700,"y":500}').ok, false);
  assert.deepEqual(parseClientMessage('{"type":"leave-room"}'), { ok: true, message: { type: 'leave-room' } });
});

test('position messages accept known scenes and reject malformed or out-of-bounds state', () => {
  assert.deepEqual(parseClientMessage('{"type":"position","sceneId":"town","x":1200,"y":600}'), {
    ok: true, message: { type: 'position', sceneId: 'town', x: 1200, y: 600 }
  });
  assert.deepEqual(parseClientMessage('{"type":"position","sceneId":"supermarket","x":450,"y":575}'), {
    ok: true, message: { type: 'position', sceneId: 'supermarket', x: 450, y: 575 }
  });
  assert.equal(parseClientMessage('{"type":"position","sceneId":"station","x":450,"y":575}').ok, true);
  assert.equal(parseClientMessage('{"type":"position","sceneId":"train","x":450,"y":575}').ok, true);
  assert.equal(parseClientMessage('{"type":"position","sceneId":"town","x":2300,"y":1300}').ok, true);
  for (const invalid of [
    '{',
    '{"type":"position","sceneId":"unknown","x":1,"y":1}',
    '{"type":"position","sceneId":"town","x":99999,"y":50}',
    '{"type":"position","sceneId":"town","x":null,"y":50}',
    '{"type":"dance"}'
  ]) assert.equal(parseClientMessage(invalid).ok, false, invalid);
});
