const { readFileSync } = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');

const PLAYER_RADIUS = 13;

function loadWorldGeometry() {
  const window = {};
  vm.runInNewContext(readFileSync(path.join(__dirname, '..', 'world-data.js'), 'utf8'), { window });
  const source = readFileSync(path.join(__dirname, '..', 'game.js'), 'utf8');
  const start = source.indexOf('  const buildings = [');
  const end = source.indexOf('\n  let state = freshState', start);
  assert.notEqual(start, -1, 'town geometry exists');
  assert.notEqual(end, -1, 'town geometry ends before game state');
  const declarations = source.slice(start, end)
    .replace(/const (buildings|townPaths|trees|props|npcs|obstacles) =/g, 'var $1 =');
  const context = vm.createContext({ Math });
  context.WORLD = window.DeutschstadtWorlds.town;
  context.npcCollider = npc => ({ x: npc.x - 14, y: npc.y - 21, w: 28, h: 46 });
  vm.runInContext(declarations, context);
  return { worlds: window.DeutschstadtWorlds, buildings: context.buildings, townPaths: context.townPaths, townObstacles: context.obstacles, marketStalls: context.WORLD.marketStalls, npcs: context.npcs, npcCollider: context.npcCollider };
}

function collidersFor(sceneId, scene, townObstacles, npcCollider) {
  if (sceneId === 'town') return townObstacles;
  return [
    ...(scene.walls || []),
    ...(scene.furniture || []).filter(item => item.solid),
    ...(scene.npcs || []).map(npcCollider)
  ];
}

function reachablePositions(sceneId, scene, obstacles, start) {
  const step = 8;
  const collides = (x, y) => x - PLAYER_RADIUS < 18 || y - PLAYER_RADIUS < 18
    || x + PLAYER_RADIUS > scene.width - 18 || y + PLAYER_RADIUS > scene.height - 18
    || obstacles.some(box => {
      const nearestX = Math.max(box.x, Math.min(x, box.x + box.w));
      const nearestY = Math.max(box.y, Math.min(y, box.y + box.h));
      return (x - nearestX) ** 2 + (y - nearestY) ** 2 < PLAYER_RADIUS ** 2;
    });
  assert.equal(collides(start.x, start.y), false, `${sceneId} spawn is walkable`);
  const queue = [[start.x, start.y]];
  const visited = new Set([`${start.x},${start.y}`]);
  for (let index = 0; index < queue.length; index++) {
    const [x, y] = queue[index];
    for (const [dx, dy] of [[step, 0], [-step, 0], [0, step], [0, -step]]) {
      const nextX = x + dx, nextY = y + dy, key = `${nextX},${nextY}`;
      if (!visited.has(key) && !collides(nextX, nextY)) {
        visited.add(key);
        queue.push([nextX, nextY]);
      }
    }
  }
  return [...visited].map(point => point.split(',').map(Number));
}

function isWalkable(scene, obstacles, point) {
  return point.x - PLAYER_RADIUS >= 18 && point.y - PLAYER_RADIUS >= 18
    && point.x + PLAYER_RADIUS <= scene.width - 18 && point.y + PLAYER_RADIUS <= scene.height - 18
    && !obstacles.some(box => {
      const nearestX = Math.max(box.x, Math.min(point.x, box.x + box.w));
      const nearestY = Math.max(box.y, Math.min(point.y, box.y + box.h));
      return (point.x - nearestX) ** 2 + (point.y - nearestY) ** 2 < PLAYER_RADIUS ** 2;
    });
}

function canReach(positions, target, radius) {
  return positions.some(([x, y]) => Math.hypot(x - target.x, y - target.y) < radius);
}

test('all town entrances are reachable from the normal town spawn', () => {
  const { worlds, townObstacles, npcCollider } = loadWorldGeometry();
  const positions = reachablePositions('town', worlds.town, townObstacles, { x: 800, y: 590 });
  for (const door of worlds.town.doors) {
    assert.ok(canReach(positions, door, door.radius), `${door.id} interaction radius is reachable`);
    const destination = worlds[door.targetSceneId];
    const destinationObstacles = collidersFor(door.targetSceneId, destination, townObstacles, npcCollider);
    assert.ok(isWalkable(destination, destinationObstacles, door.targetPosition), `${door.id} transition spawn is walkable`);
  }
});

test('town building plots clear the arterial roads and entrances align with their visible thresholds', () => {
  const { worlds, buildings, townPaths, townObstacles } = loadWorldGeometry();
  const doors = worlds.town.doors;
  for (const building of buildings) {
    const body = { left: building.x, right: building.x + building.w, top: building.y + 20, bottom: building.y + building.h - 13 };
    assert.ok(body.bottom <= 458 || body.top >= 574, `${building.label} does not overlap the east-west street`);
    assert.ok(body.right <= 752 || body.left >= 848, `${building.label} does not overlap the north-south street`);
    const roofTop = building.y - (building.style === 'house' ? 42 : 50);
    const roofCenter = building.x + building.w / 2;
    assert.equal(isWalkable(worlds.town, townObstacles, { x: roofCenter, y: roofTop + 2 }), true, `${building.label} decorative roof overhang is not a solid collider`);
    assert.equal(isWalkable(worlds.town, townObstacles, { x: building.x + 8, y: building.y + building.h / 2 }), false, `${building.label} façade blocks movement`);
    const reachable = reachablePositions('town', worlds.town, townObstacles, { x: 800, y: 590 });
    for (const point of [
      { x: building.x - 25, y: building.y + building.h / 2 },
      { x: building.x + building.w + 25, y: building.y + building.h / 2 },
      { x: building.x + building.w / 2, y: building.y - 70 },
      { x: building.x + building.w / 2, y: building.y + building.h + 28 }
    ]) assert.ok(canReach(reachable, point, 18), `${building.label} is walkable around at ${point.x},${point.y}`);
  }
  for (const door of doors.filter(candidate => candidate.id.endsWith('-entrance'))) {
    const building = buildings.find(item => item.id === door.id.replace(/-entrance$/, ''));
    assert.ok(building, `${door.id} maps to a visible building`);
    assert.ok(Math.abs(door.x - (building.x + building.w / 2)) <= 1, `${door.id} is centered on its doorway`);
    assert.equal(door.y, building.y + building.h - 38, `${door.id} interaction point aligns with the door threshold`);
    assert.ok(townPaths.some(path => Math.abs(path.x + path.w / 2 - door.x) <= 4 && path.y < door.y + 60 && path.y + path.h >= door.y), `${door.id} has a connected approach path`);
  }
  assert.ok(canReach(reachablePositions('town', worlds.town, townObstacles, { x: 800, y: 590 }), worlds.town.doors.find(door => door.id === 'regional-train-door'), 54), 'the train door can be approached from platform one');
});

test('the main town roads stay walkable through the crossroads', () => {
  const { worlds, townObstacles } = loadWorldGeometry();
  for (let x = 32; x <= worlds.town.width - 32; x += 12) {
    assert.ok(isWalkable(worlds.town, townObstacles, { x, y: 520 }), `east-west road is clear at ${x},520`);
  }
  for (let y = 32; y <= worlds.town.height - 32; y += 12) {
    assert.ok(isWalkable(worlds.town, townObstacles, { x: 800, y }), `north-south road is clear at 800,${y}`);
  }
});

test('the smaller town square sits beside the roads and joins the pedestrian lane', () => {
  const { worlds, townPaths, townObstacles, buildings } = loadWorldGeometry();
  const plazaStart = readFileSync(path.join(__dirname, '..', 'game.js'), 'utf8').indexOf('const plaza = {');
  const source = readFileSync(path.join(__dirname, '..', 'game.js'), 'utf8');
  const plazaMatch = source.slice(plazaStart, plazaStart + 100).match(/const plaza = \{ x: (\d+), y: (\d+), w: (\d+), h: (\d+) \}/);
  assert.ok(plazaMatch, 'town square geometry is defined');
  const [, x, y, w, h] = plazaMatch.map(Number);
  assert.ok(y >= 574, 'plaza does not cover the east-west street');
  assert.ok(x + w <= 752, 'plaza does not cover the north-south street');
  assert.ok(w * h < 400 * 230 / 2, 'plaza is substantially smaller than the former dominant paving');
  assert.ok(townPaths.some(link => link.x + link.w >= x && link.x <= x + w && link.y <= y && link.y + link.h > y), 'pedestrian spur connects the plaza to the crossroads');
  const positions = reachablePositions('town', worlds.town, townObstacles, { x: 800, y: 590 });
  assert.ok(canReach(positions, { x: x + w - 22, y: y + h - 22 }, 14), 'the square remains reachable from the town roads');
  assert.ok(buildings.some(building => building.id === 'supermarket') && worlds.town.marketArea.x > 1157, 'supermarket and outdoor market remain distinct');
});

test('town scene identifiers and all doorway destinations remain valid', () => {
  const { worlds } = loadWorldGeometry();
  assert.deepEqual(Object.keys(worlds).sort(), ['bakery', 'bank', 'cafe', 'rathaus', 'station', 'supermarket', 'town', 'train', 'wohnhaus']);
  for (const door of worlds.town.doors) {
    assert.ok(Object.hasOwn(worlds, door.targetSceneId), `${door.id} has a valid scene destination`);
    assert.ok(door.targetPosition && Number.isFinite(door.targetPosition.x) && Number.isFinite(door.targetPosition.y), `${door.id} has a finite transition position`);
  }
});

test('station forecourt, station room, train carriage, and return paths are walkable', () => {
  const { worlds, buildings, townObstacles, npcCollider } = loadWorldGeometry();
  const townPositions = reachablePositions('town', worlds.town, townObstacles, { x: 800, y: 590 });
  const stationDoor = worlds.town.doors.find(door => door.id === 'station-entrance');
  assert.ok(canReach(townPositions, stationDoor, stationDoor.radius), 'station entrance is reachable from the crossroads');
  const departureBoard = worlds.town.interactables.find(item => item.id === 'platform-departure-board');
  assert.ok(canReach(townPositions, departureBoard, departureBoard.radius), 'exterior departure board is reachable');
  assert.ok(buildings.some(building => building.id === 'station'), 'station facade is registered for rendering and collision');
  assert.ok(isWalkable(worlds.town, townObstacles, { x: 1905, y: 990 }), 'platform-side train entry approach is walkable');
  assert.equal(isWalkable(worlds.town, townObstacles, { x: 1700, y: 1035 }), false, 'track and train bodies prevent walking through the rail corridor');
  assert.ok(isWalkable(worlds.town, townObstacles, { x: 2286, y: 1035 }), 'footbridge leaves a safe crossing over the tracks');
  assert.ok(canReach(townPositions, { x: 2000, y: 1100 }, 24), 'platform two is reachable by using the footbridge');
  const station = worlds.station;
  const stationReachable = reachablePositions('station', station, collidersFor('station', station, townObstacles, npcCollider), station.spawn);
  assert.ok(canReach(stationReachable, station.npcs[0], 67), 'ticket clerk is reachable from station spawn');
  for (const item of station.interactables) assert.ok(canReach(stationReachable, item, item.radius), `${item.id} is reachable`);
  assert.ok(isWalkable(station, collidersFor('station', station, townObstacles, npcCollider), station.doors[0].targetPosition), 'boarding spawn is walkable');
  const train = worlds.train;
  const trainReachable = reachablePositions('train', train, collidersFor('train', train, townObstacles, npcCollider), train.spawn);
  assert.ok(canReach(trainReachable, train.npcs[0], 67), 'ticket inspector is reachable through the aisle');
  assert.ok(isWalkable(station, collidersFor('station', station, townObstacles, npcCollider), train.exit.targetPosition), 'exiting the train returns to the station platform/door area');
  assert.ok(Math.hypot(train.exit.targetPosition.x - station.doors[0].x, train.exit.targetPosition.y - station.doors[0].y) > station.doors[0].radius, 'train exit does not immediately retrigger boarding');
  assert.ok(isWalkable(worlds.town, townObstacles, station.exit.targetPosition), 'station exit returns to the town forecourt');
});

test('Rathaus and Wohnhaus mission NPCs and clue targets are reachable in their interiors', () => {
  const { worlds, townObstacles, npcCollider } = loadWorldGeometry();
  for (const sceneId of ['rathaus', 'wohnhaus']) {
    const scene = worlds[sceneId];
    const obstacles = collidersFor(sceneId, scene, townObstacles, npcCollider);
    const reachable = reachablePositions(sceneId, scene, obstacles, scene.spawn);
    assert.ok(canReach(reachable, scene.npcs[0], 67), `${sceneId} NPC is reachable`);
    for (const item of scene.interactables) assert.ok(canReach(reachable, item, item.radius), `${sceneId} ${item.id} is reachable`);
    assert.ok(isWalkable(worlds.town, townObstacles, scene.exit.targetPosition), `${sceneId} return position is walkable`);
  }
});

test('town NPCs remain reachable after moving the building plots', () => {
  const { worlds, townObstacles } = loadWorldGeometry();
  const positions = reachablePositions('town', worlds.town, townObstacles, { x: 800, y: 590 });
  const source = readFileSync(path.join(__dirname, '..', 'game.js'), 'utf8');
  const npcStart = source.indexOf('  const npcs = [');
  const npcEnd = source.indexOf('\n  const obstacles =', npcStart);
  const npcContext = vm.createContext({});
  vm.runInContext(source.slice(npcStart, npcEnd).replace('const npcs =', 'var npcs ='), npcContext);
  for (const npc of npcContext.npcs) assert.ok(canReach(positions, npc, 67), `${npc.name} interaction range is reachable`);
});

test('Directions guide and each Rathaus route checkpoint are reachable from the normal spawn', () => {
  const { worlds, townObstacles } = loadWorldGeometry();
  const positions = reachablePositions('town', worlds.town, townObstacles, { x: 800, y: 590 });
  const source = readFileSync(path.join(__dirname, '..', 'game.js'), 'utf8');
  const npcStart = source.indexOf('  const npcs = [');
  const npcEnd = source.indexOf('\n  const obstacles =', npcStart);
  const context = vm.createContext({});
  vm.runInContext(source.slice(npcStart, npcEnd).replace('const npcs =', 'var npcs ='), context);
  const guide = context.npcs.find(npc => npc.id === 'theo');
  assert.ok(guide, 'Theo is present as the Directions guide');
  assert.ok(canReach(positions, guide, 67), 'Theo can be approached');
  for (const checkpoint of worlds.town.directionsRoute.checkpoints) {
    assert.ok(canReach(positions, checkpoint, checkpoint.radius), `${checkpoint.nodeId} is walkable from the normal spawn`);
  }
  const rathausDoor = worlds.town.doors.find(door => door.id === 'rathaus-entrance');
  assert.ok(canReach(positions, rathausDoor, rathausDoor.radius), 'the route ends at the existing Rathaus entrance');
});

test('town NPCs do not spawn inside props, stalls, trees, or building colliders', () => {
  const { buildings, npcs, townObstacles, npcCollider } = loadWorldGeometry();
  const npcBoxes = npcs.map(npcCollider);
  const solidWorldObjects = townObstacles.filter(box => !npcBoxes.some(npcBox => npcBox.x === box.x && npcBox.y === box.y && npcBox.w === box.w && npcBox.h === box.h));
  for (const npc of npcs) {
    const character = npcCollider(npc);
    for (const obstacle of solidWorldObjects) {
      const overlaps = character.x < obstacle.x + obstacle.w && character.x + character.w > obstacle.x
        && character.y < obstacle.y + obstacle.h && character.y + character.h > obstacle.y;
      assert.equal(overlaps, false, `${npc.name} does not overlap a solid object`);
    }
    for (const building of buildings) {
      const roofOverdrawsCharacter = npc.x > building.x - 22 && npc.x < building.x + building.w + 22
        && npc.y + 26 < building.y + building.h - 38;
      assert.equal(roofOverdrawsCharacter, false, `${npc.name} is not hidden behind ${building.label}`);
    }
  }
});

test('interior exits and NPCs are reachable from their scene spawns', () => {
  const { worlds, townObstacles, npcCollider } = loadWorldGeometry();
  for (const sceneId of ['cafe', 'bakery', 'bank', 'supermarket']) {
    const scene = worlds[sceneId];
    const obstacles = collidersFor(sceneId, scene, townObstacles, npcCollider);
    const positions = reachablePositions(sceneId, scene, obstacles, scene.spawn);
    assert.ok(canReach(positions, scene.exit, scene.exit.radius), `${sceneId} exit is reachable`);
    assert.ok(isWalkable(worlds.town, townObstacles, scene.exit.targetPosition), `${sceneId} returns to a walkable town position`);
    for (const npc of scene.npcs) {
      assert.ok(canReach(positions, npc, 67), `${npc.name} is reachable in ${sceneId}`);
    }
    for (const item of scene.interactables || []) {
      assert.ok(canReach(positions, item, item.radius), `${item.id} is reachable in ${sceneId}`);
    }
  }
});

test('Wochenmarkt replaces the redundant Market building and remains walkable', () => {
  const { worlds, buildings, townObstacles, marketStalls } = loadWorldGeometry();
  const market = worlds.town.marketArea;
  assert.equal(market.label, 'WOCHENMARKT');
  assert.equal(worlds.town.doors.some(door => door.name === 'Markt'), false, 'no obsolete Market scene entrance remains');
  assert.equal(marketStalls.length, 3, 'market display stalls are defined separately from the modern supermarket');
  const supermarket = buildings.find(building => building.id === 'supermarket');
  assert.ok(market.x > supermarket.x + supermarket.w, 'market courtyard is outside the supermarket footprint');
  const positions = reachablePositions('town', worlds.town, townObstacles, { x: 800, y: 590 });
  assert.ok(canReach(positions, { x: market.x + market.w - 28, y: market.y + 152 }, 12), 'open side and central market court are reachable');
  const stall = marketStalls[0];
  assert.ok(townObstacles.some(box => box.x === stall.x && box.y === stall.y + stall.h * .62), 'stall counter footprint blocks movement');
  assert.ok(!townObstacles.some(box => box.x < market.x + 10 && box.y < market.y + 10 && box.x + box.w > market.x + market.w - 10), 'no old full-building collider seals the market');
});
