(() => {
  'use strict';

  const SAVE_KEY = 'deutschstadt.save.v1';
  const SAVE_VERSION = 5;
  const SPEECH_RATE_KEY = 'deutschstadt.speech-rate.v1';
  const WORLDS = window.DeutschstadtWorlds;
  const WORLD = WORLDS.town;
  const CAFE = WORLDS.cafe;
  const PLAYER_RADIUS = 13;
  const MOVE_SPEED = 190;
  const Learning = window.DeutschstadtLearning;
  const canvas = document.querySelector('#town-canvas');
  let ctx = canvas.getContext('2d');
  const ui = {
    title: document.querySelector('#title-screen'), game: document.querySelector('#game-screen'), nameInput: document.querySelector('#name-input'),
    newGame: document.querySelector('#new-game'), continueGame: document.querySelector('#continue-game'), practiceGerman: document.querySelector('#practice-german'), welcomeIntro: document.querySelector('#welcome-intro'), resetProgress: document.querySelector('#reset-progress'), hudName: document.querySelector('#hud-name'),
    hudLevel: document.querySelector('#hud-level'), hudXp: document.querySelector('#hud-xp'), xpFill: document.querySelector('#xp-fill'), xpProgress: document.querySelector('#xp-progress'),
    pause: document.querySelector('#pause-button'), journal: document.querySelector('#journal-button'), interaction: document.querySelector('#interaction-hint'), interactionAction: document.querySelector('#interaction-action'), nearby: document.querySelector('#nearby-name'),
    dialogue: document.querySelector('#dialogue-box'), dialogueName: document.querySelector('#dialogue-name'), dialogueRole: document.querySelector('#dialogue-role'),
    dialogueGerman: document.querySelector('#dialogue-german'), dialogueEnglish: document.querySelector('#dialogue-english'), dialogueAvatar: document.querySelector('#dialogue-avatar'),
    dialogueClose: document.querySelector('#dialogue-close'), dialogueGreetingCount: document.querySelector('#dialogue-greeting-count'),
    backdrop: document.querySelector('#modal-backdrop'), modalTitle: document.querySelector('#modal-title'), modalContent: document.querySelector('#modal-content'),
    modalClose: document.querySelector('#modal-close'), toast: document.querySelector('#toast'), location: document.querySelector('#location-name'),
    saveStatus: document.querySelector('#save-status'), saveStatusText: document.querySelector('#save-status-text'),
    mission: document.querySelector('#mission-card'), missionTitle: document.querySelector('#mission-title'), missionObjective: document.querySelector('#mission-objective'),
    missionDestination: document.querySelector('#mission-destination'), missionToggle: document.querySelector('#mission-toggle'), missionDetails: document.querySelector('#mission-details'),
    sideMission: document.querySelector('#side-mission-card'), sideMissionTitle: document.querySelector('#side-mission-title'), sideMissionObjective: document.querySelector('#side-mission-objective'), sideMissionDestination: document.querySelector('#side-mission-destination'), sideMissionToggle: document.querySelector('#side-mission-toggle'),
    multiplayerStatus: document.querySelector('#multiplayer-status'), multiplayerConnect: document.querySelector('#multiplayer-connect'), multiplayerMenuButton: document.querySelector('#multiplayer-menu-button')
  };

  const buildings = [
    { id: 'bakery', style: 'bakery', x: 165, y: 145, w: 235, h: 170, color: '#d7ae79', roof: '#994f3c', label: 'BÄCKEREI' },
    { id: 'rathaus', style: 'public', x: 460, y: 118, w: 250, h: 190, color: '#d9c89d', roof: '#52664e', label: 'RATHAUS' },
    { id: 'cafe', style: 'cafe', x: 1110, y: 100, w: 240, h: 175, color: '#c98f69', roof: '#74483c', label: 'CAFÉ AM PLATZ' },
    { id: 'bank', style: 'bank', x: 1290, y: 300, w: 230, h: 140, color: '#c5c4a2', roof: '#435b58', label: 'BANK · STADTBANK' },
    { id: 'station', style: 'public', x: 1655, y: 650, w: 360, h: 195, color: '#d9c89d', roof: '#435b58', label: 'BAHNHOF' },
    { id: 'wohnhaus', style: 'house', x: 185, y: 670, w: 270, h: 180, color: '#d3c6a2', roof: '#4e6656', label: 'WOHNHAUS' },
    { id: 'supermarket', style: 'supermarket', x: 875, y: 670, w: 260, h: 180, color: '#d7c28d', roof: '#546958', label: 'SUPERMARKT' }
  ];
  // Shared town-space geometry: main streets stay broad, while these narrower
  // pedestrian links lead directly to the existing building entrances.
  const townPaths = [
    { x: 246, y: 310, w: 72, h: 158 },       // bakery entrance apron
    { x: 563, y: 308, w: 44, h: 150 },       // Rathaus frontage
    { x: 1199, y: 265, w: 64, h: 193 },      // café entrance apron
    { x: 1369, y: 430, w: 72, h: 100 },      // bank entrance from main street
    { x: 969, y: 574, w: 72, h: 285 },       // Supermarkt entrance
    { x: 468, y: 574, w: 44, h: 96 },        // quiet lane beside the homes
    { x: 468, y: 626, w: 120, h: 40 },
    { x: 284, y: 837, w: 72, h: 128 },     // Wohnhaus entrance approach
    { x: 735, y: 574, w: 44, h: 44 },        // short plaza connection off the main crossing
    { x: 1528, y: 574, w: 44, h: 190 },      // open side of the Wochenmarkt
    { x: 1813, y: 574, w: 44, h: 244 }      // station entrance from the main street
  ];
  const trees = [
    [88, 120], [420, 120], [940, 125], [1510, 130], [90, 620], [1460, 600], [100, 760], [510, 900],
    [930, 900], [1500, 920], [560, 805], [1085, 410], [535, 875], [890, 350], [95, 590]
  ].map(([x, y], i) => ({ x, y, r: i % 4 === 0 ? 30 : 24, shade: i % 2 ? '#557451' : '#64845b' }));
  const props = [
    { x: 615, y: 690, type: 'fountain' }, { x: 558, y: 630, type: 'bench' }, { x: 680, y: 630, type: 'bench' },
    { x: 1485, y: 900, type: 'flower' }, { x: 535, y: 370, type: 'flower' }, { x: 1050, y: 370, type: 'flower' }
  ];
  const npcs = [
    { id: 'marta', name: 'Marta', role: 'Deine Nachbarin', x: 500, y: 420, color: '#b76e58', hair: '#4a342d', greeting: 'Guten Morgen! Schön, dich zu sehen.', translation: 'Good morning! Lovely to see you.', icon: '✿' },
    { id: 'jonas', name: 'Jonas', role: 'Der Gärtner', x: 1170, y: 645, color: '#5c8290', hair: '#57473b', greeting: 'Hallo! Wie gefällt dir unsere Stadt?', translation: 'Hello! How do you like our town?', icon: '❋' },
    { id: 'lena', name: 'Lena', role: 'Die Buchhändlerin', x: 500, y: 740, color: '#a478a1', hair: '#382d38', greeting: 'Guten Tag! Willkommen in Deutschstadt.', translation: 'Good day! Welcome to Deutschstadt.', icon: '✦' },
    { id: 'anna', name: 'Anna', role: 'Deine neue Freundin', x: 700, y: 700, color: '#a478a1', hair: '#382d38', greeting: 'Hallo! Ich heiße Anna. Wie heißt du?', translation: 'Hello! My name is Anna. What is your name?', icon: '✦', conversationId: 'anna-introduction' },
    { id: 'theo', name: 'Theo', role: 'Dein Nachbar', x: 850, y: 620, color: '#71856d', hair: '#4e473d', greeting: 'Hallo, Alex! Entschuldigung, wo ist das Rathaus? Können Sie mir helfen?', translation: 'Hello, Alex! Excuse me, where is the town hall? Can you help me?', icon: '✦', conversationId: 'directions-conversation' },
    { id: 'market-vendor', name: 'Frau Adler', role: 'Die Marktfrau', x: 1510, y: 625, color: '#b66d58', hair: '#574236', greeting: 'Guten Tag! Willkommen auf dem Wochenmarkt.', translation: 'Good day! Welcome to the weekly market.', icon: '✿', conversationId: 'weekly-market' },
    { id: 'station-traveller', name: 'Milan', role: 'Ein Reisender', x: 2085, y: 850, color: '#66818a', hair: '#4e3d35', greeting: 'Der Zug nach Berlin fährt von Gleis eins.', translation: 'The train to Berlin leaves from platform one.', icon: '◈' }
  ];
  const obstacles = [
    ...buildings.flatMap(building => {
      const { x, y, w, h } = building;
      if (['bakery', 'bank', 'supermarket', 'cafe', 'rathaus', 'wohnhaus', 'station'].includes(building.id)) {
        const door = WORLD.doors.find(candidate => candidate.id === `${building.id}-entrance`);
        const doorWidth = building.id === 'cafe' ? 64 : 72;
        const doorLeft = (door?.x ?? x + w / 2) - doorWidth / 2;
        const doorTop = y + h - 74;
        const wallTop = y + 20;
        const wallBottom = y + h + 7;
        return [
          { x, y: wallTop, w, h: doorTop - wallTop },
          { x, y: doorTop, w: doorLeft - x, h: wallBottom - doorTop },
          { x: doorLeft + doorWidth, y: doorTop, w: x + w - (doorLeft + doorWidth), h: wallBottom - doorTop }
        ];
      }
      return [{ x, y: y + 20, w, h: h - 13 }];
    }),
    ...WORLD.marketStalls.filter(stall => stall.solid).map(({ x, y, w, h }) => ({ x, y: y + h * .62, w, h: h * .38 })),
    ...WORLD.stationArea.benches.map(({ x, y }) => ({ x: x - 3, y: y - 8, w: 64, h: 36 })),
    { x: WORLD.stationArea.shelter.x + 8, y: WORLD.stationArea.shelter.y + 13, w: 8, h: 32 },
    { x: WORLD.stationArea.shelter.x + WORLD.stationArea.shelter.w - 16, y: WORLD.stationArea.shelter.y + 13, w: 8, h: 32 },
    // Track beds are solid, with a narrow crossing at the footbridge and an open train-door gap.
    { x: 1580, y: 1005, w: 285, h: 63 }, { x: 1945, y: 1005, w: 315, h: 63 },
    { x: 1580, y: 1140, w: 680, h: 63 }, { x: 2312, y: 935, w: 28, h: 268 },
    { x: 1690, y: 1011, w: 175, h: 52 }, { x: 1945, y: 1011, w: 215, h: 52 },
    ...trees.map(({ x, y, r }) => ({ x: x - r * .55, y: y - r * .45, w: r * 1.1, h: r * .9 })),
    ...npcs.map(npcCollider),
    ...props.flatMap(prop => {
      if (prop.type === 'fountain') return [{ x: prop.x - 52, y: prop.y - 22, w: 104, h: 64 }];
      if (prop.type === 'bench') return [{ x: prop.x - 3, y: prop.y - 8, w: 64, h: 36 }];
      return [];
    })
  ];

  let state = freshState('Alex');
  let townArtLayer = null;
  let supermarketArtLayer = null;
  let multiplayerClient = null;
  let remotePlayers = new Map();
  let remotePlayerId = null;
  let multiplayerRoom = null;
  let multiplayerPanelOpen = false;
  let multiplayerMessage = '';
  let offlineSimulation = false;
  let sessionPersistent = true;
  let developerTestPanelOpen = false;
  let multiplayerConnection = { state: 'disconnected', message: 'Solo play · offline' };
  let mode = 'menu';
  let paused = false;
  let missionMinimized = false;
  let sideMissionMinimized = false;
  let missionHudLayoutKey = '';
  let learningPathDestination = null;
  let contentLevelUpNotice = [];
  let activeNpc = null;
  let nearbyTarget = null;
  let interactionKeyDown = false;
  let keys = new Set();
  let lastFrame = 0;
  let lastSavedAt = 0;
  let dirty = false;
  let toastTimer = 0;
  let largeText = false;
  let activeUtterance = null;
  let speechRate = (() => {
    try { const stored = localStorage.getItem(SPEECH_RATE_KEY); if (stored === null) return 0.85; const value = Number(stored); return Number.isFinite(value) ? clamp(value, 0.65, 1.25) : 0.85; }
    catch { return 0.85; }
  })();

  function freshState(name) {
    return { name: cleanName(name) || 'Alex', sceneId: 'town', x: 800, y: 590, xp: 0, greeted: [], tutorialCompleted: false, learning: Learning.emptyProgress() };
  }

  function cleanName(value) {
    return typeof value === 'string' ? value.trim().replace(/[<>]/g, '').slice(0, 18) : '';
  }

  function readSave() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object' || (Number.isInteger(parsed.version) && parsed.version > SAVE_VERSION) || typeof parsed.x !== 'number' || typeof parsed.y !== 'number' || !Number.isFinite(parsed.x) || !Number.isFinite(parsed.y) || typeof parsed.xp !== 'number' || !Number.isFinite(parsed.xp) || !Array.isArray(parsed.greeted)) return null;
      const allNpcs = [...npcs, ...Object.values(WORLDS).flatMap(registeredScene => registeredScene.npcs || [])];
      const greeted = parsed.greeted.filter(id => allNpcs.some(npc => npc.id === id));
      const sceneId = typeof parsed.sceneId === 'string' && Object.hasOwn(WORLDS, parsed.sceneId) ? parsed.sceneId : 'town';
      const scene = WORLDS[sceneId];
      let x = clamp(parsed.x, PLAYER_RADIUS + 18, scene.width - PLAYER_RADIUS - 18);
      let y = clamp(parsed.y, PLAYER_RADIUS + 18, scene.height - PLAYER_RADIUS - 18);
      if (collidesAt(sceneId, x, y)) ({ x, y } = scene.spawn || { x: 800, y: 590 });
      const learning = Learning.normalizeProgress(parsed.learning, { sceneId, greeted });
      const tutorialCompleted = typeof parsed.tutorialCompleted === 'boolean' ? parsed.tutorialCompleted : Number(parsed.version) >= 2 || learning.lessons['greetings-basics']?.status === 'completed';
      return { name: cleanName(parsed.name) || 'Alex', sceneId, x, y, xp: Learning.normalizeXp(parsed.xp), greeted, tutorialCompleted, learning };
    } catch (error) {
      console.warn('Deutschstadt save could not be read; starting safely.', error);
      return null;
    }
  }

  function hasStoredSave() {
    try { return localStorage.getItem(SAVE_KEY) !== null; }
    catch (error) { console.warn('Deutschstadt save storage is unavailable.', error); return false; }
  }

  function setSaveStatus(state, message) {
    ui.saveStatus.dataset.state = state;
    ui.saveStatusText.textContent = message;
    ui.saveStatus.setAttribute('aria-label', message);
    ui.saveStatus.title = message;
  }

  function saveGame() {
    if (mode !== 'game' || !sessionPersistent) return;
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify({ version: SAVE_VERSION, ...state }));
      dirty = false;
      lastSavedAt = performance.now();
      setSaveStatus('saved', 'Saved on this device');
    } catch (error) {
      console.warn('Deutschstadt could not save progress.', error);
      lastSavedAt = performance.now();
      setSaveStatus('error', 'Save failed — progress may be lost');
    }
  }

  function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
  function markDirty() {
    if (!sessionPersistent) return;
    dirty = true;
    setSaveStatus('saving', 'Saving progress…');
  }

  function refreshMenu() {
    const saved = readSave();
    ui.continueGame.disabled = !saved;
    ui.continueGame.classList.toggle('hidden', !saved);
    ui.resetProgress.classList.toggle('hidden', !hasStoredSave());
    ui.welcomeIntro.classList.toggle('hidden', Boolean(saved?.tutorialCompleted));
  }

  function updateHud() {
    ui.hudName.textContent = state.name;
    const progression = Learning.progressionForXp(state.xp);
    ui.hudLevel.textContent = `LEVEL ${progression.level} · ${progression.rank.toUpperCase()}`;
    ui.hudXp.textContent = `${state.xp} XP`;
    ui.xpFill.style.width = `${progression.progressPercent}%`;
    ui.xpFill.parentElement.setAttribute('aria-valuenow', String(Math.round(progression.progressPercent)));
    ui.xpFill.parentElement.setAttribute('aria-valuemax', '100');
    ui.xpFill.parentElement.setAttribute('aria-valuetext', progression.isMaxLevel
      ? `Maximum level. ${state.xp} total XP. Story chapter continues.`
      : `${state.xp} total XP. ${progression.xpToNext - progression.xpIntoLevel} XP until level ${progression.level + 1}.`);
    ui.xpProgress.textContent = progression.isMaxLevel
      ? 'MAX LEVEL · Chapter continues'
      : `${progression.xpToNext - progression.xpIntoLevel} XP to Level ${progression.level + 1}`;
  }

  function updateMultiplayerStatus({ state: status, message }) {
    if (!ui.multiplayerStatus) return;
    multiplayerConnection = { state: status, message };
    if (offlineSimulation) {
      ui.multiplayerStatus.dataset.state = 'simulation';
      ui.multiplayerStatus.textContent = 'Simulation · local only';
      ui.multiplayerConnect.textContent = 'Multiplayer';
      return;
    }
    if (multiplayerPanelOpen) multiplayerMessage = status === 'connected' && multiplayerRoom ? '' : message;
    ui.multiplayerStatus.dataset.state = status;
    refreshMultiplayerStatusLabel();
    ui.multiplayerConnect.textContent = 'Multiplayer';
    ui.multiplayerConnect.title = 'Create or join a private room';
    if (multiplayerPanelOpen) renderMultiplayerPanel();
  }

  function refreshMultiplayerStatusLabel() {
    if (!ui.multiplayerStatus) return;
    if (offlineSimulation) {
      ui.multiplayerStatus.dataset.state = 'simulation';
      ui.multiplayerStatus.textContent = 'Simulation · local only';
      return;
    }
    const { state: connectionState, message } = multiplayerConnection;
    const displayMessage = message.startsWith('In room ') ? 'Connected · choose a room' : message;
    ui.multiplayerStatus.dataset.state = connectionState;
    ui.multiplayerStatus.textContent = multiplayerRoom && connectionState === 'connected'
      ? `${multiplayerRoom.playerCount}/${multiplayerRoom.maxPlayers} in ${multiplayerRoom.code}`
      : displayMessage;
  }

  function connectMultiplayer() {
    if (!window.DeutschstadtMultiplayer) {
      updateMultiplayerStatus({ state: 'disconnected', message: 'Solo play · multiplayer unavailable' });
      return;
    }
    if (!multiplayerClient) {
      multiplayerClient = window.DeutschstadtMultiplayer.createClient({
        onStatus: updateMultiplayerStatus,
        onPlayers: (players, id) => {
          remotePlayerId = id;
          remotePlayers = new Map(players.filter(player => player.id !== id).map(player => [player.id, player]));
        },
        onRoom: room => { multiplayerRoom = room; refreshMultiplayerStatusLabel(); if (multiplayerPanelOpen) renderMultiplayerPanel(); }
      });
    }
    return multiplayerClient;
  }

  function currentNetworkPlayer() {
    return { name: state.name, sceneId: state.sceneId || 'town', x: state.x, y: state.y };
  }

  function renderMultiplayerPanel() {
    const content = document.createDocumentFragment();
    if (offlineSimulation) {
      content.append(paragraph('OFFLINE SIMULATION — this room exists only in this browser tab. No WebSocket connection is made, and this code cannot connect another browser or device. Your saved journey, quests, XP, and learning progress are not changed.'));
      const roomCard = document.createElement('div'); roomCard.className = 'room-card simulation-room-card';
      roomCard.append(makeTextElement('strong', 'room-code', 'SIM-LOCAL'), makeTextElement('span', 'simulation-label', 'SIMULATION CODE · NOT CONNECTABLE'), makeTextElement('span', 'room-count', remotePlayers.has('simulation-second-player') ? '1 local player + 1 simulated character' : '1 local player · no second character yet'));
      content.append(roomCard);
      const spawn = document.createElement('button'); spawn.type = 'button'; spawn.className = 'modal-action';
      spawn.textContent = remotePlayers.has('simulation-second-player') ? 'Second player spawned' : 'Spawn simulated second player';
      spawn.disabled = remotePlayers.has('simulation-second-player');
      spawn.addEventListener('click', spawnSimulatedSecondPlayer); content.append(spawn);
      const remove = document.createElement('button'); remove.type = 'button'; remove.className = 'modal-action modal-secondary';
      remove.textContent = 'Remove simulated second player'; remove.disabled = !remotePlayers.has('simulation-second-player');
      remove.addEventListener('click', removeSimulatedSecondPlayer); content.append(remove);
      const exit = document.createElement('button'); exit.type = 'button'; exit.className = 'modal-action modal-secondary'; exit.textContent = 'Switch to online rooms';
      exit.addEventListener('click', () => {
        offlineSimulation = false; developerTestPanelOpen = false; remotePlayers.clear();
        updateMultiplayerStatus({ state: 'disconnected', message: 'Online multiplayer · not connected' });
        multiplayerMessage = 'Online rooms use the WebSocket server. This simulation did not connect to anyone.';
        renderMultiplayerPanel();
      });
      content.append(exit);
      const back = document.createElement('button'); back.type = 'button'; back.className = 'text-button multiplayer-back'; back.textContent = '← Back to game';
      back.addEventListener('click', () => { closeModal(); canvas.focus({ preventScroll: true }); }); content.append(back);
      ui.modalTitle.textContent = 'Offline Multiplayer Test';
      ui.modalContent.replaceChildren(content);
      return;
    }
    if (developerTestPanelOpen) {
      content.append(paragraph('Developer-only local rendering test. It creates no network connection, and the displayed simulation code cannot be used by another browser or device.'));
      const simulate = document.createElement('button'); simulate.type = 'button'; simulate.className = 'modal-action simulation-action'; simulate.textContent = 'Start Offline Multiplayer Simulation';
      simulate.addEventListener('click', startOfflineMultiplayerSimulation); content.append(simulate);
      const backToRooms = document.createElement('button'); backToRooms.type = 'button'; backToRooms.className = 'text-button multiplayer-back'; backToRooms.textContent = '← Back to multiplayer';
      backToRooms.addEventListener('click', () => { developerTestPanelOpen = false; renderMultiplayerPanel(); }); content.append(backToRooms);
      ui.modalTitle.textContent = 'Developer Testing';
      ui.modalContent.replaceChildren(content);
      return;
    }
    content.append(paragraph(multiplayerRoom
      ? 'Share this private room code with up to three friends. Only players in the same room and scene are visible.'
      : 'Create a private room or join a friend. Multiplayer is optional; your solo journey and saved progress stay separate.'));
    if (multiplayerRoom) {
      const roomCard = document.createElement('div'); roomCard.className = 'room-card';
      const code = makeTextElement('strong', 'room-code', multiplayerRoom.code);
      const roomCode = multiplayerRoom.code;
      const count = makeTextElement('span', 'room-count', `${multiplayerRoom.playerCount} / ${multiplayerRoom.maxPlayers} players`);
      const connection = makeTextElement('span', 'room-connection', `Connection: ${multiplayerConnection.state === 'connected' ? 'Connected' : multiplayerConnection.message}`);
      const copy = document.createElement('button'); copy.type = 'button'; copy.className = 'modal-action'; copy.textContent = 'Copy room code';
      copy.addEventListener('click', async () => {
        try { await navigator.clipboard.writeText(roomCode); multiplayerMessage = 'Room code copied.'; }
        catch { multiplayerMessage = `Copy unavailable. Share ${roomCode} with your friend.`; }
        renderMultiplayerPanel();
      });
      roomCard.append(code, count, connection, copy); content.append(roomCard);
      const leave = document.createElement('button'); leave.type = 'button'; leave.className = 'modal-action modal-secondary'; leave.textContent = 'Leave Room';
      leave.addEventListener('click', () => { multiplayerClient?.leaveRoom(); multiplayerRoom = null; multiplayerMessage = 'You left the room.'; renderMultiplayerPanel(); });
      content.append(leave);
    } else {
      const create = document.createElement('button'); create.type = 'button'; create.className = 'modal-action'; create.textContent = 'Create Room';
      create.addEventListener('click', () => { prepareMultiplayerGameplay(); multiplayerMessage = 'Connecting to the game server…'; connectMultiplayer()?.createRoom(currentNetworkPlayer()); renderMultiplayerPanel(); });
      content.append(create);
      const form = document.createElement('form'); form.className = 'room-join-form';
      const input = document.createElement('input'); input.type = 'text'; input.maxLength = 8; input.placeholder = 'GER-4821'; input.setAttribute('aria-label', 'Room code'); input.autocomplete = 'off'; input.spellcheck = false;
      const join = document.createElement('button'); join.type = 'submit'; join.className = 'modal-action'; join.textContent = 'Join Room';
      form.append(input, join);
      form.addEventListener('submit', event => {
        event.preventDefault();
        const code = input.value.trim().toUpperCase();
        if (!/^GER-\d{4}$/.test(code)) { multiplayerMessage = 'Enter a room code like GER-4821.'; renderMultiplayerPanel(); return; }
        prepareMultiplayerGameplay();
        multiplayerMessage = `Joining ${code}…`;
        connectMultiplayer()?.joinRoom(code, currentNetworkPlayer()); renderMultiplayerPanel();
      });
      content.append(form);
      const developer = document.createElement('button'); developer.type = 'button'; developer.className = 'text-button multiplayer-back'; developer.textContent = 'Developer testing · offline simulation';
      developer.addEventListener('click', () => { developerTestPanelOpen = true; renderMultiplayerPanel(); }); content.append(developer);
    }
    const back = document.createElement('button'); back.type = 'button'; back.className = 'text-button multiplayer-back'; back.textContent = '← Back';
    back.addEventListener('click', () => { closeModal(); if (mode === 'game') canvas.focus({ preventScroll: true }); });
    content.append(back);
    if (multiplayerMessage) content.append(paragraph(multiplayerMessage));
    ui.modalTitle.textContent = multiplayerRoom ? 'Private Room' : 'Multiplayer';
    ui.modalContent.replaceChildren(content);
  }

  function openMultiplayerPanel() {
    multiplayerPanelOpen = true; developerTestPanelOpen = false; multiplayerMessage = '';
    const content = document.createDocumentFragment();
    openModal('Multiplayer', content);
    renderMultiplayerPanel();
  }

  function prepareMultiplayerGameplay() {
    if (mode === 'game') return;
    const saved = readSave();
    startGame(saved || freshState(cleanName(ui.nameInput.value)), 'direct');
    openMultiplayerPanel();
  }

  function startOfflineMultiplayerSimulation() {
    developerTestPanelOpen = false;
    const saved = readSave();
    offlineSimulation = true;
    sessionPersistent = false;
    multiplayerClient?.disconnect();
    multiplayerRoom = null;
    remotePlayers.clear();
    remotePlayerId = null;
    startGame(saved || freshState(cleanName(ui.nameInput.value)), 'direct', { persist: false });
    ui.multiplayerStatus.dataset.state = 'simulation';
    ui.multiplayerStatus.textContent = 'Simulation · local only';
    openMultiplayerPanel();
  }

  function spawnSimulatedSecondPlayer() {
    const sceneId = state.sceneId || 'town';
    const scene = WORLDS[sceneId] || WORLD;
    const firstTry = nearestWalkablePosition(sceneId, clamp(state.x + 58, PLAYER_RADIUS + 18, scene.width - PLAYER_RADIUS - 18), state.y);
    const secondTry = firstTry || nearestWalkablePosition(sceneId, clamp(state.x - 58, PLAYER_RADIUS + 18, scene.width - PLAYER_RADIUS - 18), state.y);
    const position = secondTry || { x: state.x, y: state.y };
    remotePlayers.set('simulation-second-player', {
      id: 'simulation-second-player', name: 'Simulated Friend · local', sceneId, x: position.x, y: position.y
    });
    renderMultiplayerPanel();
  }

  function removeSimulatedSecondPlayer() {
    remotePlayers.delete('simulation-second-player');
    renderMultiplayerPanel();
  }

  function syncLocalPlayer() {
    multiplayerClient?.updateLocalPlayer({ sceneId: state.sceneId || 'town', x: state.x, y: state.y });
  }

  function startGame(nextState, flow = 'continue', { persist = true } = {}) {
    state = nextState;
    sessionPersistent = persist;
    mode = 'game'; paused = false; activeNpc = null; nearbyTarget = null; keys.clear(); dirty = true;
    activeLessonSession = null; activeConversationSession = null; activeConversationId = null; activeConversationRewardEligible = false; activeReview = null;
    document.body.classList.add('playing');
    ui.title.classList.add('hidden'); ui.game.classList.remove('hidden'); ui.dialogue.classList.add('hidden');
    ui.interaction.classList.add('hidden'); ui.backdrop.classList.add('hidden');
    updateHud(); resizeCanvas(); saveGame(); canvas.focus({ preventScroll: true });
    if (flow === 'new') startLesson('greetings-basics');
    else if (flow === 'practice') openLearningJournal();
  }

  function returnToMenu() {
    multiplayerClient?.disconnect(); remotePlayers.clear(); remotePlayerId = null;
    multiplayerRoom = null; multiplayerPanelOpen = false;
    saveGame(); mode = 'menu'; paused = false; activeNpc = null; keys.clear();
    offlineSimulation = false; sessionPersistent = true; developerTestPanelOpen = false;
    ui.multiplayerStatus.dataset.state = 'disconnected';
    ui.multiplayerStatus.textContent = 'Solo play · offline';
    document.body.classList.remove('playing');
    ui.dialogue.classList.add('hidden'); ui.interaction.classList.add('hidden'); ui.backdrop.classList.add('hidden'); ui.game.classList.add('hidden'); ui.title.classList.remove('hidden');
    refreshMenu();
  }

  function openModal(title, content) {
    keys.clear();
    ui.modalTitle.textContent = title;
    ui.modalContent.replaceChildren(content);
    ui.backdrop.classList.remove('hidden');
    ui.modalClose.focus();
  }
  function closeModal() {
    if (ui.modalTitle.textContent === 'Multiplayer' || ui.modalTitle.textContent === 'Private Room') multiplayerPanelOpen = false;
    ui.backdrop.classList.add('hidden');
  }
  function paragraph(text) { const p = document.createElement('p'); p.className = 'modal-copy'; p.textContent = text; return p; }

  function showHelp() {
    const content = document.createDocumentFragment();
    content.append(paragraph('A new journey begins with a short English-supported lesson. Learn a phrase, see what it means, then practise it before using German with people in town.'));
    content.append(paragraph('Move with WASD or the arrow keys. Walk close to a neighbor and press E to talk. Press Escape to pause or close a conversation. Your position and greetings save automatically in this browser.'));
    const replay = document.createElement('button'); replay.type = 'button'; replay.className = 'modal-action'; replay.textContent = 'Restart beginner tutorial'; replay.addEventListener('click', restartTutorial); content.append(replay);
    openModal('A few things to know', content);
  }

  function showSettings() {
    const content = document.createDocumentFragment();
    const label = document.createElement('label');
    const checkbox = document.createElement('input'); checkbox.type = 'checkbox'; checkbox.checked = largeText;
    checkbox.addEventListener('change', () => { largeText = checkbox.checked; document.body.classList.toggle('large-text', largeText); });
    label.append(checkbox, document.createTextNode('Larger dialogue text'));
    const speedLabel = makeTextElement('label', 'speech-speed-control'); speedLabel.append(document.createTextNode('German speech speed '));
    const speed = document.createElement('input'); speed.type = 'range'; speed.min = '0.65'; speed.max = '1.25'; speed.step = '0.05'; speed.value = String(speechRate); speed.setAttribute('aria-label', 'German speech speed');
    const value = makeTextElement('output', 'speech-speed-value', `${speechRate.toFixed(2)}×`);
    speed.addEventListener('input', () => {
      speechRate = clamp(Number(speed.value), 0.65, 1.25); value.textContent = `${speechRate.toFixed(2)}×`;
      try { localStorage.setItem(SPEECH_RATE_KEY, String(speechRate)); } catch (error) { console.warn('Speech speed preference could not be saved.', error); }
    });
    speedLabel.append(speed, value);
    const replay = document.createElement('button'); replay.type = 'button'; replay.className = 'modal-action'; replay.textContent = 'Replay beginner tutorial'; replay.addEventListener('click', restartTutorial);
    content.append(label, speedLabel, replay, paragraph('Browser-generated German speech can sound different across devices. Pronunciation is optional; you can always continue by reading.'), paragraph('Deutschstadt runs locally and keeps your progress in this browser.'));
    openModal('Settings', content);
  }

  function makeTextElement(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function openLearningJournal() {
    if (mode !== 'game') return;
    const content = document.createDocumentFragment();
    const mission = Learning.currentMission(state.learning);
    content.append(makeTextElement('h3', 'journal-section-heading', 'CONTINUE LEARNING'));
    if (mission) {
      const summary = makeTextElement('div', 'journal-mission-summary');
      summary.append(makeTextElement('strong', '', mission.title), makeTextElement('span', '', `Objective: ${mission.objective}`), makeTextElement('small', '', `Destination: ${mission.destination}`));
      content.append(summary);
      content.append(makeTextElement('h3', 'journal-section-heading', mission.status === 'complete' ? 'CURRENT CHAPTER' : 'CURRENT MISSION'));
      const continueButton = document.createElement('button'); continueButton.type = 'button'; continueButton.className = 'modal-action';
      continueButton.textContent = mission.action === 'lesson' ? `${state.learning.activeLesson?.lessonId === mission.lessonId ? 'Resume' : 'Start'} next activity` : mission.action === 'explore' ? 'Continue exploring' : 'Go to next objective';
      continueButton.disabled = mission.action === 'unavailable';
      continueButton.addEventListener('click', () => {
        if (mission.action === 'lesson') { startLesson(mission.lessonId); return; }
        if (mission.action === 'explore') { closeModal(); return; }
        closeModal();
        showToast(`Next: ${mission.destination}. Follow the gold marker.`);
      });
      content.append(continueButton);
    } else content.append(makeTextElement('p', 'modal-copy', 'You have completed the available learning path. More lessons will be added later.'));
    const sideMissions = Object.keys(window.DeutschstadtLessons.sideMissions).map(id => Learning.sideMissionFor(state.learning, id));
    if (sideMissions.length) {
      content.append(makeTextElement('h3', 'journal-section-heading', 'OPTIONAL SIDE MISSIONS'));
      for (const side of sideMissions) {
        const summary = makeTextElement('div', 'journal-mission-summary');
        const stateLabel = side.status === 'completed' ? 'Complete' : side.status === 'locked' ? 'Locked' : side.status === 'in-progress' ? 'In progress' : 'Available';
        summary.append(makeTextElement('strong', '', `${side.title} · ${stateLabel}`));
        summary.append(makeTextElement('span', '', `${side.objective} Destination: ${side.destination}.`));
        content.append(summary);
      }
    }
    content.append(makeTextElement('h3', 'journal-section-heading', 'LEARNING PATH'));
    const list = makeTextElement('div', 'unit-list');
    let visibleUnitNumber = 0;
    for (const unit of Learning.journalUnitsFor(state.learning)) {
      visibleUnitNumber += 1;
      const row = makeTextElement('div', `unit-row${unit.status === 'available' ? ' unit-available' : ''}`);
      const number = makeTextElement('span', 'unit-number', String(visibleUnitNumber).padStart(2, '0'));
      const info = makeTextElement('div', 'unit-info');
      info.append(makeTextElement('strong', '', unit.title));
      let statusText;
      if (unit.id === 'numbers' && unit.status === 'available') statusText = 'Story activity · visit Herr Weber in the Supermarkt';
      else if (unit.id === 'shopping' && unit.status === 'completed') statusText = 'Completed · practice again with Herr Weber in the Supermarkt';
      else if (unit.id === 'shopping' && unit.status !== 'locked') statusText = unit.hasSavedCheckpoint ? 'In progress · continue with Herr Weber in the Supermarkt' : 'Ready · speak with Herr Weber in the Supermarkt';
      else if (unit.id === 'directions' && unit.status === 'completed') statusText = 'Completed · practise again with Theo at the crossroads';
      else if (unit.id === 'directions' && unit.status !== 'locked') statusText = unit.hasSavedCheckpoint ? 'In progress · resume with Theo at the crossroads' : 'Ready · speak with Theo at the crossroads';
      else if (unit.id === 'station' && unit.status === 'completed') statusText = 'Completed · practise again with Frau Krüger in the Bahnhof';
      else if (unit.id === 'station' && unit.status !== 'locked') statusText = unit.hasSavedCheckpoint ? 'In progress · resume with Frau Krüger in the Bahnhof' : 'Ready · talk to Frau Krüger in the Bahnhof';
      else if (unit.id === 'cafe' && unit.status !== 'locked') {
        statusText = unit.status === 'completed' ? 'Completed · revisit Greta to practise again' : 'Visit Greta in the café to start or resume';
      } else if (unit.status === 'completed') statusText = 'Completed · available to practise again';
      else if (unit.status === 'available') statusText = unit.hasSavedCheckpoint ? 'In progress · resume below' : 'Ready to play';
      else statusText = unit.lockedReason || 'Coming later';
      info.append(makeTextElement('span', '', statusText));
      row.append(number, info, makeTextElement('span', 'unit-state', unit.status === 'completed' ? '✓' : unit.status === 'available' ? '→' : '· · ·'));
      if (unit.id === 'station' && unit.status !== 'locked') {
        const route = document.createElement('button'); route.type = 'button'; route.className = 'journal-route-button';
        route.textContent = unit.status === 'completed' ? 'Practice' : unit.hasSavedCheckpoint ? 'Resume' : 'Go to Bahnhof';
        route.setAttribute('aria-label', `${route.textContent} lesson at the train station`);
        route.addEventListener('click', () => {
          learningPathDestination = 'station'; closeModal();
          showToast('Follow the gold marker to the Bahnhof, then speak with Frau Krüger.');
        });
        row.append(route);
      }
      list.append(row);
    }
    content.append(list);

    content.append(makeTextElement('h3', 'journal-section-heading', 'COMPLETED LESSONS · OPTIONAL REVISION'));
    for (const lessonId of ['greetings-basics', 'numbers-prices', 'bakery-order', 'bank-basics']) {
      const lesson = window.DeutschstadtLessons.lessons[lessonId];
      const lessonProgress = state.learning.lessons[lessonId];
      if (lessonProgress.status !== 'completed') continue;
      const active = state.learning.activeLesson?.lessonId === lessonId;
      const start = document.createElement('button'); start.type = 'button'; start.className = 'modal-action lesson-start';
      start.textContent = `${active ? 'Resume' : 'Practice again'} · ${lesson.title}${lesson.rewardXp ? ` · ${lesson.rewardXp} XP once` : ''}`;
      start.disabled = Boolean(state.learning.activeLesson && !active);
      start.addEventListener('click', () => startLesson(lessonId));
      content.append(start);
    }
    if (state.learning.lessons['cafe-conversation'].status === 'completed') {
      const reviseCafe = document.createElement('button'); reviseCafe.type = 'button'; reviseCafe.className = 'modal-action lesson-start'; reviseCafe.textContent = 'Practice again · A conversation at the café';
      reviseCafe.addEventListener('click', () => { closeModal(); showToast('Enter the café and talk to Greta to practise again.'); });
      content.append(reviseCafe);
    }
    if (state.learning.lessons['shopping-basics'].status === 'completed') {
      const reviseShopping = document.createElement('button'); reviseShopping.type = 'button'; reviseShopping.className = 'modal-action lesson-start'; reviseShopping.textContent = 'Practice again · Shopping at the Supermarkt';
      reviseShopping.addEventListener('click', () => { closeModal(); showToast('Enter the Supermarkt and talk to Herr Weber to practise again.'); });
      content.append(reviseShopping);
    }
    if (state.learning.lessons['directions-basics'].status === 'completed') {
      const reviseDirections = document.createElement('button'); reviseDirections.type = 'button'; reviseDirections.className = 'modal-action lesson-start'; reviseDirections.textContent = 'Practice again · Finding the Rathaus';
      reviseDirections.addEventListener('click', () => { closeModal(); showToast('Talk to Theo at the crossroads to practise directions again.'); });
      content.append(reviseDirections);
    }
    content.append(makeTextElement('p', 'reward-note', 'Practice rewards are one-time. Replaying still updates your vocabulary review history.'));

    const learned = Object.values(state.learning.vocabulary).filter(word => word.correct + word.incorrect > 0);
    if (learned.length) {
      content.append(makeTextElement('h3', 'vocabulary-heading', 'Words to revisit'));
      const words = makeTextElement('div', 'vocabulary-list');
      for (const word of learned) {
        const row = makeTextElement('div', 'vocabulary-row');
        row.append(makeTextElement('strong', '', word.german), makeTextElement('span', '', word.english));
        const due = word.nextReviewAt ? new Date(word.nextReviewAt).toLocaleDateString() : 'Not scheduled';
        const topic = word.topic || window.DeutschstadtLessons.lessons[word.lessonId]?.title || 'German basics';
        const answered = word.hasAnsweredCorrectly ? 'answered correctly before' : 'not yet correct';
        row.append(makeTextElement('small', '', `${topic} · ${answered} · ${word.status} · next review ${due} · ${word.correct} right / ${word.incorrect} missed`));
        words.append(row);
      }
      content.append(words);
    }
    if (learned.length) {
      const review = document.createElement('button'); review.type = 'button'; review.className = 'modal-action lesson-start'; review.textContent = `Review ${learned.length} learned words (mistakes first)`;
      review.addEventListener('click', startVocabularyReview); content.append(review);
    }
    openModal('Learning journal', content);
  }

  let activeLessonSession = null;

  function lessonLockFor(lessonId) {
    if (!lessonId) return null;
    return Learning.unitsFor(state.learning).find(unit => unit.lessonId === lessonId && unit.status === 'locked') || null;
  }

  function lessonForNpc(npc) {
    if (npc.lessonId) return npc.lessonId;
    return npc.conversationId ? window.DeutschstadtLessons.conversations[npc.conversationId]?.lessonId || null : null;
  }

  function nextCourseStepMessage(targetLessonId) {
    const targetIndex = window.DeutschstadtLessons.units.findIndex(unit => unit.lessonId === targetLessonId);
    if (targetIndex < 0) return null;
    for (const unit of window.DeutschstadtLessons.units.slice(0, targetIndex)) {
      if (!unit.lessonId || state.learning.lessons[unit.lessonId]?.status === 'completed') continue;
      const lesson = window.DeutschstadtLessons.lessons[unit.lessonId];
      if (unit.locationId === 'supermarket') return 'Visit the Supermarkt and finish the shopping activity first.';
      if (state.learning.activeLesson?.lessonId === unit.lessonId) return `Resume “${lesson.title}” in the Learning Journal first.`;
      const pendingConversation = Object.values(window.DeutschstadtLessons.conversations).find(conversation => conversation.lessonId === unit.lessonId && state.learning.conversations[conversation.id]?.status === 'in-progress');
      if (pendingConversation) return `Continue your conversation with ${pendingConversation.displayName || pendingConversation.id} to finish “${lesson.title}”.`;
      if (unit.id === 'cafe') return 'Visit Greta in the café and finish her conversation first.';
      return `Complete “${lesson.title}” in the Learning Journal first.`;
    }
    return null;
  }

  function startLesson(lessonId, restart = false) {
    const lesson = window.DeutschstadtLessons.lessons[lessonId];
    if (!lesson) { showToast('That lesson is not available.'); return; }
    if (!Array.isArray(lesson.exercises) || !lesson.exercises.length) { showToast('This activity starts with its character in town.'); return; }
    const progress = state.learning.lessons[lessonId];
    if (lessonId === 'numbers-prices' && progress.status !== 'completed') { showToast('Complete the Numbers & Prices story activity with Herr Weber first.'); return; }
    const savedSession = state.learning.activeLesson;
    if (savedSession && savedSession.lessonId !== lessonId) { showToast('Resume your current lesson before starting another.'); return; }
    const resume = savedSession?.lessonId === lessonId && !restart;
    const lockedUnit = lessonLockFor(lessonId);
    if (lockedUnit) { showToast(nextCourseStepMessage(lessonId) || lockedUnit.lockedReason); return; }
    closeDialogue();
    if (!resume) {
      progress.attempts++;
      if (progress.status !== 'completed') progress.status = 'in-progress';
      state.learning.activeLesson = { lessonId, exerciseIndex: 0, correctAnswers: 0 };
    }
    const checkpoint = state.learning.activeLesson;
    activeLessonSession = Learning.createSession(lessonId, checkpoint.exerciseIndex, checkpoint.correctAnswers);
    saveGame();
    renderLessonExercise();
  }

  function renderLessonExercise() {
    const lesson = activeLessonSession.lesson;
    const exercise = activeLessonSession.exercise;
    const index = activeLessonSession.index;
    const content = document.createDocumentFragment();
    const top = makeTextElement('div', 'lesson-topline');
    const supportLevel = exercise.supportLevel || (index === 0 ? 'guided' : 'supported');
    top.append(makeTextElement('span', '', `${lesson.title.toUpperCase()} · ${index + 1} / ${lesson.exercises.length}`), makeTextElement('span', 'support-badge', supportLevel.toUpperCase()), makeTextElement('span', '', `+${lesson.rewardXp} XP · ONCE`));
    content.append(top, makeTextElement('h3', 'lesson-title', lesson.title));
    if (index === 0 && lesson.introduction) {
      content.append(makeTextElement('p', 'lesson-introduction', lesson.introduction));
      if (lesson.objectives?.length) {
        const goals = makeTextElement('ul', 'lesson-goals');
        for (const objective of lesson.objectives) goals.append(makeTextElement('li', '', objective));
        content.append(goals);
      }
    }
    const vocabulary = (exercise.vocabularyIds || []).map(id => window.DeutschstadtLessons.vocabulary[id]).filter(Boolean);
    const teachingData = exercise.teaching || (vocabulary.length ? {
      german: vocabulary.map(word => word.german).join(' · '),
      english: vocabulary.map(word => word.english).join(' · '),
      explanation: vocabulary.map(word => word.example ? `${word.german}: ${word.example}` : `${word.german} means ${word.english}`).join(' ')
    } : null);
    if (teachingData) {
      const teachingCard = makeTextElement('div', 'lesson-teaching');
      teachingCard.append(makeTextElement('strong', '', teachingData.german), makeTextElement('span', '', teachingData.english), makeTextElement('small', '', teachingData.explanation));
      teachingCard.append(pronunciationButton(teachingData.german, '▶  Hear German'));
      if (supportLevel === 'independent') {
        const help = document.createElement('details'); help.className = 'exercise-support';
        help.append(makeTextElement('summary', '', 'Need to review the phrase?'), teachingCard); content.append(help);
      } else content.append(teachingCard);
    }
    content.append(makeTextElement('p', 'exercise-instruction', exercise.instruction));
    const defaultExamples = {
      'multiple-choice': 'Example: read the German phrase, then compare the English meanings under the choices.',
      'de-en': 'Example: “Guten Tag” means “Good day.” Type the English meaning.',
      'en-de': 'Example: “Good day” becomes “Guten Tag.” Type the German words.',
      'fill-blank': 'Example: Ich ___ Anna. → Ich heiße Anna. Choose the missing German word.',
      'sentence-build': 'Example: tap the word cards in the order you would say them. Start with the first word of the sentence.',
      'listening': 'Example: replay the German audio, then choose the matching English meaning.',
      'npc-choice': 'Example: answer the question the character just asked; use its English translation to help.'
    };
    const example = exercise.example || defaultExamples[exercise.type];
    if (example) {
      const details = document.createElement('details'); details.className = 'exercise-support';
      details.append(makeTextElement('summary', '', 'Show a worked example'), makeTextElement('p', '', example)); content.append(details);
    }
    const hint = document.createElement('details'); hint.className = 'exercise-support exercise-hint';
    hint.append(makeTextElement('summary', '', 'Need a hint?'), makeTextElement('p', '', exercise.hint || exercise.feedbackIncorrect || 'Read the English meaning and vocabulary above once more.')); content.append(hint);
    if (exercise.speaker) content.append(makeTextElement('p', 'exercise-speaker', exercise.speaker));
    content.append(makeTextElement('p', 'exercise-prompt', exercise.prompt));

    if (exercise.type === 'listening') {
      const listen = document.createElement('button'); listen.type = 'button'; listen.className = 'listen-button'; listen.textContent = '▶  Listen in German';
      const canSpeak = canSpeakGerman();
      if (canSpeak) listen.addEventListener('click', () => speakGerman(exercise.audioText));
      else { listen.disabled = true; listen.textContent = 'German audio unavailable'; content.append(makeTextElement('p', 'audio-fallback', 'You can still use the taught phrase and English meaning to answer.')); }
      content.append(listen);
    }

    if (exercise.options) {
      const options = makeTextElement('div', 'exercise-options');
      for (const option of exercise.options) {
        const button = document.createElement('button'); button.type = 'button'; button.className = 'exercise-option';
        button.append(makeTextElement('span', '', option.text));
        if (option.translation) button.append(makeTextElement('small', '', option.translation));
        button.addEventListener('click', () => submitLessonAnswer(option.id));
        options.append(button);
      }
      content.append(options);
    } else if (exercise.type === 'sentence-build') {
      const assembled = makeTextElement('div', 'sentence-assembled', 'Choose the words in order');
      const tokenRow = makeTextElement('div', 'sentence-tokens');
      const selected = [];
      const check = document.createElement('button'); check.type = 'button'; check.className = 'modal-action'; check.textContent = 'Check sentence'; check.disabled = true;
      const refresh = () => {
        assembled.textContent = selected.length ? selected.map(tokenIndex => exercise.tokens[tokenIndex]).join(' ') : 'Choose the words in order';
        check.disabled = selected.length !== exercise.tokens.length;
      };
      exercise.tokens.forEach((token, tokenIndex) => {
        const chip = document.createElement('button'); chip.type = 'button'; chip.className = 'word-chip'; chip.textContent = token;
        chip.addEventListener('click', () => { if (!selected.includes(tokenIndex)) selected.push(tokenIndex); chip.disabled = true; refresh(); });
        tokenRow.append(chip);
      });
      check.addEventListener('click', () => submitLessonAnswer(selected.map(tokenIndex => exercise.tokens[tokenIndex]).join(' ')));
      content.append(assembled, tokenRow, check);
    } else {
      const form = document.createElement('form'); form.className = 'translation-form';
      const input = document.createElement('input'); input.type = 'text'; input.autocomplete = 'off'; input.maxLength = 100;
      const isEnglishToGerman = exercise.type === 'en-de';
      input.setAttribute('aria-label', isEnglishToGerman ? 'German response' : 'English translation');
      input.placeholder = isEnglishToGerman ? 'Write the German phrase' : 'Write the English meaning';
      const submit = document.createElement('button'); submit.type = 'submit'; submit.className = 'modal-action'; submit.textContent = 'Check answer';
      form.addEventListener('submit', event => { event.preventDefault(); submitLessonAnswer(input.value); });
      form.append(input, submit); content.append(form);
    }
    ui.modalTitle.textContent = lesson.title; ui.modalContent.replaceChildren(content); ui.backdrop.classList.remove('hidden');
  }

  function submitLessonAnswer(response) {
    if (!activeLessonSession) return;
    const result = activeLessonSession.submit(response);
    if (!result) return;
    Learning.recordAnswer(state.learning, result.exercise, result.correct);
    const lessonId = activeLessonSession.lesson.id;
    const progress = state.learning.lessons[lessonId];
    progress.correctAnswers = activeLessonSession.score;
    const isFinal = result.correct && activeLessonSession.index === activeLessonSession.lesson.exercises.length - 1;
    let reward = 0;
    if (isFinal) {
      const wasCompleted = progress.status === 'completed';
      progress.status = 'completed'; progress.completedAt = new Date().toISOString();
      if (lessonId === 'greetings-basics') state.tutorialCompleted = true;
      state.learning.activeLesson = null;
      const award = wasCompleted ? { reward: 0, levelUps: [] } : awardLearningXp(lessonId, activeLessonSession.lesson.rewardXp);
      reward = award.reward;
      if (lessonId === 'bank-basics') setBankObjective('vocabularyComplete');
    } else {
      state.learning.activeLesson = { lessonId, exerciseIndex: activeLessonSession.index + (result.correct ? 1 : 0), correctAnswers: activeLessonSession.score };
    }
    saveGame();
    renderLessonFeedback(result, isFinal, reward);
  }

  function awardLearningXp(lessonId, reward) {
    if (offlineSimulation || !Learning.claimReward(state.learning, lessonId)) return { reward: 0, levelUps: [] };
    const previousXp = state.xp;
    state.xp += reward;
    const levelUps = Learning.levelUpsBetween(previousXp, state.xp);
    contentLevelUpNotice.push(...levelUps);
    updateHud();
    return { reward, levelUps };
  }

  function setSideMissionObjective(missionId, objectiveId) {
    const definition = window.DeutschstadtLessons.sideMissions[missionId];
    if (!definition?.requiredObjectives?.includes(objectiveId)) return false;
    if (!Learning.completeSideMissionObjective(state.learning, missionId, objectiveId)) return false;
    completeSideMissionIfReady(missionId);
    markDirty(); saveGame(); updateMissionCard();
    return true;
  }

  function completeSideMissionIfReady(missionId) {
    const definition = window.DeutschstadtLessons.sideMissions[missionId];
    if (!definition?.requiredObjectives?.length) return null;
    const mission = state.learning.sideMissions[missionId];
    if (!mission || mission.status === 'completed') return null;
    const allComplete = definition.requiredObjectives.every(id => id === 'conversation'
      ? state.learning.conversations[definition.conversationId]?.status === 'completed'
      : mission.objectives[id] === true);
    if (!allComplete) return null;
    mission.status = 'completed';
    mission.completedAt = new Date().toISOString();
    const award = awardLearningXp(missionId, definition.rewardXp || 0);
    showToast(award.reward ? `${definition.title} complete · +${award.reward} XP` : `${definition.title} complete.`);
    return award;
  }

  function setBankObjective(objectiveId) {
    const mission = state.learning.missions.bankVisit;
    if (!Object.hasOwn(mission.objectives, objectiveId) || mission.objectives[objectiveId]) return;
    mission.objectives[objectiveId] = true;
    markDirty();
    completeBankMissionIfReady();
    saveGame();
  }

  function completeBankMissionIfReady() {
    const mission = state.learning.missions.bankVisit;
    if (mission.completed || Object.values(mission.objectives).some(done => !done)) return false;
    mission.completed = true;
    mission.completedAt = new Date().toISOString();
    const award = awardLearningXp('bank-visit', 50);
    const levelMessage = formatLevelUpMessage(award.levelUps);
    showToast(levelMessage || `Mein erster Bankbesuch complete · +${award.reward} XP`);
    markDirty();
    return true;
  }

  function formatLevelUpMessage(levelUps) {
    if (!levelUps?.length) return '';
    return `Level up! ${levelUps.map(level => `Level ${level.level} · ${level.rank}`).join(' → ')}`;
  }

  function appendPendingLevelUpNotice(content) {
    if (!contentLevelUpNotice.length) return;
    content.append(makeTextElement('p', 'level-up-notice', formatLevelUpMessage(contentLevelUpNotice)));
    contentLevelUpNotice = [];
  }

  function renderLessonFeedback(result, isFinal, reward) {
    const content = document.createDocumentFragment();
    content.append(makeTextElement('p', result.correct ? 'answer-result correct' : 'answer-result incorrect', result.correct ? 'Richtig!' : 'Noch einmal üben'));
    content.append(makeTextElement('p', 'modal-copy', result.feedback));
    appendPendingLevelUpNotice(content);
    if (!result.correct) {
      const exercise = result.exercise;
      const answer = exercise.type === 'sentence-build' ? exercise.answer : exercise.acceptedAnswers?.[0] || exercise.options?.find(option => option.id === exercise.answer)?.text;
      if (answer) content.append(makeTextElement('p', 'answer-reveal', `A helpful answer: ${answer}`));
    }
    if (isFinal) {
      const rewardNote = activeLessonSession.lesson.rewardXp ? (reward ? ` · +${reward} XP` : ' · reward already claimed') : '';
      content.append(makeTextElement('p', 'lesson-score', `Lesson complete · ${activeLessonSession.score} of ${activeLessonSession.lesson.exercises.length} answers correct${rewardNote}.`));
      if (activeLessonSession.lesson.id === 'bank-basics' && state.learning.missions.bankVisit.completed) content.append(makeTextElement('p', 'answer-result correct', 'Mein erster Bankbesuch is complete. Its one-time 50 XP reward is saved.'));
      content.append(makeTextElement('p', 'modal-copy', 'Your words are saved for review. They stay in learning or review status until you have practiced them over time.'));
      const currentUnit = window.DeutschstadtLessons.units.find(unit => unit.lessonId === activeLessonSession.lesson.id);
      const nextUnit = currentUnit && Learning.unitsFor(state.learning).find(unit => unit.order > window.DeutschstadtLessons.units.indexOf(currentUnit) + 1 && unit.id !== 'review' && unit.status === 'available');
      if (nextUnit) content.append(makeTextElement('p', 'lesson-next-step', `Next in your learning path: ${nextUnit.title}.`));
      const button = document.createElement('button'); button.type = 'button'; button.className = 'modal-action'; button.textContent = 'Back to learning journal'; button.addEventListener('click', () => { activeLessonSession = null; openLearningJournal(); }); content.append(button);
      activeLessonSession = null;
    } else if (!result.correct) {
      const retry = document.createElement('button'); retry.type = 'button'; retry.className = 'modal-action'; retry.textContent = 'Try this question again';
      retry.addEventListener('click', () => { activeLessonSession.retry(); renderLessonExercise(); }); content.append(retry);
    } else {
      const next = document.createElement('button'); next.type = 'button'; next.className = 'modal-action'; next.textContent = 'Continue lesson →';
      next.addEventListener('click', () => { activeLessonSession.next(); renderLessonExercise(); }); content.append(next);
    }
    ui.modalContent.replaceChildren(content);
  }

  let activeReview = null;

  function startVocabularyReview() {
    const queue = Learning.reviewQueue(state.learning);
    if (!queue.length) { showToast('Complete a few lesson questions to unlock word review.'); return; }
    activeReview = { queue, index: 0 };
    renderReviewQuestion();
  }

  function renderReviewQuestion() {
    if (!activeReview) return;
    const word = activeReview.queue[activeReview.index];
    if (!word) { activeReview = null; openLearningJournal(); return; }
    const content = document.createDocumentFragment();
    const ordinal = activeReview.index + 1;
    content.append(makeTextElement('p', 'lesson-topline', `WORD REVIEW · ${ordinal} / ${activeReview.queue.length}`));
    content.append(makeTextElement('p', 'exercise-instruction', 'Translate this meaning into German. Accent marks are accepted where the phrase remains clear.'));
    content.append(makeTextElement('p', 'exercise-prompt', word.english));
    if (word.example) content.append(makeTextElement('p', 'review-example', `Example: ${word.example}`));
    const form = document.createElement('form'); form.className = 'translation-form';
    const input = document.createElement('input'); input.type = 'text'; input.autocomplete = 'off'; input.maxLength = 100; input.placeholder = 'German phrase'; input.setAttribute('aria-label', 'German translation');
    const submit = document.createElement('button'); submit.type = 'submit'; submit.className = 'modal-action'; submit.textContent = 'Check answer';
    form.addEventListener('submit', event => {
      event.preventDefault();
      const exercise = { type: 'en-de', acceptedAnswers: [word.german], vocabularyIds: [word.id] };
      const correct = Learning.evaluate(exercise, input.value);
      Learning.recordAnswer(state.learning, exercise, correct);
      saveGame();
      const feedback = document.createDocumentFragment();
      feedback.append(makeTextElement('p', correct ? 'answer-result correct' : 'answer-result incorrect', correct ? 'Richtig!' : 'Try again'));
      feedback.append(makeTextElement('p', 'modal-copy', correct ? `Yes — “${word.german}” means “${word.english}”.` : `Hint: The German phrase is “${word.german}”. Read it aloud or replay it, then try typing it.`));
      if (!correct) {
        feedback.append(pronunciationButton(word.german, '▶  Hear the answer'));
        const retry = document.createElement('button'); retry.type = 'button'; retry.className = 'modal-action'; retry.textContent = 'Try again'; retry.addEventListener('click', renderReviewQuestion); feedback.append(retry);
      } else {
        const next = document.createElement('button'); next.type = 'button'; next.className = 'modal-action';
        next.textContent = ordinal === activeReview.queue.length ? 'Finish review' : 'Next word →';
        next.addEventListener('click', () => { activeReview.index++; renderReviewQuestion(); }); feedback.append(next);
      }
      ui.modalContent.replaceChildren(feedback);
    });
    form.append(input, submit); content.append(form);
    ui.modalTitle.textContent = 'Review learned words'; ui.modalContent.replaceChildren(content); ui.backdrop.classList.remove('hidden');
  }

  function confirmAction(title, message, actionLabel, action) {
    const content = document.createDocumentFragment();
    content.append(paragraph(message));
    const confirm = document.createElement('button'); confirm.type = 'button'; confirm.className = 'modal-action'; confirm.textContent = actionLabel;
    const cancel = document.createElement('button'); cancel.type = 'button'; cancel.className = 'modal-action'; cancel.style.marginLeft = '8px'; cancel.textContent = 'Cancel';
    confirm.addEventListener('click', () => { closeModal(); action(); });
    cancel.addEventListener('click', closeModal);
    content.append(confirm, cancel); openModal(title, content); cancel.focus();
  }

  function requestNewGame() {
    const begin = () => startGame(freshState(cleanName(ui.nameInput.value)), 'new');
    if (!hasStoredSave()) { begin(); return; }
    confirmAction('Start a new journey?', 'This will replace the saved journey on this device, including its position and XP.', 'Start New Game', begin);
  }

  function restartTutorial() {
    if (mode !== 'game') {
      const saved = readSave() || freshState(cleanName(ui.nameInput.value));
      if (saved.learning.activeLesson && saved.learning.activeLesson.lessonId !== 'greetings-basics') { showToast('Finish your current lesson before restarting the tutorial.'); return; }
      startGame(saved, 'direct');
    }
    const checkpoint = state.learning.activeLesson;
    if (checkpoint && checkpoint.lessonId !== 'greetings-basics') { showToast('Finish your current lesson before restarting the tutorial.'); return; }
    closeModal();
    startLesson('greetings-basics', true);
  }

  function requestResetProgress() {
    if (!hasStoredSave()) { refreshMenu(); return; }
    confirmAction('Reset progress?', 'This permanently removes the saved journey from this browser. This cannot be undone.', 'Reset Progress', () => {
      try { localStorage.removeItem(SAVE_KEY); }
      catch (error) { console.warn('Deutschstadt could not reset saved progress.', error); showToast('Could not reset progress on this device.'); }
      refreshMenu();
    });
  }

  function setDialogue(npc) {
    activeNpc = npc; nearbyTarget = null; keys.clear();
    ui.dialogueName.textContent = npc.name; ui.dialogueRole.textContent = npc.role;
    ui.dialogueGerman.textContent = npc.greeting; ui.dialogueEnglish.textContent = npc.translation; ui.dialogueAvatar.textContent = npc.icon;
    const firstGreeting = !state.greeted.includes(npc.id);
    ui.dialogueGreetingCount.textContent = firstGreeting ? 'GUTEN TAG' : 'WILLKOMMEN';
    const lockedUnit = lessonLockFor(lessonForNpc(npc));
    if (lockedUnit) {
      const prerequisite = window.DeutschstadtLessons.lessons[lockedUnit.requiresLessonId];
      ui.dialogueClose.textContent = prerequisite ? `Finish ${prerequisite.title} first →` : 'Coming later';
    }
    else if (npc.conversationId === 'anna-introduction' && state.learning.lessons['greetings-basics'].status !== 'completed') ui.dialogueClose.textContent = 'Learn greetings first →';
    else {
      const conversationId = conversationForNpc(npc);
      ui.dialogueClose.textContent = npc.lessonId ? `Start ${window.DeutschstadtLessons.lessons[npc.lessonId]?.title || 'lesson'} →` : npc.preparationId ? `Practise ${npc.preparationId} phrases →` : conversationId === 'cafe-waiter' ? 'Practise café phrases →' : conversationId === 'directions-conversation' ? 'Start / resume Directions →' : conversationId ? `Continue ${conversationId === 'shopping-conversation' ? 'Shopping lesson' : 'conversation'} →` : 'Weiter →';
    }
    ui.dialogue.classList.remove('hidden'); ui.interaction.classList.add('hidden');
    ui.dialogueClose.focus({ preventScroll: true });
    if (firstGreeting) {
      state.greeted.push(npc.id); markDirty(); saveGame();
    }
  }

  function closeDialogue() { activeNpc = null; ui.dialogue.classList.add('hidden'); }

  function conversationForNpc(npc) {
    if (npc?.id === 'shopkeeper' && Learning.unitsFor(state.learning).some(unit => unit.id === 'shopping' && unit.status !== 'locked')) return 'shopping-conversation';
    return npc?.conversationId || null;
  }

  function activateDialogueAction() {
    if (activeNpc) {
      const lessonId = lessonForNpc(activeNpc);
      const lockedUnit = lessonLockFor(lessonId);
      if (lockedUnit) { showToast(nextCourseStepMessage(lessonId) || lockedUnit.lockedReason); return; }
    }
    if (activeNpc?.lessonId) startLesson(activeNpc.lessonId);
    else if (activeNpc?.preparationId) openPreparation(activeNpc.preparationId);
    else if (activeNpc?.conversationId === 'cafe-waiter') openCafePreparation();
    else if (activeNpc?.conversationId === 'bakery-counter') openPreparation('bakery');
    else if (activeNpc?.conversationId === 'anna-introduction' && state.learning.lessons['greetings-basics'].status !== 'completed') startLesson('greetings-basics');
    else if (activeNpc?.conversationId) startConversation(conversationForNpc(activeNpc));
    else closeDialogue();
  }

  function canSpeakGerman() {
    if (typeof window.speechSynthesis === 'undefined' || typeof window.SpeechSynthesisUtterance !== 'function') return false;
    try {
      const voices = typeof window.speechSynthesis.getVoices === 'function' ? window.speechSynthesis.getVoices() : [];
      return voices.length === 0 || voices.some(voice => /^de([_-]|$)/i.test(voice.lang));
    } catch { return false; }
  }

  function speakGerman(text) {
    if (!canSpeakGerman()) { showToast('German speech is unavailable; you can continue by reading.'); return false; }
    try {
      window.speechSynthesis.cancel();
      activeUtterance = null;
      const utterance = new window.SpeechSynthesisUtterance(text);
      utterance.lang = 'de-DE'; utterance.rate = speechRate;
      const germanVoice = window.speechSynthesis.getVoices?.().find(voice => /^de([_-]|$)/i.test(voice.lang));
      if (germanVoice) utterance.voice = germanVoice;
      activeUtterance = utterance;
      utterance.onend = () => { if (activeUtterance === utterance) activeUtterance = null; };
      utterance.onerror = event => {
        if (activeUtterance !== utterance) return;
        activeUtterance = null;
        if (event.error !== 'canceled' && event.error !== 'interrupted') showToast('German speech is unavailable; you can continue by reading.');
      };
      window.speechSynthesis.speak(utterance);
      return true;
    } catch (error) {
      activeUtterance = null;
      console.warn('Deutschstadt speech synthesis is unavailable.', error);
      showToast('German speech is unavailable; you can continue by reading.');
      return false;
    }
  }

  function pronunciationButton(text, label = '▶  Play German pronunciation') {
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'listen-button'; button.textContent = label;
    button.disabled = !canSpeakGerman();
    if (!button.disabled) button.addEventListener('click', () => speakGerman(text));
    return button;
  }

  function openCafePreparation() { openPreparation('cafe'); }

  function openPreparation(preparationId) {
    const preparation = window.DeutschstadtLessons.preparations[preparationId];
    const lesson = window.DeutschstadtLessons;
    const prepared = preparation || (preparationId === 'cafe' ? {
      title: 'A little café practice',
      introduction: 'Take a moment to practise these useful café phrases. Play each pronunciation, then begin when you feel ready.',
      conversationId: 'cafe-waiter',
      phrases: lesson.cafePreparation
    } : null);
    if (!prepared) return;
    const conversationLessonId = window.DeutschstadtLessons.conversations[prepared.conversationId]?.lessonId;
    const lockedUnit = lessonLockFor(conversationLessonId);
    if (lockedUnit) { showToast(nextCourseStepMessage(conversationLessonId) || lockedUnit.lockedReason); return; }
    closeDialogue(); keys.clear();
    const content = document.createDocumentFragment();
    content.append(makeTextElement('p', 'modal-copy', prepared.introduction));
    for (const phrase of prepared.phrases) {
      const card = makeTextElement('div', 'phrase-card');
      const words = makeTextElement('div', 'phrase-words');
      words.append(makeTextElement('strong', '', phrase.german), makeTextElement('span', '', phrase.english), makeTextElement('small', 'phrase-breakdown', phrase.breakdown));
      const tools = makeTextElement('div', 'phrase-tools');
      tools.append(pronunciationButton(phrase.german));
      const practice = document.createElement('details'); practice.className = 'phrase-practice';
      const summary = document.createElement('summary'); summary.textContent = 'Practise this phrase'; practice.append(summary);
      const prompt = makeTextElement('p', 'practice-prompt', phrase.question);
      const options = makeTextElement('div', 'practice-options');
      const candidates = [phrase, ...prepared.phrases.filter(item => item !== phrase).slice(0, 2)];
      const feedback = makeTextElement('p', 'practice-feedback', ''); feedback.setAttribute('aria-live', 'polite');
      for (const candidate of candidates) {
        const answer = document.createElement('button'); answer.type = 'button'; answer.className = 'practice-option'; answer.textContent = candidate.german;
        answer.addEventListener('click', () => {
          const correct = candidate === phrase;
          feedback.className = `practice-feedback ${correct ? 'correct' : 'incorrect'}`;
          feedback.textContent = correct ? `Richtig! ${phrase.feedback}` : `Not quite. ${phrase.feedback} The phrase is “${phrase.german}”.`;
          Learning.recordAnswer(state.learning, { vocabularyIds: [phrase.vocabularyId] }, correct);
          markDirty(); saveGame();
        });
        options.append(answer);
      }
      practice.append(prompt, options, feedback); tools.append(practice); card.append(words, tools);
      content.append(card);
    }
    if (!canSpeakGerman()) content.append(makeTextElement('p', 'audio-fallback', 'German speech is unavailable in this browser. You can still read and complete the conversation.'));
    const conversationId = prepared.conversationId;
    const checkpoint = state.learning.conversations[conversationId];
    const label = checkpoint.status === 'in-progress' ? 'Resume conversation' : checkpoint.status === 'completed' ? 'Practice conversation again' : 'Start conversation';
    const start = document.createElement('button'); start.type = 'button'; start.className = 'modal-action lesson-start'; start.textContent = label;
    start.addEventListener('click', () => startConversation(conversationId));
    content.append(start);
    openModal(prepared.title, content);
  }

  let activeConversationSession = null;
  let activeConversationId = null;
  let activeConversationRewardEligible = false;

  function personalize(text) {
    let value = String(text || '').replaceAll('{name}', state.name);
    const conversation = window.DeutschstadtLessons.conversations[activeConversationId];
    const order = activeConversationSession?.order && conversation?.orders?.[activeConversationSession.order];
    if (order) for (const [key, replacement] of Object.entries(order)) value = value.replaceAll(`{${key}}`, replacement);
    return value;
  }

  function startConversation(conversationId) {
    const conversation = window.DeutschstadtLessons.conversations[conversationId];
    if (!conversation) return;
    if (conversation.sideMissionId && Learning.sideMissionFor(state.learning, conversation.sideMissionId)?.status === 'locked') {
      showToast('Complete your greetings lesson and introduction with Anna to unlock this side mission.'); return;
    }
    const lockedUnit = lessonLockFor(conversation.lessonId);
    if (lockedUnit) { showToast(nextCourseStepMessage(conversation.lessonId) || lockedUnit.lockedReason); return; }
    const checkpoint = state.learning.conversations[conversationId];
    const rewardId = conversation.rewardId || conversation.id;
    const alreadyCompletedLessonConversation = ['supermarket-shopping', 'shopping-conversation'].includes(conversationId)
      && conversation.lessonId && state.learning.lessons[conversation.lessonId]?.status === 'completed';
    activeConversationRewardEligible = !alreadyCompletedLessonConversation
      && !state.learning.rewardClaims.includes(`lesson:${rewardId}`);
    if (conversation.trackLessonCompletion !== false && conversation.lessonId && checkpoint.status !== 'in-progress') state.learning.lessons[conversation.lessonId].attempts++;
    if (conversation.trackLessonCompletion !== false && conversation.lessonId && state.learning.lessons[conversation.lessonId].status !== 'completed') state.learning.lessons[conversation.lessonId].status = 'in-progress';
    if (conversationId === 'supermarket-shopping') {
      state.learning.missions.supermarket.objectives.entered = true;
      state.learning.missions.supermarket.objectives.practiced = true;
    }
    activeNpc = null; ui.dialogue.classList.add('hidden');
    activeConversationId = conversationId;
    activeConversationSession = Learning.createConversationSession(conversationId, state.learning);
    markDirty(); saveGame(); renderConversation();
  }

  function renderConversation() {
    if (!activeConversationSession || !activeConversationId) return;
    const conversation = window.DeutschstadtLessons.conversations[activeConversationId];
    const node = activeConversationSession.node;
    const content = document.createDocumentFragment();
    const status = makeTextElement('div', 'lesson-topline');
    status.append(makeTextElement('span', '', conversation.displayTitle || 'CONVERSATION'), makeTextElement('span', '', node.speaker.toUpperCase()));
    const german = personalize(node.german), english = personalize(node.english);
    content.append(status, makeTextElement('p', 'exercise-speaker', node.speaker), makeTextElement('p', 'cafe-german-line', german), makeTextElement('p', 'modal-copy cafe-translation', english), pronunciationButton(german, '▶  Hear this German'));
    if (node.wordHelp?.length) {
      const words = makeTextElement('ul', 'word-help');
      for (const explanation of node.wordHelp) words.append(makeTextElement('li', '', explanation));
      content.append(words);
    }
    if (!canSpeakGerman()) content.append(makeTextElement('p', 'audio-note', 'German pronunciation is unavailable here. Read the translation and continue without audio.'));

    if (node.navigationStart) {
      const start = document.createElement('button'); start.type = 'button'; start.className = 'modal-action'; start.textContent = 'Start walking · Follow the gold marker';
      start.addEventListener('click', beginDirectionsNavigation); content.append(start);
    } else if (nodeIdIsConversationCompletion(activeConversationId, node)) {
      const resume = document.createElement('button'); resume.type = 'button'; resume.className = 'modal-action'; resume.textContent = 'Enter the Rathaus to finish';
      resume.addEventListener('click', suspendDirectionsConversation); content.append(resume);
    } else if (node.routeCheckpoint) {
      const resume = document.createElement('button'); resume.type = 'button'; resume.className = 'modal-action'; resume.textContent = 'Continue route';
      resume.addEventListener('click', suspendDirectionsConversation); content.append(resume);
    } else if (node.choices?.length) {
      const choices = makeTextElement('div', 'exercise-options cafe-choices');
      for (const choice of node.choices) {
        const button = document.createElement('button'); button.type = 'button'; button.className = 'exercise-option';
        button.append(makeTextElement('span', '', personalize(choice.text)), makeTextElement('small', '', personalize(choice.translation)));
        button.addEventListener('click', () => chooseConversationResponse(choice.id));
        choices.append(button);
      }
      content.append(choices);
    } else {
      const next = document.createElement('button'); next.type = 'button'; next.className = 'modal-action'; next.textContent = node.next === 'complete' ? 'Finish conversation' : 'Continue conversation →';
      next.addEventListener('click', advanceConversation);
      content.append(next);
    }
    ui.modalTitle.textContent = conversation.displayTitle || `Talking with ${node.speaker}`;
    ui.modalContent.replaceChildren(content); ui.backdrop.classList.remove('hidden');
  }

  function nodeIdIsConversationCompletion(conversationId, node) {
    const definition = window.DeutschstadtLessons.conversations[conversationId];
    return Boolean(definition?.completionNodeId && definition.nodes[definition.completionNodeId] === node);
  }

  function suspendDirectionsConversation() {
    activeConversationSession = null; activeConversationId = null; activeConversationRewardEligible = false;
    closeModal(); activeNpc = null; keys.clear(); saveGame();
  }

  function beginDirectionsNavigation() {
    const checkpoint = state.learning.conversations['directions-conversation'];
    if (!checkpoint || checkpoint.nodeId !== 'route-ready') return;
    checkpoint.nodeId = 'route-crossroads';
    suspendDirectionsConversation();
    showToast('Folgen Sie dem goldenen Wegpunkt. · Follow the gold marker.');
  }

  function updateDirectionsRoute() {
    if (state.sceneId !== 'town' || activeNpc || !ui.backdrop.classList.contains('hidden')) return;
    const route = WORLD.directionsRoute;
    const checkpoint = state.learning.conversations[route.conversationId];
    if (checkpoint?.status !== 'in-progress') return;
    const target = route.checkpoints.find(item => item.nodeId === checkpoint.nodeId);
    if (!target || Math.hypot(state.x - target.x, state.y - target.y) > target.radius) return;
    checkpoint.nodeId = target.nextNodeId;
    Learning.recordAnswer(state.learning, { vocabularyIds: ['direction_straight', 'intersection'] }, true);
    markDirty(); saveGame(); showToast(target.message);
  }

  function completeDirectionsLessonIfArrived() {
    if (state.sceneId !== 'rathaus' || !Learning.completeConversationLesson(state.learning, 'directions-conversation')) return false;
    const reward = awardLearningXp('directions-basics', window.DeutschstadtLessons.lessons['directions-basics'].rewardXp);
    Learning.recordAnswer(state.learning, { vocabularyIds: ['found_town_hall', 'town_hall'] }, true);
    markDirty(); saveGame();
    const content = document.createDocumentFragment();
    content.append(makeTextElement('p', 'answer-result correct', 'Geschafft! · You made it!'));
    content.append(makeTextElement('p', 'cafe-german-line', 'Ich habe das Rathaus gefunden.'));
    content.append(makeTextElement('p', 'modal-copy cafe-translation', 'I found the town hall.'));
    content.append(makeTextElement('p', 'lesson-score', `Directions complete. You earned ${reward.reward} XP. Your route checkpoint is saved.`));
    openModal('Finding the Rathaus', content);
    return true;
  }

  function chooseConversationResponse(choiceId) {
    if (!activeConversationSession) return;
    const result = activeConversationSession.choose(choiceId);
    if (!result) return;
    if (result.correct && activeConversationId === 'bank-employee' && choiceId === 'request-account') setBankObjective('accountPhrase');
    markDirty(); saveGame();
    const content = document.createDocumentFragment();
    content.append(makeTextElement('p', result.correct ? 'answer-result correct' : 'answer-result incorrect', result.correct ? 'Sehr gut!' : 'Try that again'));
    content.append(makeTextElement('p', 'modal-copy', result.feedback));
    if (result.correct) {
      const answer = personalize(result.choice.text);
      if (answer) { content.append(makeTextElement('p', 'answer-reveal', `${answer} — ${personalize(result.choice.translation)}`)); speakGerman(answer); }
      const next = document.createElement('button'); next.type = 'button'; next.className = 'modal-action'; next.textContent = 'Continue conversation →'; next.addEventListener('click', renderConversation); content.append(next);
    } else {
      const correct = result.node.choices.find(choice => choice.correct);
      if (correct) {
        const answer = personalize(correct.text);
        content.append(makeTextElement('p', 'answer-reveal', `${answer} — ${personalize(correct.translation)}`));
        for (const explanation of result.node.wordHelp || []) content.append(makeTextElement('p', 'exercise-instruction', explanation));
        content.append(pronunciationButton(answer, '▶  Hear the correct answer'));
      }
      const retry = document.createElement('button'); retry.type = 'button'; retry.className = 'modal-action'; retry.textContent = 'Try again'; retry.addEventListener('click', renderConversation); content.append(retry);
    }
    ui.modalContent.replaceChildren(content);
  }

  function advanceConversation() {
    if (!activeConversationSession || !activeConversationId) return;
    const finishedConversationId = activeConversationId;
    const conversation = window.DeutschstadtLessons.conversations[activeConversationId];
    const result = activeConversationSession.continue();
    if (!result) return;
    if (!result.complete) { markDirty(); saveGame(); renderConversation(); return; }
    let award = conversation.rewardXp && activeConversationRewardEligible
      ? awardLearningXp(conversation.rewardId || conversation.id, conversation.rewardXp)
      : { reward: 0, levelUps: [] };
    const name = conversation.displayName || conversation.id;
    if (state.learning.activeLesson?.lessonId === conversation.lessonId) state.learning.activeLesson = null;
    if (finishedConversationId === 'supermarket-shopping') {
      const mission = state.learning.missions.supermarket;
      mission.objectives.entered = true;
      mission.objectives.practiced = true;
      mission.objectives.completed = true;
      mission.completedAt = new Date().toISOString();
    }
    if (finishedConversationId === 'bank-employee') {
      setBankObjective('employeeTalked');
      setBankObjective('accountPhrase');
      if (state.learning.lessons['bank-basics'].status === 'completed') setBankObjective('vocabularyComplete');
    }
    if (conversation.sideMissionId) {
      const sideMission = state.learning.sideMissions[conversation.sideMissionId];
      if (window.DeutschstadtLessons.sideMissions[conversation.sideMissionId]?.requiredObjectives?.includes('conversation')) {
        sideMission.objectives.conversation = true;
        const completionAward = completeSideMissionIfReady(conversation.sideMissionId);
        if (completionAward) award = completionAward;
      } else if (sideMission.status !== 'completed') {
        sideMission.status = 'completed';
        sideMission.completedAt = new Date().toISOString();
      }
    }
    activeConversationSession = null; activeConversationId = null; activeConversationRewardEligible = false; markDirty(); saveGame();
    if (finishedConversationId === 'bank-employee' && state.learning.lessons['bank-basics'].status !== 'completed' && !lessonLockFor('bank-basics') && state.learning.missions.bankVisit.objectives.atmUsed && (!state.learning.activeLesson || state.learning.activeLesson.lessonId === 'bank-basics')) {
      startLesson('bank-basics');
      return;
    }
    const content = document.createDocumentFragment();
    content.append(makeTextElement('p', 'answer-result correct', 'Vielen Dank!'));
    const rewardMessage = conversation.rewardXp ? (award.reward ? ` You earned ${award.reward} XP.` : ' Your one-time conversation reward was already claimed.') : '';
    content.append(makeTextElement('p', 'modal-copy', `You completed your conversation with ${name}.${rewardMessage}`));
    if (conversation.sideMissionId) {
      const side = Learning.sideMissionFor(state.learning, conversation.sideMissionId);
      content.append(makeTextElement('p', 'lesson-score', side?.status === 'completed'
        ? `${side.title} complete. The one-time reward is saved.`
        : `Conversation complete. Next: ${side?.objective || 'continue the side mission.'}`));
    }
    appendPendingLevelUpNotice(content);
    if (finishedConversationId === 'bank-employee' && state.learning.lessons['bank-basics'].status !== 'completed') {
      const lockedBankUnit = lessonLockFor('bank-basics');
      content.append(makeTextElement('p', 'modal-copy', lockedBankUnit?.lockedReason || (state.learning.missions.bankVisit.objectives.atmUsed ? 'Your account-opening phrase is ready. Continue to the bank vocabulary question when you are ready.' : 'Next, try one fictional Geldautomat option, then complete the short vocabulary question.')));
      if (state.learning.missions.bankVisit.objectives.atmUsed && state.learning.activeLesson && state.learning.activeLesson.lessonId !== 'bank-basics') content.append(makeTextElement('p', 'audio-note', 'Your other lesson checkpoint is preserved. Resume it before starting the bank vocabulary question.'));
    }
    const done = document.createElement('button'); done.type = 'button'; done.className = 'modal-action'; done.textContent = 'Keep exploring'; done.addEventListener('click', closeModal);
    content.append(done); ui.modalContent.replaceChildren(content);
  }

  function showToast(message) {
    window.clearTimeout(toastTimer); ui.toast.textContent = message; ui.toast.classList.remove('hidden');
    toastTimer = window.setTimeout(() => ui.toast.classList.add('hidden'), 2400);
  }

  function pauseGame() {
    if (mode !== 'game' || paused) return;
    paused = true; keys.clear(); saveGame();
    const content = document.createDocumentFragment();
    content.append(paragraph('Take a breath. Your place in town is saved.'));
    const resume = document.createElement('button'); resume.type = 'button'; resume.className = 'modal-action'; resume.textContent = 'Resume';
    resume.addEventListener('click', () => { paused = false; closeModal(); canvas.focus({ preventScroll: true }); });
    const menu = document.createElement('button'); menu.type = 'button'; menu.className = 'modal-action'; menu.style.marginLeft = '8px'; menu.textContent = 'Return to Main Menu';
    menu.addEventListener('click', () => { closeModal(); returnToMenu(); });
    content.append(resume, menu); openModal('Paused', content);
  }

  function resizeCanvas() {
    if (!canvas.clientWidth || !canvas.clientHeight) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(canvas.clientWidth * dpr); canvas.height = Math.round(canvas.clientHeight * dpr);
  }

  function collides(x, y) {
    return collidesAt(state.sceneId || 'town', x, y);
  }

  function collidersFor(sceneId) {
    if (sceneId === 'town') return obstacles;
    const scene = WORLDS[sceneId] || WORLD;
    return [...(scene.walls || []), ...(scene.furniture || []).filter(item => item.solid), ...(scene.npcs || []).map(npcCollider)];
  }

  function sceneNpcs(sceneId) {
    return sceneId === 'town' ? npcs : (WORLDS[sceneId]?.npcs || []);
  }

  function npcCollider(npc) {
    // Match the visible character silhouette so the player cannot overlap a head or torso.
    return { x: npc.x - 14, y: npc.y - 21, w: 28, h: 46 };
  }

  function collidesAt(sceneId, x, y) {
    const scene = Object.hasOwn(WORLDS, sceneId) ? WORLDS[sceneId] : WORLD;
    if (x - PLAYER_RADIUS < 18 || y - PLAYER_RADIUS < 18 || x + PLAYER_RADIUS > scene.width - 18 || y + PLAYER_RADIUS > scene.height - 18) return true;
    return collidersFor(sceneId).some(box => {
      const nearestX = clamp(x, box.x, box.x + box.w);
      const nearestY = clamp(y, box.y, box.y + box.h);
      const dx = x - nearestX, dy = y - nearestY;
      return dx * dx + dy * dy < PLAYER_RADIUS * PLAYER_RADIUS;
    });
  }

  function nearestWalkablePosition(sceneId, x, y) {
    if (!collidesAt(sceneId, x, y)) return { x, y };
    const scene = Object.hasOwn(WORLDS, sceneId) ? WORLDS[sceneId] : WORLD;
    // A stale checkpoint or changed map collider can leave the player embedded.
    // Search outward in small rings so the player can escape without a full reset.
    for (let radius = 8; radius <= 320; radius += 8) {
      const samples = Math.max(16, Math.ceil((Math.PI * 2 * radius) / 8));
      for (let i = 0; i < samples; i++) {
        const angle = (i / samples) * Math.PI * 2;
        const candidate = { x: x + Math.cos(angle) * radius, y: y + Math.sin(angle) * radius };
        if (!collidesAt(sceneId, candidate.x, candidate.y)) return candidate;
      }
    }
    const spawn = scene.spawn || { x: 800, y: 590 };
    return collidesAt(sceneId, spawn.x, spawn.y) ? null : { x: spawn.x, y: spawn.y };
  }

  function recoverPlayerPosition() {
    if (!collides(state.x, state.y)) return false;
    const safePosition = nearestWalkablePosition(state.sceneId || 'town', state.x, state.y);
    if (!safePosition) return false;
    state.x = safePosition.x;
    state.y = safePosition.y;
    keys.clear();
    syncLocalPlayer();
    markDirty();
    showToast('You were stuck. Alex has been moved to the nearest safe spot.');
    return true;
  }

  function transitionScene(targetSceneId, position) {
    if (!Object.hasOwn(WORLDS, targetSceneId) || !position) return;
    state.sceneId = targetSceneId;
    state.x = position.x; state.y = position.y;
    activeNpc = null; nearbyTarget = null; keys.clear();
    ui.dialogue.classList.add('hidden'); ui.interaction.classList.add('hidden');
    ui.location.textContent = WORLDS[targetSceneId].location;
    syncLocalPlayer();
    if (targetSceneId === 'bank') setBankObjective('entered');
    if (targetSceneId === 'supermarket') state.learning.missions.supermarket.objectives.entered = true;
    markDirty(); saveGame();
    completeDirectionsLessonIfArrived();
  }

  function movePlayer(dt) {
    if (mode !== 'game') return;
    recoverPlayerPosition();
    if (paused || activeNpc || !ui.backdrop.classList.contains('hidden')) return;
    let dx = 0, dy = 0;
    if (keys.has('ArrowLeft') || keys.has('a')) dx--;
    if (keys.has('ArrowRight') || keys.has('d')) dx++;
    if (keys.has('ArrowUp') || keys.has('w')) dy--;
    if (keys.has('ArrowDown') || keys.has('s')) dy++;
    if (!dx && !dy) return;
    const length = Math.hypot(dx, dy); dx = dx / length * MOVE_SPEED * dt; dy = dy / length * MOVE_SPEED * dt;
    let moved = false;
    if (!collides(state.x + dx, state.y)) { state.x += dx; moved = true; }
    if (!collides(state.x, state.y + dy)) { state.y += dy; moved = true; }
    if (moved) { markDirty(); syncLocalPlayer(); }
  }

  function findNearbyNpc() {
    let found = null, minDistance = 67;
    const candidates = sceneNpcs(state.sceneId);
    for (const npc of candidates) {
      const distance = Math.hypot(state.x - npc.x, state.y - npc.y);
      if (distance < minDistance) { minDistance = distance; found = npc; }
    }
    return found;
  }

  function findNearbyTarget() {
    const npc = findNearbyNpc();
    let target = npc ? { type: 'npc', value: npc, id: npc.id, distance: Math.hypot(state.x - npc.x, state.y - npc.y) } : null;
    if (target?.type === 'npc') {
      const lessonRedirect = Learning.conversationLessonRedirect(state.learning, target.value.conversationId);
      if (lessonRedirect) {
        target = {
          type: 'journal', value: { name: lessonRedirect.destination }, id: `journal:${lessonRedirect.lessonId}`,
          distance: target.distance
        };
      }
    }
    const scene = Object.hasOwn(WORLDS, state.sceneId) ? WORLDS[state.sceneId] : WORLD;
    const doors = [...(scene.doors || []), ...(scene.exit ? [scene.exit] : [])];
    for (const door of doors) {
      const distance = Math.hypot(state.x - door.x, state.y - door.y);
      if (distance < door.radius && (!target || distance < target.distance)) target = { type: 'door', value: door, id: door.id, distance };
    }
    for (const item of scene.interactables || []) {
      const distance = Math.hypot(state.x - item.x, state.y - item.y);
      if (distance < item.radius && (!target || distance < target.distance)) target = { type: 'object', value: item, id: item.id, distance };
    }
    return target;
  }

  function currentInteractionTarget() {
    if (mode !== 'game' || paused || activeNpc || !ui.backdrop.classList.contains('hidden')) return null;
    return findNearbyTarget();
  }

  function openSideMissionInteraction(item) {
    const missionId = state.sceneId === 'rathaus' ? 'rathaus' : 'wohnhaus';
    const definition = window.DeutschstadtLessons.sideMissions[missionId];
    const progress = state.learning.sideMissions[missionId];
    const conversationDone = state.learning.conversations[definition.conversationId]?.status === 'completed';
    const content = document.createDocumentFragment();
    content.append(makeTextElement('p', 'cafe-german-line', item.german), makeTextElement('p', 'modal-copy', item.english), makeTextElement('p', 'modal-copy', item.detail));
    const alreadyDone = progress.objectives[item.clueId] === true;
    if (!conversationDone) {
      content.append(makeTextElement('p', 'audio-note', `Talk with ${definition.npcId === 'lukas' ? 'Lukas' : 'Frau Neumann'} first to learn the clue.`));
    } else if (alreadyDone) {
      content.append(makeTextElement('p', 'answer-result correct', 'You have already recorded this clue.'));
    } else {
      const options = missionId === 'rathaus'
        ? [
          { text: 'Büro 2 · Termine', translation: 'Office 2 · Appointments', correct: true, feedback: 'Richtig! Mia has an appointment, so Büro 2 is the right destination.' },
          { text: 'Büro 1 · Auskunft', translation: 'Office 1 · Information', correct: false, feedback: 'That office is for information. Mia has an appointment, so choose Büro 2.' }
        ]
        : item.clueId === 'table-clue'
          ? [
            { text: 'Der Schlüssel ist im Schrank.', translation: 'The key is in the cupboard.', correct: true, feedback: 'Richtig! The note says to look for the key in the cupboard.' },
            { text: 'Der Schlüssel liegt auf dem Tisch.', translation: 'The key is on the table.', correct: false, feedback: 'Read the note again: “im Schrank” means “in the cupboard.”' }
          ]
          : item.clueId === 'cupboard-clue'
            ? [
              { text: 'Der Schlüssel ist im Schrank.', translation: 'The key is in the cupboard.', correct: true, feedback: 'Sehr gut! “im Schrank” means “in the cupboard.”' },
              { text: 'Die Tasche liegt auf dem Tisch.', translation: 'The bag is on the table.', correct: false, feedback: 'This clue asks where you found the key: it is in the cupboard.' }
            ]
            : [
              { text: 'Ich habe sie gefunden!', translation: 'I found it!', correct: true, feedback: 'Richtig! “sie” refers to the feminine noun “die Tasche.”' },
              { text: 'Ich habe sie verloren.', translation: 'I lost it.', correct: false, feedback: 'Lukas’s bag is here. Use “gefunden” to say you found it.' }
            ];
      for (const option of options) {
        const button = document.createElement('button'); button.type = 'button'; button.className = 'exercise-option';
        button.append(makeTextElement('span', '', option.text), makeTextElement('small', '', option.translation));
        button.addEventListener('click', () => {
          Learning.recordAnswer(state.learning, { vocabularyIds: item.vocabularyIds || [] }, option.correct);
          markDirty(); saveGame();
          const result = document.createDocumentFragment();
          result.append(makeTextElement('p', option.correct ? 'answer-result correct' : 'answer-result incorrect', option.correct ? 'Sehr gut!' : 'Try again'));
          result.append(makeTextElement('p', 'modal-copy', option.feedback));
          if (option.correct) {
            const previousXp = state.xp;
            setSideMissionObjective(missionId, item.clueId);
            result.append(makeTextElement('p', 'answer-reveal', `${option.text} — ${option.translation}`));
            if (Learning.sideMissionFor(state.learning, missionId)?.status === 'completed') {
              const earned = state.xp - previousXp;
              result.append(makeTextElement('p', 'lesson-score', `${window.DeutschstadtLessons.sideMissions[missionId].title} complete.${earned ? ` You earned ${earned} XP.` : ''}`));
            }
            appendPendingLevelUpNotice(result);
          }
          const close = document.createElement('button'); close.type = 'button'; close.className = 'modal-action'; close.textContent = option.correct ? 'Continue' : 'Try again';
          close.addEventListener('click', () => option.correct ? closeModal() : openSideMissionInteraction(item));
          result.append(close); ui.modalContent.replaceChildren(result);
        });
        content.append(button);
      }
    }
    openModal(item.name, content);
  }

  function activateTarget(target) {
    if (!target) return;
    if (target.type === 'door') transitionScene(target.value.targetSceneId, target.value.targetPosition);
    else if (target.type === 'journal') openLearningJournal();
    else if (target.type === 'object') {
      if (target.value.interaction === 'atm') { openBankAtm(); return; }
      if (target.value.interaction === 'information') { openBankInformation(); return; }
      if (target.value.interaction === 'rathaus-sign' || target.value.interaction === 'home-clue') { openSideMissionInteraction(target.value); return; }
      const content = document.createDocumentFragment();
      content.append(makeTextElement('p', 'cafe-german-line', target.value.german), makeTextElement('p', 'modal-copy', target.value.english), makeTextElement('p', 'modal-copy', target.value.detail), pronunciationButton(target.value.german));
      openModal(target.value.name, content);
    } else setDialogue(target.value);
  }

  function openBankAtm() {
    const content = document.createDocumentFragment();
    content.append(makeTextElement('p', 'modal-copy', 'Practice with a fictional account. No real money or banking details are used.'), makeTextElement('p', 'answer-reveal', 'Practice balance · 120 €'));
    if (!canSpeakGerman()) content.append(makeTextElement('p', 'audio-fallback', 'German speech is unavailable in this browser. The English meanings are shown beside each option.'));
    const actions = [
      ['withdraw', 'Geld abheben', 'Withdraw money', 'You would withdraw 20 €. Practice phrase: “Ich möchte Geld abheben.”'],
      ['deposit', 'Geld einzahlen', 'Deposit money', 'You would deposit 10 €. Practice phrase: “Ich möchte Geld einzahlen.”'],
      ['balance', 'Kontostand', 'Account balance', 'Your fictional practice balance is 120 €. “Wie hoch ist mein Kontostand?” means “What is my account balance?”']
    ];
    for (const [, german, english, explanation] of actions) {
      const button = document.createElement('button'); button.type = 'button'; button.className = 'exercise-option';
      button.append(makeTextElement('span', '', german), makeTextElement('small', '', english));
      button.addEventListener('click', () => {
        setBankObjective('atmUsed');
        const result = document.createDocumentFragment();
        result.append(makeTextElement('p', 'cafe-german-line', german), makeTextElement('p', 'modal-copy', english), makeTextElement('p', 'modal-copy', explanation));
        if (state.learning.missions.bankVisit.completed) result.append(makeTextElement('p', 'answer-result correct', 'Mein erster Bankbesuch is complete. Its one-time 50 XP reward is saved.'));
        const speak = pronunciationButton(german, '▶  Hear this phrase'); result.append(speak);
        const bankProgress = state.learning.missions.bankVisit;
        const bankLesson = state.learning.lessons['bank-basics'];
        const lockedBankUnit = lessonLockFor('bank-basics');
        if (bankProgress.objectives.employeeTalked && bankLesson.status !== 'completed') {
          if (lockedBankUnit) result.append(makeTextElement('p', 'audio-note', lockedBankUnit.lockedReason));
          else if (state.learning.activeLesson && state.learning.activeLesson.lessonId !== 'bank-basics') result.append(makeTextElement('p', 'audio-note', 'Your other lesson checkpoint is saved. Resume it before starting the bank vocabulary question.'));
          else {
            const lessonButton = document.createElement('button'); lessonButton.type = 'button'; lessonButton.className = 'modal-action'; lessonButton.textContent = 'Continue to vocabulary exercise'; lessonButton.addEventListener('click', () => startLesson('bank-basics')); result.append(lessonButton);
          }
        }
        const back = document.createElement('button'); back.type = 'button'; back.className = 'modal-action'; back.textContent = 'Back to Geldautomat'; back.addEventListener('click', openBankAtm); result.append(back);
        const done = document.createElement('button'); done.type = 'button'; done.className = 'modal-action'; done.style.marginLeft = '8px'; done.textContent = 'Close'; done.addEventListener('click', closeModal); result.append(done);
        openModal('Geldautomat · Practice result', result);
      });
      content.append(button, pronunciationButton(german, '▶  Listen'));
    }
    const cancel = document.createElement('button'); cancel.type = 'button'; cancel.className = 'modal-action'; cancel.textContent = 'Abbrechen · Cancel'; cancel.addEventListener('click', closeModal); content.append(cancel);
    openModal('Geldautomat · Cash machine', content);
  }

  function openBankInformation() {
    const content = document.createDocumentFragment();
    content.append(makeTextElement('p', 'cafe-german-line', 'Öffnungszeiten'), makeTextElement('p', 'modal-copy', 'Montag–Freitag · 09:00–16:00 · Fictional town hours'));
    if (!canSpeakGerman()) content.append(makeTextElement('p', 'audio-fallback', 'German speech is unavailable in this browser. The translations are shown for every phrase.'));
    for (const phrase of [
      ['das Bankkonto', 'the bank account'], ['der Ausweis', 'the identity document'], ['Geld abheben', 'withdraw money'], ['Geld einzahlen', 'deposit money'], ['der Kontostand', 'the account balance']
    ]) {
      const card = makeTextElement('div', 'phrase-card');
      card.append(makeTextElement('strong', '', phrase[0]), makeTextElement('span', '', phrase[1]), pronunciationButton(phrase[0], '▶  Listen'));
      content.append(card);
    }
    openModal('Stadtbank · Information', content);
  }

  function updateMissionCard() {
    if (!ui.mission) return;
    const mission = Learning.currentMission(state.learning);
    const visible = Boolean(mission) && ui.backdrop.classList.contains('hidden') && !activeNpc;
    ui.mission.classList.toggle('hidden', !visible);
    if (visible) {
      ui.missionTitle.textContent = mission.status === 'complete' ? 'CHAPTER COMPLETE' : `MISSION · ${mission.title}`;
      ui.missionObjective.textContent = mission.status === 'complete' ? mission.objective : `Next: ${mission.objective}`;
      ui.missionDestination.textContent = `Destination: ${mission.destination}${mission.progressLabel ? ` · ${mission.progressLabel}` : ''}`;
      ui.missionDetails.classList.toggle('hidden', missionMinimized);
      ui.missionToggle.textContent = missionMinimized ? 'Show' : 'Minimise';
      ui.missionToggle.setAttribute('aria-label', `${missionMinimized ? 'Show' : 'Minimise'} main mission`);
      ui.missionToggle.setAttribute('aria-expanded', String(!missionMinimized));
    }
    if (ui.sideMission) {
      const side = Learning.currentSideMission(state.learning);
      const sideVisible = Boolean(side && ['available', 'in-progress'].includes(side.status) && ui.backdrop.classList.contains('hidden') && !activeNpc);
      ui.sideMission.classList.toggle('hidden', !sideVisible);
      ui.sideMission.classList.toggle('is-minimized', sideMissionMinimized);
      if (sideVisible) {
        ui.sideMissionTitle.textContent = side.status === 'completed' ? 'SIDE MISSION · COMPLETE' : `SIDE MISSION · ${side.title} — ${side.englishTitle}`;
        ui.sideMissionObjective.textContent = side.status === 'completed' ? side.objective : `Next: ${side.objective}`;
        ui.sideMissionDestination.textContent = `Destination: ${side.destination}`;
        ui.sideMissionToggle.textContent = sideMissionMinimized ? 'Show' : 'Minimise';
        ui.sideMissionToggle.setAttribute('aria-label', `${sideMissionMinimized ? 'Show' : 'Minimise'} side quest`);
        ui.sideMissionToggle.setAttribute('aria-expanded', String(!sideMissionMinimized));
        const layoutKey = `${window.innerWidth}:${missionMinimized}:${mission.status}:${mission.title}:${mission.objective}:${mission.destination}:${mission.progressLabel || ''}`;
        if (layoutKey !== missionHudLayoutKey) {
          const mainMissionBottom = ui.mission.offsetTop + ui.mission.offsetHeight;
          ui.sideMission.style.top = `${Math.max(150, mainMissionBottom + 12)}px`;
          missionHudLayoutKey = layoutKey;
        }
      }
    }
  }

  function missionMarkerTarget() {
    if (mode !== 'game' || activeNpc || !ui.backdrop.classList.contains('hidden')) return null;
    if (learningPathDestination === 'station') {
      const status = Learning.unitsFor(state.learning).find(unit => unit.id === 'station')?.status;
      if (status === 'locked') { learningPathDestination = null; }
      else if (state.sceneId === 'town') return WORLDS.town.doors.find(door => door.id === 'station-entrance') || null;
      else if (state.sceneId === 'station') return sceneNpcs('station').find(npc => npc.id === 'station-clerk') || null;
      else return WORLDS[state.sceneId]?.exit || null;
    }
    const mission = Learning.currentMission(state.learning);
    if (!mission) return null;
    if (mission.status === 'complete' || mission.action === 'explore') {
      const side = Learning.currentSideMission(state.learning);
      if (side?.status === 'available' || side?.status === 'in-progress') {
      if (state.sceneId === 'town') {
        const building = WORLDS.town.doors.find(door => door.targetSceneId === side.id);
        return sceneNpcs('town').find(npc => npc.id === side.npcId) || building || (side.id === 'weekly-market' ? sceneNpcs('town').find(npc => npc.id === side.npcId) : null);
      }
      if (state.sceneId === side.id) {
        const definition = window.DeutschstadtLessons.sideMissions[side.id];
        if (state.learning.conversations[definition.conversationId]?.status !== 'completed') return sceneNpcs(state.sceneId).find(npc => npc.id === side.npcId) || null;
        const missing = definition.requiredObjectives?.find(id => id !== 'conversation' && !state.learning.sideMissions[side.id].objectives[id]);
        return (WORLDS[state.sceneId].interactables || []).find(item => item.clueId === missing) || null;
      }
      return WORLDS[state.sceneId]?.exit || null;
      }
      const station = Learning.unitsFor(state.learning).find(unit => unit.id === 'station');
      if (station?.status === 'available' || station?.status === 'in-progress') {
        if (state.sceneId === 'town') return WORLDS.town.doors.find(door => door.id === 'station-entrance') || null;
        if (state.sceneId === 'station') return sceneNpcs('station').find(npc => npc.id === 'station-clerk') || null;
        return WORLDS[state.sceneId]?.exit || null;
      }
      return null;
    }
    if (mission.action === 'lesson' || mission.action === 'unavailable') return null;
    if (state.sceneId === 'town' && mission.doorId) return WORLDS.town.doors.find(door => door.id === mission.doorId) || null;
    if (mission.sceneId !== state.sceneId) return state.sceneId === 'town' ? null : (WORLDS[state.sceneId]?.exit || null);
    if (mission.npcId) return sceneNpcs(state.sceneId).find(npc => npc.id === mission.npcId) || null;
    if (mission.objectId) return (WORLDS[state.sceneId]?.interactables || []).find(item => item.id === mission.objectId) || null;
    return null;
  }

  function drawMissionMarker() {
    const target = missionMarkerTarget();
    if (!target) return;
    const offset = target.targetSceneId ? 20 : target.h ? target.h / 2 : 45;
    const x = target.x, y = target.y - offset;
    ctx.save();
    ctx.fillStyle = '#f1c879'; ctx.strokeStyle = '#fff0c7'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(x, y, 13, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#24352a'; ctx.beginPath(); ctx.moveTo(x, y + 6); ctx.lineTo(x - 5, y - 3); ctx.lineTo(x + 5, y - 3); ctx.closePath(); ctx.fill();
    ctx.font = '700 9px system-ui'; ctx.textAlign = 'center'; ctx.fillStyle = '#fff3d4';
    ctx.fillText('NEXT', x, y - 20);
    ctx.restore();
  }

  function drawDirectionsMarker() {
    if (state.sceneId !== 'town') return;
    const route = WORLD.directionsRoute;
    const checkpoint = state.learning.conversations[route.conversationId];
    if (checkpoint?.status !== 'in-progress') return;
    const target = route.checkpoints.find(item => item.nodeId === checkpoint.nodeId);
    if (!target) return;
    ctx.save(); ctx.strokeStyle = '#fff0c7'; ctx.fillStyle = '#f1c879'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(target.x, target.y - 25, 14, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#24352a'; ctx.beginPath(); ctx.moveTo(target.x, target.y - 19); ctx.lineTo(target.x - 5, target.y - 28); ctx.lineTo(target.x + 5, target.y - 28); ctx.closePath(); ctx.fill();
    ctx.restore();
  }

  function drawGround(cameraX, cameraY, width, height) {
    // Paint beyond the map edge as well, so very wide views never expose a
    // transparent/previous-frame strip when the camera has to center the town.
    ctx.fillStyle = '#53684f'; ctx.fillRect(cameraX, cameraY, width, height);
    ctx.fillStyle = '#768b69'; ctx.fillRect(0, 0, WORLD.width, WORLD.height);
    // Soft patches of meadow give the town a hand-painted, tile-free feel.
    for (let i = 0; i < 70; i++) {
      const x = (i * 257 + 91) % WORLD.width, y = (i * 193 + 47) % WORLD.height;
      ctx.fillStyle = i % 2 ? '#9aab7e' : '#647c5e'; ctx.globalAlpha = .22;
      ctx.beginPath(); ctx.ellipse(x, y, 25 + (i % 4) * 9, 12 + (i % 3) * 5, .3, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
    // Main crossroads and connected pedestrian routes.
    ctx.fillStyle = '#a99b7e'; ctx.fillRect(0, 458, WORLD.width, 116); ctx.fillRect(752, 0, 96, WORLD.height);
    ctx.fillStyle = '#c9b995'; ctx.fillRect(0, 465, WORLD.width, 102); ctx.fillRect(759, 0, 82, WORLD.height);
    ctx.fillStyle = '#dfd0ae'; ctx.fillRect(0, 465, WORLD.width, 4); ctx.fillRect(0, 563, WORLD.width, 4); ctx.fillRect(759, 0, 4, WORLD.height); ctx.fillRect(837, 0, 4, WORLD.height);
    // Staggered cobbles soften the broad street while keeping the walking lane clear.
    ctx.strokeStyle = '#aa9b7d'; ctx.lineWidth = 1; ctx.globalAlpha = .26;
    for (let row = 0, y = 478; y < 561; row++, y += 20) {
      const offset = row % 2 ? 22 : 0;
      for (let x = -30 + offset; x < WORLD.width; x += 44) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 1, y + 15); ctx.stroke(); }
    }
    for (let row = 0, y = 4; y < WORLD.height; row++, y += 22) {
      const offset = row % 2 ? 17 : 0;
      for (let x = 770 + offset; x < 836; x += 36) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 23, y + 1); ctx.stroke(); }
    }
    ctx.globalAlpha = 1;
    // Entrance paths share one width and material, making routes legible from
    // the top-down camera without changing any door or transition coordinates.
    ctx.fillStyle = '#c2b18d';
    for (const path of townPaths) ctx.fillRect(path.x, path.y, path.w, path.h);
    ctx.fillStyle = '#d3c19b'; ctx.globalAlpha = .72;
    for (const path of townPaths) {
      ctx.fillRect(path.x, path.y, path.w, 3);
      ctx.fillRect(path.x, path.y + path.h - 3, path.w, 3);
      ctx.fillRect(path.x, path.y, 3, path.h);
      ctx.fillRect(path.x + path.w - 3, path.y, 3, path.h);
    }
    ctx.globalAlpha = 1;
    // A compact square sits beside the crossroads so it frames the fountain
    // without covering the continuous east-west or north-south streets.
    const plaza = { x: 530, y: 592, w: 218, h: 164 };
    ctx.fillStyle = '#a99b7e'; ctx.fillRect(plaza.x - 4, plaza.y - 4, plaza.w + 8, plaza.h + 8);
    ctx.fillStyle = '#cbb993'; ctx.fillRect(plaza.x, plaza.y, plaza.w, plaza.h);
    ctx.strokeStyle = '#a99776'; ctx.lineWidth = 1; ctx.globalAlpha = .25;
    for (let row = 0, y = plaza.y + 9; y < plaza.y + plaza.h - 8; row++, y += 28) {
      const offset = row % 2 ? 16 : 0;
      for (let x = plaza.x + 8 + offset; x < plaza.x + plaza.w - 8; x += 32) { ctx.beginPath(); ctx.roundRect(x, y, 27, 22, 3); ctx.stroke(); }
    }
    ctx.globalAlpha = 1;
    // Market court: deliberately open at the east side and linked to the street.
    const court = WORLD.marketArea;
    ctx.fillStyle = '#b9a987'; ctx.fillRect(court.x, court.y, court.w, court.h);
    ctx.fillStyle = '#d0c09d'; ctx.fillRect(court.x + 5, court.y + 5, court.w - 10, court.h - 10);
    ctx.strokeStyle = '#ad9c7b'; ctx.globalAlpha = .42;
    for (let y = court.y + 14, row = 0; y < court.y + court.h - 8; y += 26, row++) {
      const offset = row % 2 ? 15 : 0;
      for (let x = court.x + 8 + offset; x < court.x + court.w - 8; x += 34) { ctx.beginPath(); ctx.roundRect(x, y, 29, 19, 3); ctx.stroke(); }
    }
    ctx.globalAlpha = 1;
  }

  function drawMarketBanner(court) {
    const x = court.x + court.w / 2;
    ctx.fillStyle = '#4b5d47'; ctx.fillRect(x - 112, court.y + 10, 224, 30);
    ctx.fillStyle = '#d8bd84'; ctx.fillRect(x - 108, court.y + 13, 216, 24);
    ctx.fillStyle = '#40503d'; ctx.font = '700 12px Georgia'; ctx.textAlign = 'center';
    ctx.fillText('WOCHENMARKT  ·  FRISCH AUS DER REGION', x, court.y + 29);
    ctx.textAlign = 'start';
  }

  function drawMarketStall(stall) {
    const { x, y, w, h } = stall;
    ctx.fillStyle = '#29352a38'; ctx.beginPath(); ctx.ellipse(x + w / 2 + 5, y + h - 1, w * .62, 11, 0, 0, Math.PI * 2); ctx.fill();
    // Timber trestle and crate counter sit below a striped canvas awning.
    ctx.fillStyle = '#76573c'; ctx.fillRect(x + 5, y + 35, w - 10, h - 39);
    ctx.fillStyle = '#a67a50'; ctx.fillRect(x + 2, y + 31, w - 4, 9);
    ctx.fillStyle = '#6b5038'; ctx.fillRect(x + 10, y + 38, 6, h - 43); ctx.fillRect(x + w - 16, y + 38, 6, h - 43);
    ctx.fillStyle = '#ead7b0'; ctx.fillRect(x - 4, y + 5, w + 8, 34);
    const stripeW = (w + 8) / 6;
    for (let i = 0; i < 6; i++) {
      ctx.fillStyle = i % 2 ? '#f1dfbd' : stall.canopy;
      ctx.fillRect(x - 4 + i * stripeW, y + 5, stripeW + 1, 34);
    }
    ctx.fillStyle = stall.canopy; ctx.beginPath(); ctx.moveTo(x - 4, y + 39); ctx.lineTo(x + w + 4, y + 39); ctx.lineTo(x + w - 1, y + 47); ctx.lineTo(x + 3, y + 47); ctx.closePath(); ctx.fill();
    // Distinct produce piles use small highlights rather than identical dots.
    const palette = stall.produce;
    for (let i = 0; i < 8; i++) {
      const px = x + 14 + (i % 4) * 16;
      const py = y + 59 + Math.floor(i / 4) * 12;
      ctx.fillStyle = palette[i % palette.length];
      if (stall.id === 'market-flowers') {
        ctx.fillRect(px, py + 4, 2, 12);
        ctx.beginPath(); ctx.arc(px + 1, py + 3, 4, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#e8d7a5'; ctx.beginPath(); ctx.arc(px + 1, py + 3, 1.4, 0, Math.PI * 2); ctx.fill();
      } else {
        ctx.beginPath(); ctx.ellipse(px, py, 6, 5, (i % 3 - 1) * .2, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#fff0d866'; ctx.beginPath(); ctx.arc(px - 2, py - 2, 1.5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#55734d'; ctx.fillRect(px, py - 7, 2, 3);
      }
    }
    ctx.fillStyle = '#f1e2c1'; ctx.font = '700 8px system-ui'; ctx.textAlign = 'center';
    const label = stall.id === 'market-fruit' ? 'OBST' : stall.id === 'market-flowers' ? 'BLUMEN' : 'GEMÜSE';
    ctx.fillText(label, x + w / 2, y + h - 5);
  }

  function buildStaticLayer(width, height, draw) {
    const layer = document.createElement('canvas');
    layer.width = width; layer.height = height;
    const previousContext = ctx;
    ctx = layer.getContext('2d');
    try { draw(); } finally { ctx = previousContext; }
    return layer;
  }

  function getTownArtLayer() {
    if (!townArtLayer) {
      townArtLayer = buildStaticLayer(WORLD.width, WORLD.height, () => {
        drawGround(0, 0, WORLD.width, WORLD.height);
      });
    }
    return townArtLayer;
  }

  function getSupermarketArtLayer() {
    if (!supermarketArtLayer) supermarketArtLayer = buildStaticLayer(WORLDS.supermarket.width, WORLDS.supermarket.height, drawSupermarketInterior);
    return supermarketArtLayer;
  }

  function drawBuilding(b) {
    const roofY = b.y - (b.style === 'house' ? 42 : 50);
    // Ground shadow and raised masonry plinth give the façades a consistent depth.
    ctx.fillStyle = '#31433238'; ctx.beginPath(); ctx.ellipse(b.x + b.w / 2 + 9, b.y + b.h + 9, b.w * .58, 17, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#9b896b'; ctx.fillRect(b.x - 5, b.y + b.h - 13, b.w + 10, 20);
    ctx.fillStyle = b.color; ctx.fillRect(b.x, b.y + 20, b.w, b.h - 33);
    // Subtle plaster seams and light falloff instead of a flat colour block.
    ctx.fillStyle = '#f1dfbd33'; ctx.fillRect(b.x + 5, b.y + 25, b.w - 10, 5);
    ctx.fillStyle = '#705d4530'; ctx.fillRect(b.x + 4, b.y + 31, 5, b.h - 48);
    ctx.fillStyle = '#b89b72'; ctx.fillRect(b.x, b.y + b.h - 19, b.w, 6);
    ctx.fillStyle = b.roof; ctx.beginPath(); ctx.moveTo(b.x - 22, b.y + 24); ctx.lineTo(b.x + b.w / 2, roofY); ctx.lineTo(b.x + b.w + 22, b.y + 24); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#ffffff20'; ctx.beginPath(); ctx.moveTo(b.x - 15, b.y + 18); ctx.lineTo(b.x + b.w / 2, roofY + 8); ctx.lineTo(b.x + b.w / 2, b.y + 18); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#2e392c30'; ctx.lineWidth = 2;
    for (let row = 0, y = roofY + 18; y < b.y + 17; row++, y += 12) {
      const inset = Math.max(0, (y - roofY) * .36);
      ctx.beginPath(); ctx.moveTo(b.x - 10 + inset, y); ctx.lineTo(b.x + b.w + 10 - inset, y); ctx.stroke();
    }
    ctx.fillStyle = '#ead6b1'; ctx.fillRect(b.x - 8, b.y + 17, b.w + 16, 9);
    // Shop awnings and sign boards make services recognizable at a glance.
    if (['bakery', 'cafe'].includes(b.style)) {
      const awningY = b.y + 111;
      ctx.fillStyle = '#76513f'; ctx.fillRect(b.x + 20, awningY, b.w - 40, 10);
      const stripe = b.style === 'bakery' ? '#efe0bd' : '#f0d4ad';
      for (let i = 0; i < 7; i++) { ctx.fillStyle = i % 2 ? stripe : b.roof; ctx.fillRect(b.x + 21 + i * (b.w - 42) / 7, awningY + 9, (b.w - 42) / 7 - 1, 17); }
    }
    const windowY = b.style === 'house' ? b.y + 68 : b.y + 65;
    const windowW = b.style === 'house' ? 43 : 38;
    for (const wx of [b.x + 25, b.x + b.w - windowW - 25]) {
      ctx.fillStyle = '#695d4b'; ctx.fillRect(wx - 5, windowY - 5, windowW + 10, 49);
      ctx.fillStyle = '#91b7b3'; ctx.fillRect(wx, windowY, windowW, 39);
      ctx.fillStyle = '#d8c8a6'; ctx.fillRect(wx + windowW / 2 - 2, windowY, 4, 39); ctx.fillRect(wx, windowY + 18, windowW, 3);
      ctx.strokeStyle = '#f2e6ca'; ctx.lineWidth = 3; ctx.strokeRect(wx - 3, windowY - 3, windowW + 6, 45);
      ctx.fillStyle = '#f7eacb35'; ctx.beginPath(); ctx.moveTo(wx + 4, windowY + 4); ctx.lineTo(wx + windowW - 5, windowY + 4); ctx.lineTo(wx + 7, windowY + 31); ctx.closePath(); ctx.fill();
    }
    const doorData = WORLD.doors.find(door => door.id === `${b.id}-entrance`);
    const doorCenter = doorData?.x ?? b.x + b.w / 2;
    const openingW = b.id === 'cafe' ? 64 : 72;
    const leafW = b.style === 'bank' ? 42 : 36;
    const doorTop = b.y + b.h - 74;
    ctx.fillStyle = '#574637'; ctx.fillRect(doorCenter - openingW / 2, doorTop, openingW, 62);
    ctx.fillStyle = b.style === 'supermarket' ? '#687c69' : '#755840'; ctx.fillRect(doorCenter - leafW / 2, doorTop + 5, leafW, 57);
    ctx.fillStyle = '#d0b67d'; ctx.beginPath(); ctx.arc(doorCenter + leafW / 2 - 8, doorTop + 35, 2, 0, Math.PI * 2); ctx.fill();
    // Storefront glazing flanks the door; civic and residential buildings stay calm.
    if (['bakery', 'cafe', 'supermarket'].includes(b.style)) {
      ctx.fillStyle = '#8cb0ad'; ctx.fillRect(b.x + b.w * .36, b.y + 64, b.w * .28, 38);
      ctx.strokeStyle = '#f2e3c3'; ctx.lineWidth = 4; ctx.strokeRect(b.x + b.w * .36 - 2, b.y + 62, b.w * .28 + 4, 42);
      ctx.fillStyle = '#fff0cc20'; ctx.fillRect(b.x + b.w * .38, b.y + 66, b.w * .08, 31);
    }
    const signY = b.y + 38;
    ctx.fillStyle = b.style === 'bank' || b.style === 'public' ? '#475d50' : '#5b4637';
    ctx.fillRect(b.x + b.w * .22, signY, b.w * .56, 23);
    ctx.strokeStyle = '#d5b77e'; ctx.lineWidth = 2; ctx.strokeRect(b.x + b.w * .22, signY, b.w * .56, 23);
    ctx.fillStyle = '#f4e5c5'; ctx.font = `700 ${b.label.length > 14 ? 9 : 11}px system-ui`; ctx.textAlign = 'center'; ctx.fillText(b.label, b.x + b.w / 2, signY + 15);
    if (b.style === 'house') {
      ctx.fillStyle = '#eee0be'; ctx.fillRect(b.x + 14, b.y + 39, 10, 10); ctx.fillRect(b.x + b.w - 24, b.y + 39, 10, 10);
    }
    if (b.id === 'station') {
      ctx.fillStyle = '#f4e5c5'; ctx.font = '700 8px system-ui'; ctx.textAlign = 'center'; ctx.fillText('EINGANG · ENTRANCE', doorCenter, doorTop - 6); ctx.textAlign = 'start';
    }
  }

  function drawRailwayDistrict() {
    const area = WORLD.stationArea;
    for (const platform of area.platforms) {
      ctx.fillStyle = '#a99b7e'; ctx.fillRect(platform.x, platform.y, platform.w, platform.h);
      ctx.fillStyle = '#d0c09d'; ctx.fillRect(platform.x + 4, platform.y + 4, platform.w - 8, platform.h - 8);
      ctx.fillStyle = '#e1c77f'; ctx.fillRect(platform.x + 8, platform.y + 8, platform.w - 16, 4);
      ctx.fillStyle = '#4b5d50'; ctx.font = '700 11px system-ui'; ctx.textAlign = 'left'; ctx.fillText(platform.label, platform.x + 22, platform.y + 34);
      ctx.fillStyle = '#6d6654'; ctx.font = '10px system-ui'; ctx.fillText(platform.destination, platform.x + 112, platform.y + 34);
    }
    for (const track of area.tracks) {
      ctx.fillStyle = '#736b5a'; ctx.fillRect(track.x, track.y, track.w, track.h);
      ctx.fillStyle = '#554f45'; ctx.fillRect(track.x, track.y + 13, track.w, 5); ctx.fillRect(track.x, track.y + 42, track.w, 5);
      ctx.fillStyle = '#b5a080';
      for (let x = track.x + 8; x < track.x + track.w; x += 27) ctx.fillRect(x, track.y + 7, 7, 49);
    }
    const shelter = area.shelter;
    ctx.fillStyle = '#6b5944'; ctx.fillRect(shelter.x + 8, shelter.y + 13, 8, 32); ctx.fillRect(shelter.x + shelter.w - 16, shelter.y + 13, 8, 32);
    ctx.fillStyle = '#bd9e6c'; ctx.fillRect(shelter.x, shelter.y + 4, shelter.w, 12);
    ctx.fillStyle = '#8ba9a0'; ctx.fillRect(shelter.x + 13, shelter.y + 16, shelter.w - 26, 22);
    for (const bench of area.benches) drawProp({ x: bench.x, y: bench.y, type: 'bench' });
    for (const sign of area.signs) {
      ctx.fillStyle = '#4c5e52'; ctx.fillRect(sign.x, sign.y - 24, 62, 24);
      ctx.fillStyle = '#f3e4c1'; ctx.font = '700 9px system-ui'; ctx.textAlign = 'center'; ctx.fillText(sign.text, sign.x + 31, sign.y - 8);
    }
    for (const signal of area.signals) {
      ctx.fillStyle = '#615643'; ctx.fillRect(signal.x, signal.y, 5, 43);
      ctx.fillStyle = '#3c5047'; ctx.fillRect(signal.x - 5, signal.y - 2, 15, 19);
      ctx.fillStyle = '#d5b96e'; ctx.beginPath(); ctx.arc(signal.x + 2, signal.y + 7, 3, 0, Math.PI * 2); ctx.fill();
    }
    const train = area.train;
    ctx.fillStyle = '#344a45'; ctx.fillRect(train.x, train.y, train.w, train.h);
    ctx.fillStyle = '#7d9f98'; ctx.fillRect(train.x + 13, train.y + 8, train.w - 28, 22);
    for (let x = train.x + 24; x < train.x + train.w - 24; x += 61) {
      ctx.fillStyle = '#4d645d'; ctx.fillRect(x, train.y + 7, 5, 25);
    }
    ctx.fillStyle = '#d6bf8b'; ctx.fillRect(train.doorX - 18, train.y, 36, 27);
    ctx.fillStyle = '#66513e'; ctx.fillRect(train.doorX - 13, train.y + 2, 26, 25);
    ctx.fillStyle = '#f3e4c1'; ctx.font = '700 8px system-ui'; ctx.textAlign = 'center'; ctx.fillText('E · EINSTEIGEN', train.doorX, train.y - 4);
    for (const wheelX of [train.x + 45, train.x + 150, train.x + 260, train.x + 365, train.x + 435]) {
      ctx.fillStyle = '#393a34'; ctx.beginPath(); ctx.arc(wheelX, train.y + train.h - 1, 8, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#b5a080'; ctx.beginPath(); ctx.arc(wheelX, train.y + train.h - 1, 3, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = '#a35e4b'; ctx.fillRect(train.x + train.w - 12, train.y + 5, 12, 41);
    ctx.fillStyle = '#e1c77f'; ctx.beginPath(); ctx.arc(train.x + train.w - 6, train.y + 13, 3, 0, Math.PI * 2); ctx.fill();
    const board = area.departureBoard;
    ctx.fillStyle = '#615641'; ctx.fillRect(board.x, board.y + 11, 7, 54); ctx.fillRect(board.x + board.w - 7, board.y + 11, 7, 54);
    ctx.fillStyle = '#344b45'; ctx.fillRect(board.x - 6, board.y, board.w + 12, 48); ctx.strokeStyle = '#c5a873'; ctx.lineWidth = 3; ctx.strokeRect(board.x - 6, board.y, board.w + 12, 48);
    ctx.fillStyle = '#f3e4c1'; ctx.font = '700 8px system-ui'; ctx.textAlign = 'center'; ctx.fillText('ABFAHRTEN', board.x + board.w / 2, board.y + 13);
    ctx.font = '7px system-ui'; ctx.fillText('BERLIN · 10:15', board.x + board.w / 2, board.y + 26); ctx.fillText('POTSDAM · 10:30', board.x + board.w / 2, board.y + 39);
    ctx.textAlign = 'start';
    const bridge = area.footbridge;
    ctx.fillStyle = '#8c7b5b'; ctx.fillRect(bridge.x, bridge.y, bridge.w, bridge.h);
    ctx.fillStyle = '#d2bc8f'; ctx.fillRect(bridge.x + 5, bridge.y, bridge.w - 10, bridge.h);
    ctx.fillStyle = '#776748'; ctx.fillRect(bridge.x + 2, bridge.y, 5, bridge.h); ctx.fillRect(bridge.x + bridge.w - 7, bridge.y, 5, bridge.h);
    ctx.textAlign = 'start';
  }

  function drawTravelInterior(sceneId) {
    const scene = WORLDS[sceneId];
    ctx.fillStyle = '#6d8066'; ctx.fillRect(0, 0, scene.width, scene.height);
    ctx.fillStyle = '#9d896b'; ctx.fillRect(0, 0, scene.width, scene.height);
    ctx.fillStyle = sceneId === 'station' ? '#ded2b5' : '#cbbd9e'; ctx.fillRect(30, 30, scene.width - 60, scene.height - 60);
    ctx.globalAlpha = .2; ctx.strokeStyle = '#8c7a5d'; ctx.lineWidth = 1;
    for (let x = 42; x < scene.width - 30; x += 58) { ctx.beginPath(); ctx.moveTo(x, 32); ctx.lineTo(x, scene.height - 32); ctx.stroke(); }
    for (let y = 48; y < scene.height - 30; y += 48) { ctx.beginPath(); ctx.moveTo(32, y); ctx.lineTo(scene.width - 32, y); ctx.stroke(); }
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#596d68'; ctx.fillRect(0, 0, scene.width, 30); ctx.fillRect(0, 0, 30, scene.height); ctx.fillRect(scene.width - 30, 0, 30, scene.height);
    for (const window of scene.windows || []) {
      ctx.fillStyle = '#83a8a4'; ctx.fillRect(window.x, 6, window.w, 29); ctx.strokeStyle = '#e0c99c'; ctx.lineWidth = 5; ctx.strokeRect(window.x, 4, window.w, 34);
      ctx.fillStyle = '#e0c99c'; ctx.fillRect(window.x + window.w / 2 - 2, 6, 4, 29);
    }
    ctx.fillStyle = '#405852'; ctx.fillRect(300, 54, 300, 42); ctx.strokeStyle = '#c5a873'; ctx.lineWidth = 4; ctx.strokeRect(300, 54, 300, 42);
    ctx.fillStyle = '#f0dfb7'; ctx.font = '700 15px Georgia'; ctx.textAlign = 'center';
    ctx.fillText(sceneId === 'station' ? 'BAHNHOF DEUTSCHSTADT' : 'REGIONALZUG · WAGEN 1', 450, 81);
    if (sceneId === 'station') {
      ctx.fillStyle = '#344b45'; ctx.fillRect(345, 112, 210, 58); ctx.strokeStyle = '#c5a873'; ctx.lineWidth = 3; ctx.strokeRect(345, 112, 210, 58);
      ctx.fillStyle = '#fff0d5'; ctx.font = '700 10px system-ui'; ctx.fillText('ABFAHRTEN', 450, 128);
      ctx.font = '9px system-ui'; ctx.fillText('BERLIN  10:15  GLEIS 1', 450, 143); ctx.fillText('POTSDAM  10:30  GLEIS 2', 450, 158);
    } else {
      ctx.fillStyle = '#8ba9a0';
      for (const window of scene.windows || []) ctx.fillRect(window.x + 4, 10, window.w - 8, 23);
      ctx.fillStyle = '#344b45'; ctx.fillRect(385, 112, 130, 48); ctx.strokeStyle = '#c5a873'; ctx.lineWidth = 3; ctx.strokeRect(385, 112, 130, 48);
      ctx.fillStyle = '#fff0d5'; ctx.font = '700 10px system-ui'; ctx.fillText('NÄCHSTER HALT', 450, 130); ctx.font = '9px system-ui'; ctx.fillText('BERLIN', 450, 147);
    }
    for (const item of scene.furniture || []) {
      ctx.fillStyle = '#34453333'; ctx.fillRect(item.x + 5, item.y + 7, item.w, item.h);
      if (item.type === 'counter') {
        ctx.fillStyle = '#665643'; ctx.fillRect(item.x, item.y + 15, item.w, item.h - 15); ctx.fillStyle = '#b69b6c'; ctx.fillRect(item.x - 5, item.y, item.w + 10, 18);
        ctx.fillStyle = '#dfd0ad'; ctx.fillRect(item.x + 14, item.y + 35, item.w - 28, 4);
      } else if (item.type === 'bench' || item.type === 'seat') {
        ctx.fillStyle = item.type === 'seat' ? '#5b7169' : '#80694c'; ctx.fillRect(item.x, item.y, item.w, item.h - 9);
        ctx.fillStyle = item.type === 'seat' ? '#91a49a' : '#b4976a'; ctx.fillRect(item.x + 5, item.y - 12, item.w - 10, 16);
      } else if (item.type === 'rack') {
        ctx.fillStyle = '#645643'; ctx.fillRect(item.x, item.y, item.w, 8); ctx.fillStyle = '#b89b6a'; ctx.fillRect(item.x, item.y + 8, item.w, 5);
      } else {
        ctx.fillStyle = '#344b4a'; ctx.fillRect(item.x, item.y, item.w, item.h); ctx.fillStyle = '#91b6ab'; ctx.fillRect(item.x + 8, item.y + 8, item.w - 16, 20);
        ctx.fillStyle = '#d9bd80'; ctx.fillRect(item.x + 10, item.y + 41, item.w - 20, 7);
      }
    }
    ctx.fillStyle = '#554a39'; ctx.fillRect(402, 620, 96, 30); ctx.fillStyle = '#a77c55'; ctx.fillRect(411, 623, 78, 27);
    ctx.fillStyle = '#f0dfb7'; ctx.font = '700 9px system-ui'; ctx.textAlign = 'center'; ctx.fillText(sceneId === 'station' ? 'MARKTPLATZ' : 'BAHNSTEIG 1', 450, 641);
    for (const npc of scene.npcs || []) drawNpc(npc);
    if (sceneId === 'station') {
      ctx.fillStyle = '#344b45'; ctx.fillRect(692, 535, 84, 54); ctx.fillStyle = '#b89b6a'; ctx.fillRect(699, 541, 70, 42);
      ctx.fillStyle = '#fff0d5'; ctx.font = '700 8px system-ui'; ctx.textAlign = 'center'; ctx.fillText('ZUM ZUG →', 734, 559); ctx.fillText('BOARDING', 734, 572);
    }
    drawPlayer();
    ctx.textAlign = 'start'; ui.location.textContent = scene.location;
  }

  function drawTree(tree) {
    ctx.fillStyle = '#35452f55'; ctx.beginPath(); ctx.ellipse(tree.x + 7, tree.y + 14, tree.r * .95, tree.r * .65, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#70543a'; ctx.fillRect(tree.x - 5, tree.y - 4, 10, 29);
    ctx.fillStyle = tree.shade; ctx.beginPath(); ctx.arc(tree.x, tree.y - 8, tree.r, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#78936a'; ctx.globalAlpha = .6; ctx.beginPath(); ctx.arc(tree.x - tree.r * .28, tree.y - tree.r * .35, tree.r * .34, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
  }

  function drawProp(prop) {
    if (prop.type === 'fountain') {
      ctx.fillStyle = '#a29575'; ctx.beginPath(); ctx.ellipse(prop.x, prop.y + 14, 52, 27, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#749d9d'; ctx.beginPath(); ctx.ellipse(prop.x, prop.y + 6, 43, 20, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#a6c5ba'; ctx.beginPath(); ctx.ellipse(prop.x, prop.y + 5, 25, 10, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#879677'; ctx.fillRect(prop.x - 5, prop.y - 19, 10, 25);
    } else if (prop.type === 'bench') {
      ctx.fillStyle = '#795b3c'; ctx.fillRect(prop.x, prop.y, 58, 9); ctx.fillRect(prop.x + 3, prop.y - 8, 53, 7); ctx.fillRect(prop.x + 7, prop.y + 9, 5, 14); ctx.fillRect(prop.x + 47, prop.y + 9, 5, 14);
    } else {
      ctx.fillStyle = '#4d7448'; ctx.beginPath(); ctx.arc(prop.x, prop.y, 17, 0, Math.PI * 2); ctx.fill();
      for (let i = 0; i < 5; i++) { ctx.fillStyle = ['#e6bd81', '#e4d8a8', '#d89482'][i % 3]; ctx.beginPath(); ctx.arc(prop.x + Math.cos(i * 1.25) * 9, prop.y + Math.sin(i * 1.25) * 9, 3, 0, Math.PI * 2); ctx.fill(); }
    }
  }

  function drawCafeInterior(cameraX, cameraY, viewWidth, viewHeight) {
    ctx.fillStyle = '#6d8066'; ctx.fillRect(cameraX, cameraY, viewWidth, viewHeight);
    ctx.fillStyle = '#bda783'; ctx.fillRect(0, 0, CAFE.width, CAFE.height);
    ctx.fillStyle = '#d0bd96'; ctx.fillRect(30, 30, CAFE.width - 60, CAFE.height - 60);
    ctx.globalAlpha = .24; ctx.strokeStyle = '#9b8969'; ctx.lineWidth = 1;
    for (let x = 45; x < CAFE.width - 30; x += 52) { ctx.beginPath(); ctx.moveTo(x, 32); ctx.lineTo(x, CAFE.height - 32); ctx.stroke(); }
    for (let y = 54; y < CAFE.height - 30; y += 44) { ctx.beginPath(); ctx.moveTo(32, y); ctx.lineTo(CAFE.width - 32, y); ctx.stroke(); }
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#72806b'; ctx.fillRect(0, 0, CAFE.width, 30); ctx.fillRect(0, 0, 30, CAFE.height); ctx.fillRect(CAFE.width - 30, 0, 30, CAFE.height);
    ctx.fillStyle = '#596b59'; ctx.fillRect(0, 30, CAFE.width, 12);
    for (const window of CAFE.windows) {
      ctx.fillStyle = '#83a8a4'; ctx.fillRect(window.x, 6, window.w, 29);
      ctx.strokeStyle = '#e0c99c'; ctx.lineWidth = 5; ctx.strokeRect(window.x, 4, window.w, 34);
      ctx.fillStyle = '#e0c99c'; ctx.fillRect(window.x + window.w / 2 - 2, 6, 4, 29);
    }
    ctx.fillStyle = '#ebdfc3'; ctx.font = '700 15px system-ui'; ctx.textAlign = 'center'; ctx.fillText('CAFÉ AM PLATZ', CAFE.width / 2, 78);
    // A chalkboard menu, mounted above the service counter.
    ctx.fillStyle = '#493d30'; ctx.fillRect(368, 91, 164, 64);
    ctx.strokeStyle = '#c5a873'; ctx.lineWidth = 4; ctx.strokeRect(368, 91, 164, 64);
    ctx.fillStyle = '#f0dfb7'; ctx.font = '700 10px Georgia'; ctx.fillText('TAGESKARTE', 450, 107);
    ctx.font = '9px system-ui'; ctx.fillText('Kaffee · Wasser · Brot', 450, 125); ctx.fillText('Kuchen · Rechnung', 450, 141);

    for (const item of CAFE.furniture) {
      ctx.fillStyle = '#34453344'; ctx.fillRect(item.x + 5, item.y + 8, item.w, item.h);
      if (item.type === 'counter') {
        ctx.fillStyle = '#76563e'; ctx.fillRect(item.x, item.y + 15, item.w, item.h - 15);
        ctx.fillStyle = '#bc9465'; ctx.fillRect(item.x - 5, item.y, item.w + 10, 20);
        ctx.fillStyle = '#e4cfaa'; ctx.fillRect(item.x + 18, item.y + 30, item.w - 36, 5);
      } else if (item.type === 'display') {
        ctx.fillStyle = '#9e7250'; ctx.fillRect(item.x, item.y + 9, item.w, item.h - 9);
        ctx.fillStyle = '#b8d0ca'; ctx.globalAlpha = .7; ctx.fillRect(item.x + 4, item.y, item.w - 8, 14); ctx.globalAlpha = 1;
        for (let i = 0; i < 3; i++) { ctx.fillStyle = ['#d4a46e', '#c67a55', '#d8c08a'][i]; ctx.beginPath(); ctx.arc(item.x + 20 + i * 24, item.y + 21, 8, 0, Math.PI * 2); ctx.fill(); }
      } else if (item.type === 'machine') {
        ctx.fillStyle = '#425148'; ctx.fillRect(item.x, item.y + 6, item.w, item.h - 6);
        ctx.fillStyle = '#bf9f70'; ctx.fillRect(item.x + 5, item.y + 11, item.w - 10, 8);
        ctx.fillStyle = '#d7e1d6'; ctx.fillRect(item.x + 10, item.y + 22, item.w - 20, 7);
        ctx.fillStyle = '#755b42'; ctx.fillRect(item.x + 17, item.y + 34, 23, 4);
      } else if (item.type === 'table') {
        ctx.fillStyle = '#78563b'; ctx.fillRect(item.x + 9, item.y + 8, item.w - 18, item.h - 4);
        ctx.fillStyle = '#c09663'; ctx.fillRect(item.x, item.y, item.w, item.h - 12);
        ctx.fillStyle = '#e1c796'; ctx.beginPath(); ctx.ellipse(item.x + item.w / 2, item.y + 15, item.w * .3, 12, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#7b583a'; ctx.fillRect(item.x + 14, item.y + item.h - 14, 8, 20); ctx.fillRect(item.x + item.w - 22, item.y + item.h - 14, 8, 20);
      } else {
        ctx.fillStyle = '#8a6041'; ctx.fillRect(item.x, item.y, item.w, item.h);
        ctx.fillStyle = '#bd9566'; ctx.fillRect(item.x + 4, item.y + 4, item.w - 8, item.h - 8);
      }
    }
    // The lower wall is split around the visible, walkable exit.
    ctx.fillStyle = '#554a39'; ctx.fillRect(402, 620, 96, 30);
    ctx.fillStyle = '#a77c55'; ctx.fillRect(411, 623, 78, 27);
    ctx.fillStyle = '#e2c797'; ctx.font = '600 9px system-ui'; ctx.fillText('MARKTPLATZ', 450, 646);
    ctx.textAlign = 'start';
    for (const npc of CAFE.npcs) drawNpc(npc);
    drawPlayer();
    ui.location.textContent = CAFE.location;
  }

  function drawBakeryInterior(cameraX, cameraY, viewWidth, viewHeight) {
    const bakery = WORLDS.bakery;
    ctx.fillStyle = '#6d8066'; ctx.fillRect(cameraX, cameraY, viewWidth, viewHeight);
    ctx.fillStyle = '#bda783'; ctx.fillRect(0, 0, bakery.width, bakery.height);
    ctx.fillStyle = '#d8c7a1'; ctx.fillRect(30, 30, bakery.width - 60, bakery.height - 60);
    ctx.globalAlpha = .2; ctx.strokeStyle = '#9b8969'; ctx.lineWidth = 1;
    for (let x = 38; x < bakery.width - 30; x += 58) { ctx.beginPath(); ctx.moveTo(x, 32); ctx.lineTo(x, bakery.height - 32); ctx.stroke(); }
    for (let y = 50; y < bakery.height - 30; y += 50) { ctx.beginPath(); ctx.moveTo(32, y); ctx.lineTo(bakery.width - 32, y); ctx.stroke(); }
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#8b684c'; ctx.fillRect(0, 0, bakery.width, 30); ctx.fillRect(0, 0, 30, bakery.height); ctx.fillRect(bakery.width - 30, 0, 30, bakery.height);
    for (const window of bakery.windows) {
      ctx.fillStyle = '#83a8a4'; ctx.fillRect(window.x, 6, window.w, 29);
      ctx.strokeStyle = '#e0c99c'; ctx.lineWidth = 5; ctx.strokeRect(window.x, 4, window.w, 34);
      ctx.fillStyle = '#e0c99c'; ctx.fillRect(window.x + window.w / 2 - 2, 6, 4, 29);
    }
    ctx.fillStyle = '#594233'; ctx.fillRect(342, 55, 216, 38);
    ctx.strokeStyle = '#c5a873'; ctx.lineWidth = 4; ctx.strokeRect(342, 55, 216, 38);
    ctx.fillStyle = '#f0dfb7'; ctx.font = '700 14px Georgia'; ctx.textAlign = 'center'; ctx.fillText('BÄCKEREI AM MARKTPLATZ', 450, 80);
    ctx.fillStyle = '#493d30'; ctx.fillRect(360, 104, 176, 70);
    ctx.strokeStyle = '#c5a873'; ctx.lineWidth = 4; ctx.strokeRect(360, 104, 176, 70);
    ctx.fillStyle = '#f0dfb7'; ctx.font = '700 10px Georgia'; ctx.fillText('PREISE · TAGESANGEBOT', 448, 121);
    ctx.font = '9px system-ui'; ctx.fillText('Brot  2 €   ·   Brötchen  1 €', 448, 142); ctx.fillText('Frisch aus dem Ofen', 448, 158);
    for (const item of bakery.furniture) {
      ctx.fillStyle = '#34453344'; ctx.fillRect(item.x + 5, item.y + 8, item.w, item.h);
      if (item.type === 'counter') {
        ctx.fillStyle = '#76563e'; ctx.fillRect(item.x, item.y + 14, item.w, item.h - 14);
        ctx.fillStyle = '#bc9465'; ctx.fillRect(item.x - 5, item.y, item.w + 10, 20);
        ctx.fillStyle = '#e4cfaa'; ctx.fillRect(item.x + 16, item.y + 31, item.w - 32, 5);
      } else if (item.type === 'display') {
        ctx.fillStyle = '#9e7250'; ctx.fillRect(item.x, item.y + 9, item.w, item.h - 9);
        ctx.fillStyle = '#b8d0ca'; ctx.globalAlpha = .72; ctx.fillRect(item.x + 4, item.y, item.w - 8, 14); ctx.globalAlpha = 1;
        for (let i = 0; i < 4; i++) { ctx.fillStyle = ['#d4a46e', '#c67a55', '#d8c08a', '#a9674d'][i]; ctx.beginPath(); ctx.ellipse(item.x + 20 + i * 25, item.y + 34, 10, 7, 0, 0, Math.PI * 2); ctx.fill(); }
      } else if (item.type === 'shelf') {
        ctx.fillStyle = '#76563e'; ctx.fillRect(item.x, item.y, item.w, item.h);
        ctx.fillStyle = '#bd966a'; ctx.fillRect(item.x + 5, item.y + 6, item.w - 10, 7); ctx.fillRect(item.x + 5, item.y + item.h - 12, item.w - 10, 7);
        for (let i = 0; i < 5; i++) { ctx.fillStyle = ['#d4a46e', '#c67a55', '#d8c08a'][i % 3]; ctx.beginPath(); ctx.ellipse(item.x + 24 + i * 34, item.y + 29, 11, 8, 0, 0, Math.PI * 2); ctx.fill(); }
      } else if (item.type === 'table') {
        ctx.fillStyle = '#c09663'; ctx.fillRect(item.x, item.y, item.w, item.h - 12);
        ctx.fillStyle = '#e1c796'; ctx.beginPath(); ctx.ellipse(item.x + item.w / 2, item.y + 15, item.w * .3, 12, 0, 0, Math.PI * 2); ctx.fill();
      } else {
        ctx.fillStyle = '#8a6041'; ctx.fillRect(item.x, item.y, item.w, item.h);
        ctx.fillStyle = '#bd9566'; ctx.fillRect(item.x + 4, item.y + 4, item.w - 8, item.h - 8);
      }
    }
    // Leave the lower wall open at the data-defined entrance.
    ctx.fillStyle = '#554a39'; ctx.fillRect(402, 620, 96, 30);
    ctx.fillStyle = '#a77c55'; ctx.fillRect(411, 623, 78, 27);
    ctx.fillStyle = '#e2c797'; ctx.font = '600 9px system-ui'; ctx.fillText('MARKTPLATZ', 450, 646);
    ctx.textAlign = 'start';
    for (const npc of bakery.npcs) drawNpc(npc);
    drawPlayer();
    ui.location.textContent = bakery.location;
  }

  function drawBankInterior(cameraX, cameraY, viewWidth, viewHeight) {
    const bank = WORLDS.bank;
    ctx.fillStyle = '#6d8066'; ctx.fillRect(cameraX, cameraY, viewWidth, viewHeight);
    ctx.fillStyle = '#bba982'; ctx.fillRect(0, 0, bank.width, bank.height);
    ctx.fillStyle = '#ded2b5'; ctx.fillRect(30, 30, bank.width - 60, bank.height - 60);
    ctx.globalAlpha = .18; ctx.strokeStyle = '#988a70'; ctx.lineWidth = 1;
    for (let x = 45; x < bank.width - 30; x += 58) { ctx.beginPath(); ctx.moveTo(x, 32); ctx.lineTo(x, bank.height - 32); ctx.stroke(); }
    for (let y = 52; y < bank.height - 30; y += 48) { ctx.beginPath(); ctx.moveTo(32, y); ctx.lineTo(bank.width - 32, y); ctx.stroke(); }
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#596d68'; ctx.fillRect(0, 0, bank.width, 30); ctx.fillRect(0, 0, 30, bank.height); ctx.fillRect(bank.width - 30, 0, 30, bank.height);
    for (const window of bank.windows) {
      ctx.fillStyle = '#83a8a4'; ctx.fillRect(window.x, 6, window.w, 29);
      ctx.strokeStyle = '#e0c99c'; ctx.lineWidth = 5; ctx.strokeRect(window.x, 4, window.w, 34);
      ctx.fillStyle = '#e0c99c'; ctx.fillRect(window.x + window.w / 2 - 2, 6, 4, 29);
    }
    ctx.fillStyle = '#405852'; ctx.fillRect(300, 54, 300, 42);
    ctx.strokeStyle = '#c5a873'; ctx.lineWidth = 4; ctx.strokeRect(300, 54, 300, 42);
    ctx.fillStyle = '#f0dfb7'; ctx.font = '700 15px Georgia'; ctx.textAlign = 'center'; ctx.fillText('STADTBANK DEUTSCHSTADT', 450, 81);
    ctx.fillStyle = '#405852'; ctx.fillRect(365, 105, 170, 54);
    ctx.strokeStyle = '#c5a873'; ctx.lineWidth = 3; ctx.strokeRect(365, 105, 170, 54);
    ctx.fillStyle = '#f0dfb7'; ctx.font = '700 11px Georgia'; ctx.fillText('INFORMATION', 450, 127);
    ctx.font = '9px system-ui'; ctx.fillText('Öffnungszeiten · Wortschatz', 450, 145);
    for (const item of bank.furniture) {
      ctx.fillStyle = '#34453333'; ctx.fillRect(item.x + 5, item.y + 7, item.w, item.h);
      if (item.type === 'counter') {
        ctx.fillStyle = '#665643'; ctx.fillRect(item.x, item.y + 14, item.w, item.h - 14);
        ctx.fillStyle = '#b69b6c'; ctx.fillRect(item.x - 5, item.y, item.w + 10, 18);
        ctx.fillStyle = '#dfd0ad'; ctx.fillRect(item.x + 16, item.y + 32, item.w - 32, 4);
      } else if (item.type === 'reception') {
        ctx.fillStyle = '#405852'; ctx.fillRect(item.x, item.y + 12, item.w, item.h - 12);
        ctx.fillStyle = '#b69b6c'; ctx.fillRect(item.x - 4, item.y, item.w + 8, 16);
        ctx.fillStyle = '#f0dfb7'; ctx.font = '700 9px system-ui'; ctx.textAlign = 'center'; ctx.fillText('EMPFANG', item.x + item.w / 2, item.y + 43);
      } else if (item.type === 'atm') {
        ctx.fillStyle = '#344b4a'; ctx.fillRect(item.x, item.y, item.w, item.h);
        ctx.fillStyle = '#c2ab79'; ctx.fillRect(item.x + 12, item.y + 14, item.w - 24, 28);
        ctx.fillStyle = '#9bb8ae'; ctx.fillRect(item.x + 19, item.y + 20, item.w - 38, 13);
        ctx.fillStyle = '#ded2b5'; ctx.font = '700 8px system-ui'; ctx.textAlign = 'center'; ctx.fillText('Geldautomat', item.x + item.w / 2, item.y + 58);
        ctx.fillStyle = '#d9bd80'; ctx.fillRect(item.x + 17, item.y + 73, item.w - 34, 7);
      } else if (item.type === 'bench') {
        ctx.fillStyle = '#80694c'; ctx.fillRect(item.x, item.y, item.w, 12);
        ctx.fillStyle = '#9d815d'; ctx.fillRect(item.x + 5, item.y - 17, item.w - 10, 18);
        ctx.fillStyle = '#6c573f'; ctx.fillRect(item.x + 12, item.y + 12, 8, 23); ctx.fillRect(item.x + item.w - 20, item.y + 12, 8, 23);
      } else if (item.type === 'table') {
        ctx.fillStyle = '#8c7553'; ctx.fillRect(item.x, item.y, item.w, item.h - 9);
        ctx.fillStyle = '#c5ac7d'; ctx.fillRect(item.x + 4, item.y + 4, item.w - 8, 9);
      } else {
        ctx.fillStyle = '#8a6041'; ctx.fillRect(item.x, item.y, item.w, item.h);
        ctx.fillStyle = '#bd9566'; ctx.fillRect(item.x + 4, item.y + 4, item.w - 8, item.h - 8);
      }
    }
    ctx.fillStyle = '#554a39'; ctx.fillRect(402, 620, 96, 30);
    ctx.fillStyle = '#a77c55'; ctx.fillRect(411, 623, 78, 27);
    ctx.fillStyle = '#e2c797'; ctx.font = '600 9px system-ui'; ctx.fillText('MARKTPLATZ', 450, 646);
    ctx.textAlign = 'start';
    for (const npc of bank.npcs) drawNpc(npc);
    drawPlayer();
    ui.location.textContent = bank.location;
  }

  function drawSideMissionInterior(sceneId, cameraX, cameraY, viewWidth, viewHeight) {
    const scene = WORLDS[sceneId];
    ctx.fillStyle = '#71866b'; ctx.fillRect(cameraX, cameraY, viewWidth, viewHeight);
    ctx.fillStyle = '#9d896b'; ctx.fillRect(0, 0, scene.width, scene.height);
    ctx.fillStyle = sceneId === 'wohnhaus' ? '#d7c8a4' : '#ded2b5'; ctx.fillRect(30, 30, scene.width - 60, scene.height - 60);
    ctx.globalAlpha = .15; ctx.strokeStyle = '#8c7a5d'; ctx.lineWidth = 1;
    for (let x = 42; x < scene.width - 30; x += 58) { ctx.beginPath(); ctx.moveTo(x, 32); ctx.lineTo(x, scene.height - 32); ctx.stroke(); }
    for (let y = 48; y < scene.height - 30; y += 48) { ctx.beginPath(); ctx.moveTo(32, y); ctx.lineTo(scene.width - 32, y); ctx.stroke(); }
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#596d68'; ctx.fillRect(0, 0, scene.width, 30); ctx.fillRect(0, 0, 30, scene.height); ctx.fillRect(scene.width - 30, 0, 30, scene.height);
    for (const window of scene.windows) {
      ctx.fillStyle = '#83a8a4'; ctx.fillRect(window.x, 6, window.w, 29); ctx.strokeStyle = '#e0c99c'; ctx.lineWidth = 5; ctx.strokeRect(window.x, 4, window.w, 34);
      ctx.fillStyle = '#e0c99c'; ctx.fillRect(window.x + window.w / 2 - 2, 6, 4, 29);
    }
    ctx.fillStyle = '#405852'; ctx.fillRect(300, 54, 300, 42); ctx.strokeStyle = '#c5a873'; ctx.lineWidth = 4; ctx.strokeRect(300, 54, 300, 42);
    ctx.fillStyle = '#f0dfb7'; ctx.font = '700 15px Georgia'; ctx.textAlign = 'center'; ctx.fillText(sceneId === 'rathaus' ? 'RATHAUS DEUTSCHSTADT' : 'LUKAS’ WOHNHAUS', 450, 81);
    if (sceneId === 'rathaus') {
      ctx.fillStyle = '#4a5f50'; ctx.fillRect(330, 115, 240, 52); ctx.strokeStyle = '#c5a873'; ctx.lineWidth = 3; ctx.strokeRect(330, 115, 240, 52);
      ctx.fillStyle = '#fff0d5'; ctx.font = '700 11px system-ui'; ctx.fillText('BÜRO 1 · AUSKUNFT', 450, 136); ctx.fillText('BÜRO 2 · TERMINE', 450, 153);
    } else {
      ctx.fillStyle = '#9c7553'; ctx.fillRect(45, 70, 810, 5); ctx.fillStyle = '#74573e'; ctx.font = '700 10px system-ui'; ctx.fillText('WOHNZIMMER', 245, 195); ctx.fillText('KÜCHE', 700, 365);
      ctx.fillStyle = '#8b6041'; ctx.fillRect(675, 418, 48, 48); ctx.fillStyle = '#be8d5e'; ctx.fillRect(681, 424, 36, 40);
    }
    for (const item of scene.furniture || []) {
      ctx.fillStyle = '#34453333'; ctx.fillRect(item.x + 5, item.y + 7, item.w, item.h);
      if (item.type === 'table') { ctx.fillStyle = '#8c6042'; ctx.fillRect(item.x, item.y, item.w, item.h - 10); ctx.fillStyle = '#c09663'; ctx.fillRect(item.x + 4, item.y + 4, item.w - 8, 14); }
      else if (item.type === 'bench') { ctx.fillStyle = '#80694c'; ctx.fillRect(item.x, item.y, item.w, 12); ctx.fillStyle = '#9d815d'; ctx.fillRect(item.x + 5, item.y - 17, item.w - 10, 18); }
      else if (item.type === 'reception' || item.type === 'counter') { ctx.fillStyle = '#665643'; ctx.fillRect(item.x, item.y + 14, item.w, item.h - 14); ctx.fillStyle = '#b69b6c'; ctx.fillRect(item.x - 5, item.y, item.w + 10, 18); }
      else { ctx.fillStyle = '#795c46'; ctx.fillRect(item.x, item.y, item.w, item.h); ctx.fillStyle = '#b68b5f'; ctx.fillRect(item.x + 5, item.y + 5, item.w - 10, item.h - 10); }
    }
    ctx.fillStyle = '#554a39'; ctx.fillRect(402, 620, 96, 30); ctx.fillStyle = '#a77c55'; ctx.fillRect(411, 623, 78, 27);
    ctx.fillStyle = '#e2c797'; ctx.font = '600 9px system-ui'; ctx.fillText('AUSGANG →', 450, 641); ctx.textAlign = 'start';
    for (const npc of scene.npcs) drawNpc(npc);
    drawPlayer(); ui.location.textContent = scene.location;
  }

  function drawSupermarketInterior(cameraX = 0, cameraY = 0, viewWidth = WORLDS.supermarket.width, viewHeight = WORLDS.supermarket.height) {
    const market = WORLDS.supermarket;
    ctx.fillStyle = '#6d8066'; ctx.fillRect(cameraX, cameraY, viewWidth, viewHeight);
    ctx.fillStyle = '#98876b'; ctx.fillRect(0, 0, market.width, market.height);
    ctx.fillStyle = '#cbbd9e'; ctx.fillRect(30, 30, market.width - 60, market.height - 60);
    ctx.fillStyle = '#d8c9a8'; ctx.fillRect(36, 43, market.width - 72, market.height - 87);
    ctx.globalAlpha = .14; ctx.strokeStyle = '#8c7a5d'; ctx.lineWidth = 1;
    for (let x = 45; x < market.width - 30; x += 52) { ctx.beginPath(); ctx.moveTo(x, 40); ctx.lineTo(x, market.height - 40); ctx.stroke(); }
    for (let y = 52; y < market.height - 30; y += 44) { ctx.beginPath(); ctx.moveTo(32, y); ctx.lineTo(market.width - 32, y); ctx.stroke(); }
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#596d68'; ctx.fillRect(0, 0, market.width, 30); ctx.fillRect(0, 0, 30, market.height); ctx.fillRect(market.width - 30, 0, 30, market.height);
    for (const window of market.windows) {
      ctx.fillStyle = '#83a8a4'; ctx.fillRect(window.x, 6, window.w, 29);
      ctx.strokeStyle = '#e0c99c'; ctx.lineWidth = 5; ctx.strokeRect(window.x, 4, window.w, 34);
      ctx.fillStyle = '#e0c99c'; ctx.fillRect(window.x + window.w / 2 - 2, 6, 4, 29);
    }
    ctx.fillStyle = '#334c43'; ctx.fillRect(300, 48, 300, 52);
    ctx.fillStyle = '#b89c6a'; ctx.fillRect(306, 54, 288, 40);
    ctx.fillStyle = '#344b42'; ctx.fillRect(311, 58, 278, 32);
    ctx.fillStyle = '#f0dfb7'; ctx.font = '700 16px Georgia'; ctx.textAlign = 'center'; ctx.fillText('SUPERMARKT  ·  WEBER', 450, 79);
    for (const item of market.furniture) {
      ctx.fillStyle = '#34453333'; ctx.fillRect(item.x + 5, item.y + 7, item.w, item.h);
      if (item.type === 'shelf') {
        ctx.fillStyle = '#63503c'; ctx.fillRect(item.x + 4, item.y + 8, item.w, item.h);
        ctx.fillStyle = '#8e6b48'; ctx.fillRect(item.x, item.y + 3, item.w, item.h - 8);
        ctx.fillStyle = '#d0ae78'; ctx.fillRect(item.x - 3, item.y, item.w + 6, 9); ctx.fillRect(item.x + 4, item.y + item.h - 13, item.w - 8, 7);
        ctx.fillStyle = '#e2cfaa'; ctx.fillRect(item.x + 4, item.y + 27, item.w - 8, 3);
        for (let i = 0; i < 6; i++) {
          const colors = item.id === 'produce-shelf' ? ['#bf6651', '#d9b65f', '#739362'] : item.id === 'bread-shelf' ? ['#c28b4e', '#d7ab68', '#a96849'] : item.id === 'household-shelf' ? ['#91a99b', '#c28c67', '#70868b'] : ['#d9e4d5', '#d2c78a', '#b6c8bb'];
          ctx.fillStyle = colors[i % colors.length];
          if (item.id === 'drink-shelf' || item.id === 'household-shelf') {
            const bx = item.x + 17 + i * 32;
            ctx.fillRect(bx + 4, item.y + 17, item.id === 'household-shelf' ? 17 : 13, 27); ctx.fillRect(bx + 7, item.y + 13, 7, 5);
            ctx.fillStyle = '#f1dfbd'; ctx.fillRect(bx + 5, item.y + 28, 11, 7);
          } else if (item.id === 'bread-shelf') {
            ctx.beginPath(); ctx.ellipse(item.x + 21 + i * 34, item.y + 33, 13, 7, 0, Math.PI, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = '#f2d7a3'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(item.x + 17 + i * 34, item.y + 31); ctx.lineTo(item.x + 25 + i * 34, item.y + 27); ctx.stroke();
          } else { ctx.beginPath(); ctx.ellipse(item.x + 22 + i * 34, item.y + 32, 10, 8, 0, 0, Math.PI * 2); ctx.fill(); }
        }
      } else if (item.type === 'counter') {
        ctx.fillStyle = '#514c3d'; ctx.fillRect(item.x, item.y + 17, item.w, item.h - 17);
        ctx.fillStyle = '#b89b6a'; ctx.fillRect(item.x - 7, item.y, item.w + 14, 21);
        ctx.fillStyle = '#dfd0ad'; ctx.fillRect(item.x + 13, item.y + 34, item.w - 26, 5);
        ctx.fillStyle = '#374b44'; ctx.fillRect(item.x + 126, item.y - 11, 42, 25);
        ctx.fillStyle = '#9db9a8'; ctx.fillRect(item.x + 131, item.y - 7, 32, 15);
        ctx.fillStyle = '#f0dfb7'; ctx.font = '700 9px system-ui'; ctx.textAlign = 'center'; ctx.fillText('KASSE', item.x + item.w / 2, item.y + 62);
      } else {
        ctx.fillStyle = '#344b4a'; ctx.fillRect(item.x, item.y, item.w, item.h);
        ctx.fillStyle = '#91b6ab'; ctx.fillRect(item.x + 7, item.y + 7, item.w - 14, 13);
        ctx.fillStyle = '#d9bd80'; ctx.fillRect(item.x + 8, item.y + 27, item.w - 16, 6);
      }
    }
    // Hanging aisle markers distinguish the stocked sections without cluttering paths.
    const shelfColors = { 'produce-shelf': '#5d744e', 'bread-shelf': '#9a6946', 'drink-shelf': '#526f78', 'middle-shelf': '#79836a', 'household-shelf': '#586b63' };
    for (const shelf of market.furniture.filter(item => item.type === 'shelf' && item.sign)) {
      const y = shelf.y - 21;
      ctx.fillStyle = '#31443b'; ctx.fillRect(shelf.x, y, shelf.w, 20);
      ctx.fillStyle = shelfColors[shelf.id] || '#586b63'; ctx.fillRect(shelf.x + 2, y + 2, shelf.w - 4, 16);
      ctx.fillStyle = '#fff0d5'; ctx.font = '700 9px system-ui'; ctx.textAlign = 'center'; ctx.fillText(shelf.sign, shelf.x + shelf.w / 2, y + 14);
    }
    // Clearly framed entrance, welcome mat and checkout queue lane.
    ctx.fillStyle = '#785b42'; ctx.fillRect(401, 620, 98, 30);
    ctx.fillStyle = '#b89b6c'; ctx.fillRect(410, 622, 80, 28);
    ctx.fillStyle = '#f0dfb7'; ctx.font = '700 9px system-ui'; ctx.textAlign = 'center'; ctx.fillText('AUSGANG  →', 450, 641);
    ctx.fillStyle = '#b6a27e'; ctx.globalAlpha = .35;
    for (let y = 245; y < 620; y += 32) ctx.fillRect(575, y, 3, 16);
    ctx.globalAlpha = 1; ctx.textAlign = 'start';
  }

  function drawNpc(npc) {
    ctx.fillStyle = '#25362a55'; ctx.beginPath(); ctx.ellipse(npc.x, npc.y + 14, 17, 8, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#473c32'; ctx.fillRect(npc.x - 8, npc.y + 18, 6, 8); ctx.fillRect(npc.x + 2, npc.y + 18, 6, 8);
    ctx.fillStyle = npc.color; ctx.beginPath(); ctx.roundRect(npc.x - 13, npc.y - 4, 26, 26, 7); ctx.fill();
    ctx.fillStyle = '#f0d2ad'; ctx.fillRect(npc.x - 4, npc.y + 4, 8, 9);
    ctx.fillStyle = '#e9c29b'; ctx.beginPath(); ctx.arc(npc.x, npc.y - 14, 9, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = npc.hair; ctx.beginPath(); ctx.arc(npc.x, npc.y - 17, 9, Math.PI, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#4c4037'; ctx.fillRect(npc.x - 5, npc.y - 13, 2, 2); ctx.fillRect(npc.x + 3, npc.y - 13, 2, 2);
    drawNameplate(npc.name, npc.x, npc.y - 29);
  }

  function drawNameplate(name, x, y) {
    ctx.save(); ctx.font = '600 10px system-ui'; ctx.textAlign = 'center';
    const width = Math.max(32, ctx.measureText(name).width + 12);
    ctx.fillStyle = '#20332ddd'; ctx.beginPath(); ctx.roundRect(x - width / 2, y - 11, width, 16, 6); ctx.fill();
    ctx.strokeStyle = '#d8bd8466'; ctx.lineWidth = 1; ctx.stroke();
    ctx.fillStyle = '#fff2d8'; ctx.fillText(name, x, y); ctx.restore();
  }

  function drawPlayer(includeRemotePlayers = true) {
    if (includeRemotePlayers) drawRemotePlayers();
    ctx.fillStyle = '#26362c66'; ctx.beginPath(); ctx.ellipse(state.x, state.y + 14, 17, 8, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#473c32'; ctx.fillRect(state.x - 8, state.y + 18, 6, 8); ctx.fillRect(state.x + 2, state.y + 18, 6, 8);
    ctx.fillStyle = '#577e88'; ctx.beginPath(); ctx.roundRect(state.x - 13, state.y - 4, 26, 26, 7); ctx.fill();
    ctx.fillStyle = '#d8bd84'; ctx.fillRect(state.x - 4, state.y + 4, 8, 9);
    ctx.fillStyle = '#f0c59a'; ctx.beginPath(); ctx.arc(state.x, state.y - 14, 9, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#523e34'; ctx.beginPath(); ctx.arc(state.x, state.y - 17, 9, Math.PI, Math.PI * 2); ctx.fill();
    drawNameplate(state.name, state.x, state.y + 42);
  }

  function drawRemotePlayers() {
    for (const player of window.DeutschstadtMultiplayer.playersInScene(remotePlayers.values(), state.sceneId, remotePlayerId)) {
      drawRemotePlayer(player);
    }
  }

  function drawRemotePlayer(player) {
    ctx.fillStyle = '#26362c66'; ctx.beginPath(); ctx.ellipse(player.x, player.y + 14, 17, 8, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#463b4a'; ctx.fillRect(player.x - 8, player.y + 18, 6, 8); ctx.fillRect(player.x + 2, player.y + 18, 6, 8);
    ctx.fillStyle = '#9b83a4'; ctx.beginPath(); ctx.roundRect(player.x - 13, player.y - 4, 26, 26, 7); ctx.fill();
    ctx.fillStyle = '#ddc8e0'; ctx.fillRect(player.x - 4, player.y + 4, 8, 9);
    ctx.fillStyle = '#f0c59a'; ctx.beginPath(); ctx.arc(player.x, player.y - 14, 9, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#493d50'; ctx.beginPath(); ctx.arc(player.x, player.y - 17, 9, Math.PI, Math.PI * 2); ctx.fill();
    drawNameplate(player.name, player.x, player.y + 42);
  }

  function renderTown() {
    ctx.drawImage(getTownArtLayer(), 0, 0);
    drawRailwayDistrict();
    const objects = [
      ...props.map(prop => ({ y: prop.y + (prop.type === 'fountain' ? 25 : 18), order: 0, draw: () => drawProp(prop) })),
      ...trees.map(tree => ({ y: tree.y + 22, order: 0, draw: () => drawTree(tree) })),
      // The rendered base sits at the entrance depth: actors approach from below
      // and can pass visually in front of a doorway, while actors behind the wall
      // are naturally occluded by the whole building illustration.
      ...buildings.map(building => ({ y: building.y + building.h - 38, order: 0, draw: () => drawBuilding(building) })),
      { y: WORLD.marketArea.y + 40, order: 1, draw: () => drawMarketBanner(WORLD.marketArea) },
      ...WORLD.marketStalls.map(stall => ({ y: stall.y + stall.h, order: 0, draw: () => drawMarketStall(stall) })),
      ...npcs.map(npc => ({ y: npc.y + 26, order: 2, draw: () => drawNpc(npc) })),
      ...window.DeutschstadtMultiplayer.playersInScene(remotePlayers.values(), state.sceneId, remotePlayerId)
        .map(player => ({ y: player.y + 26, order: 2, draw: () => drawRemotePlayer(player) })),
      { y: state.y + 26, order: 3, draw: () => drawPlayer(false) }
    ];
    objects.sort((a, b) => a.y - b.y || a.order - b.order);
    for (const object of objects) object.draw();
    if (state.x > 1580 && state.y > 600) ui.location.textContent = 'BAHNHOF · GLEISE';
    else if (state.x < 430 && state.y < 410) ui.location.textContent = 'BÄCKEREIVIERTEL';
    else if (state.x > 1260 && state.y >= 280 && state.y < 460) ui.location.textContent = 'STADTBANK';
    else if (state.x > 1000 && state.y < 410) ui.location.textContent = 'CAFÉGASSE';
    else if (state.x > 1000 && state.y > 640) ui.location.textContent = 'WOCHENMARKT';
    else if (state.y < 410) ui.location.textContent = 'RATHAUSGASSE';
    else if (state.y > 650) ui.location.textContent = 'BLUMENVIERTEL';
    else ui.location.textContent = 'MARKTPLATZ';
  }

  function render() {
    if (mode !== 'game' || !canvas.width || !canvas.height) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = canvas.width / dpr, height = canvas.height / dpr;
    const scale = Math.min(width / 900, height / 570, 1.18);
    const viewWidth = width / scale, viewHeight = height / scale;
    const scene = Object.hasOwn(WORLDS, state.sceneId) ? WORLDS[state.sceneId] : WORLD;
    const cameraX = scene.width > viewWidth ? clamp(state.x - viewWidth / 2, 0, scene.width - viewWidth) : (scene.width - viewWidth) / 2;
    const cameraY = scene.height > viewHeight ? clamp(state.y - viewHeight / 2, 0, scene.height - viewHeight) : (scene.height - viewHeight) / 2;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(dpr * scale, 0, 0, dpr * scale, -cameraX * dpr * scale, -cameraY * dpr * scale);
    if (state.sceneId === 'cafe') drawCafeInterior(cameraX, cameraY, viewWidth, viewHeight);
    else if (state.sceneId === 'rathaus' || state.sceneId === 'wohnhaus') drawSideMissionInterior(state.sceneId, cameraX, cameraY, viewWidth, viewHeight);
    else if (state.sceneId === 'supermarket') {
      ctx.drawImage(getSupermarketArtLayer(), 0, 0);
      for (const npc of WORLDS.supermarket.npcs) drawNpc(npc);
      drawPlayer();
      ui.location.textContent = WORLDS.supermarket.location;
    }
    else if (state.sceneId === 'bakery') drawBakeryInterior(cameraX, cameraY, viewWidth, viewHeight);
    else if (state.sceneId === 'bank') drawBankInterior(cameraX, cameraY, viewWidth, viewHeight);
    else if (state.sceneId === 'station' || state.sceneId === 'train') drawTravelInterior(state.sceneId);
    else renderTown();
    drawMissionMarker();
    drawDirectionsMarker();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }

  function frame(timestamp) {
    const dt = Math.min((timestamp - lastFrame) / 1000 || 0, .05); lastFrame = timestamp;
    movePlayer(dt);
    if (mode === 'game') {
      updateDirectionsRoute();
      const nextTarget = currentInteractionTarget();
      updateMissionCard();
      if (nextTarget?.id !== nearbyTarget?.id || nextTarget?.type !== nearbyTarget?.type) {
        nearbyTarget = nextTarget;
        if (nearbyTarget) {
          ui.nearby.textContent = nearbyTarget.type === 'door' ? (nearbyTarget.value.name || (nearbyTarget.value.targetSceneId === 'town' ? 'town' : nearbyTarget.value.targetSceneId)) : nearbyTarget.value.name;
          ui.interactionAction.textContent = nearbyTarget.type === 'door' ? (nearbyTarget.value.action || (nearbyTarget.value.targetSceneId === 'town' ? 'Leave' : 'Enter')) : nearbyTarget.type === 'journal' ? 'Open' : nearbyTarget.type === 'object' ? nearbyTarget.value.prompt : 'Talk to';
          ui.interaction.classList.remove('hidden');
        }
        else ui.interaction.classList.add('hidden');
      }
      render();
      if (dirty && timestamp - lastSavedAt > 900) saveGame();
    }
    requestAnimationFrame(frame);
  }

  ui.newGame.addEventListener('click', requestNewGame);
  ui.continueGame.addEventListener('click', () => { const saved = readSave(); if (saved) startGame(saved, 'continue'); else { refreshMenu(); showToast('No saved journey found.'); } });
  ui.practiceGerman.addEventListener('click', () => startGame(readSave() || freshState(cleanName(ui.nameInput.value)), 'practice'));
  ui.resetProgress.addEventListener('click', requestResetProgress);
  document.querySelector('#settings-button').addEventListener('click', showSettings);
  document.querySelector('#help-button').addEventListener('click', showHelp);
  ui.pause.addEventListener('click', pauseGame);
  ui.journal.addEventListener('click', () => {
    if (offlineSimulation) { showToast('Learning progress is paused in local simulation mode.'); return; }
    openLearningJournal();
  });
  ui.multiplayerConnect.addEventListener('click', openMultiplayerPanel);
  ui.multiplayerMenuButton.addEventListener('click', openMultiplayerPanel);
  ui.missionToggle.addEventListener('click', () => { missionMinimized = !missionMinimized; updateMissionCard(); });
  ui.sideMissionToggle.addEventListener('click', () => { sideMissionMinimized = !sideMissionMinimized; updateMissionCard(); });
  ui.dialogueClose.addEventListener('click', activateDialogueAction);
  ui.modalClose.addEventListener('click', () => { if (paused) paused = false; closeModal(); });
  ui.backdrop.addEventListener('click', event => { if (event.target === ui.backdrop) { if (paused) paused = false; closeModal(); } });

  document.addEventListener('keydown', event => {
    const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
    const target = event.target;
    const editing = target instanceof HTMLElement && (target.matches('input, textarea, select') || target.isContentEditable);
    if (editing && key !== 'Escape') return;
    const interactKey = event.code === 'KeyE' || key === 'e';
    if (interactKey && mode === 'game' && !paused && ui.backdrop.classList.contains('hidden')) {
      if (offlineSimulation) { event.preventDefault(); return; }
      if (interactionKeyDown || event.repeat) { event.preventDefault(); return; }
      interactionKeyDown = true;
      event.preventDefault();
      if (activeNpc) activateDialogueAction();
      else {
        const targetAtPrompt = currentInteractionTarget();
        if (targetAtPrompt) activateTarget(targetAtPrompt);
      }
      return;
    }
    if (event.repeat && key === 'Escape') return;
    if (!editing && mode === 'game' && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(key)) event.preventDefault();
    if (key === 'Escape') {
      if (!ui.backdrop.classList.contains('hidden')) { if (paused) paused = false; closeModal(); return; }
      if (activeNpc) { closeDialogue(); return; }
      if (mode === 'game') pauseGame();
      return;
    }
    if (mode === 'game' && !paused && !activeNpc && !ui.backdrop.classList.contains('hidden')) return;
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd'].includes(key) && mode === 'game' && !paused && !activeNpc) keys.add(key);
  }, true);
  document.addEventListener('keyup', event => {
    const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
    if (event.code === 'KeyE' || key === 'e') interactionKeyDown = false;
    keys.delete(key);
  }, true);
  window.addEventListener('blur', () => { keys.clear(); interactionKeyDown = false; });
  window.addEventListener('resize', resizeCanvas);
  window.addEventListener('pagehide', () => { if (mode === 'game') saveGame(); });

  refreshMenu();
  requestAnimationFrame(frame);
})();
