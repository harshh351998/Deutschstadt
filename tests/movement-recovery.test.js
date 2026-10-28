const { readFileSync } = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');

function loadPositionHelpers(colliders) {
  const source = readFileSync(path.join(__dirname, '..', 'game.js'), 'utf8');
  const start = source.indexOf('  function collidesAt(');
  const end = source.indexOf('  function recoverPlayerPosition(', start);
  assert.notEqual(start, -1, 'collision function exists');
  assert.notEqual(end, -1, 'position recovery function exists');
  const context = vm.createContext({
    PLAYER_RADIUS: 13,
    clamp: (value, min, max) => Math.max(min, Math.min(max, value)),
    WORLD: { width: 1600, height: 1000 },
    WORLDS: { town: { width: 1600, height: 1000, spawn: { x: 800, y: 590 } } },
    collidersFor: () => colliders
  });
  vm.runInContext(source.slice(start, end), context);
  return context;
}

function loadPlayerMover(colliders) {
  const source = readFileSync(path.join(__dirname, '..', 'game.js'), 'utf8');
  const start = source.indexOf('  function movePlayer(dt) {');
  const end = source.indexOf('\n  function findNearbyNpc()', start);
  assert.notEqual(start, -1, 'player movement function exists');
  assert.notEqual(end, -1, 'player movement function has a stable boundary');
  const context = vm.createContext({
    PLAYER_RADIUS: 13,
    MOVE_SPEED: 100,
    clamp: (value, min, max) => Math.max(min, Math.min(max, value)),
    WORLD: { width: 300, height: 300 },
    WORLDS: { town: { width: 300, height: 300, spawn: { x: 40, y: 40 } } },
    collidersFor: () => colliders,
    collides: (x, y) => context.collidesAt('town', x, y),
    mode: 'game',
    paused: false,
    activeNpc: null,
    ui: { backdrop: { classList: { contains: () => true } } },
    keys: new Set(),
    state: { sceneId: 'town', x: 80, y: 80 },
    recoverPlayerPosition() {},
    markDirty() {},
    syncLocalPlayer() {}
  });
  const collisionStart = source.indexOf('  function collidesAt(');
  const collisionEnd = source.indexOf('\n  function nearestWalkablePosition(', collisionStart);
  vm.runInContext(source.slice(collisionStart, collisionEnd), context);
  vm.runInContext(source.slice(start, end), context);
  return context;
}

test('an embedded player is moved to the nearest walkable position', () => {
  const game = loadPositionHelpers([{ x: 100, y: 100, w: 80, h: 80 }]);
  const safe = game.nearestWalkablePosition('town', 120, 120);

  assert.ok(safe);
  assert.equal(game.collidesAt('town', safe.x, safe.y), false);
  assert.ok(Math.hypot(safe.x - 120, safe.y - 120) < 40);
});

test('a valid position is preserved without moving the player', () => {
  const game = loadPositionHelpers([{ x: 100, y: 100, w: 80, h: 80 }]);
  assert.deepEqual({ ...game.nearestWalkablePosition('town', 220, 220) }, { x: 220, y: 220 });
});

test('diagonal movement slides along obstacle corners without entering the collider', () => {
  const game = loadPlayerMover([{ x: 100, y: 100, w: 50, h: 50 }]);
  game.keys.add('d');
  game.keys.add('s');
  game.movePlayer(0.3);

  assert.equal(game.state.y, 80, 'vertical movement is blocked at the corner');
  assert.ok(game.state.x > 100, 'horizontal movement remains responsive');
  assert.equal(game.collides(game.state.x, game.state.y), false, 'player remains outside the obstacle');

  game.keys.clear();
  game.keys.add('d');
  game.movePlayer(0.7);
  game.keys.clear();
  game.keys.add('s');
  game.movePlayer(0.3);
  assert.ok(game.state.x > 150 && game.state.y > 80, 'player can walk around the obstacle instead of becoming trapped');
  assert.equal(game.collides(game.state.x, game.state.y), false);
});
