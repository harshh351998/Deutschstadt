// Scene geometry and transition points. All coordinates use each scene's Canvas world units.
window.DeutschstadtWorlds = {
  town: {
    id: 'town', width: 2400, height: 1400, location: 'MARKTPLATZ',
    directionsRoute: {
      conversationId: 'directions-conversation',
      checkpoints: [
        { nodeId: 'route-crossroads', x: 800, y: 520, radius: 38, nextNodeId: 'route-rathausgasse', message: 'Sehr gut! Die Kreuzung ist erreicht. Jetzt links. · Great! You reached the intersection. Turn left now.' },
        { nodeId: 'route-rathausgasse', x: 600, y: 520, radius: 36, nextNodeId: 'route-door', message: 'Richtig! Sie sind in der Rathausgasse. Jetzt rechts. · Correct! You are on Rathaus Street. Turn right now.' },
        { nodeId: 'route-door', x: 585, y: 320, radius: 34, nextNodeId: 'route-arrival', message: 'Das Rathaus ist gleich vor Ihnen. Gehen Sie hinein! · The town hall is just ahead. Go inside!' }
      ]
    },
    marketArea: { x: 1180, y: 648, w: 350, h: 200, label: 'WOCHENMARKT' },
    stationArea: {
      forecourt: { x: 1590, y: 610, w: 740, h: 310 },
      platforms: [
        { id: 'platform-1', x: 1580, y: 935, w: 760, h: 68, label: 'GLEIS 1', destination: 'Berlin · 10:15' },
        { id: 'platform-2', x: 1580, y: 1070, w: 760, h: 68, label: 'GLEIS 2', destination: 'Potsdam · 10:30' }
      ],
      tracks: [
        { id: 'track-1', x: 1580, y: 1005, w: 680, h: 63 },
        { id: 'track-2', x: 1580, y: 1140, w: 760, h: 63 }
      ],
      footbridge: { x: 2260, y: 935, w: 52, h: 203 },
      train: { x: 1690, y: 1011, w: 470, h: 52, doorX: 1905, doorY: 1012 },
      departureBoard: { x: 2165, y: 790, w: 96, h: 64 },
      shelter: { x: 1608, y: 886, w: 180, h: 42 },
      benches: [{ x: 1630, y: 966 }, { x: 2030, y: 966 }, { x: 1930, y: 1090 }],
      signals: [{ x: 2218, y: 972 }, { x: 2218, y: 1110 }],
      signs: [{ x: 1605, y: 925, text: 'GLEIS 1' }, { x: 1605, y: 1060, text: 'GLEIS 2' }]
    },
    marketStalls: [
      { id: 'market-fruit', x: 1190, y: 681, w: 88, h: 76, canopy: '#b95f4c', produce: ['#c9664c', '#e0b64e', '#759760'], solid: true },
      { id: 'market-flowers', x: 1294, y: 681, w: 88, h: 76, canopy: '#859363', produce: ['#c77991', '#e2c775', '#8e91b1'], solid: true },
      { id: 'market-vegetables', x: 1398, y: 681, w: 88, h: 76, canopy: '#c08b4e', produce: ['#73965e', '#b65b4b', '#d2b14a'], solid: true }
    ],
    doors: [
      { id: 'bakery-entrance', targetSceneId: 'bakery', x: 282, y: 277, radius: 48, name: 'bakery', action: 'Enter', targetPosition: { x: 450, y: 575 } },
      { id: 'bank-entrance', targetSceneId: 'bank', x: 1405, y: 402, radius: 48, name: 'bank', action: 'Enter', targetPosition: { x: 450, y: 575 } },
      { id: 'rathaus-entrance', targetSceneId: 'rathaus', x: 585, y: 270, radius: 48, name: 'Rathaus', action: 'Enter', targetPosition: { x: 450, y: 575 } },
      { id: 'wohnhaus-entrance', targetSceneId: 'wohnhaus', x: 320, y: 812, radius: 48, name: 'Wohnhaus', action: 'Enter', targetPosition: { x: 450, y: 575 } },
      { id: 'cafe-entrance', targetSceneId: 'cafe', x: 1231, y: 237, radius: 50, name: 'café', action: 'Enter', targetPosition: { x: 450, y: 555 } },
      { id: 'supermarket-entrance', targetSceneId: 'supermarket', x: 1005, y: 812, radius: 48, name: 'Supermarkt', action: 'Enter', targetPosition: { x: 450, y: 575 } },
      { id: 'station-entrance', targetSceneId: 'station', x: 1835, y: 807, radius: 48, name: 'Bahnhof', action: 'Enter', targetPosition: { x: 450, y: 575 } },
      { id: 'regional-train-door', targetSceneId: 'train', x: 1905, y: 1012, radius: 54, name: 'Regionalzug', action: 'Board', targetPosition: { x: 450, y: 575 } }
    ],
    interactables: [
      { id: 'platform-departure-board', name: 'Abfahrtstafel', prompt: 'Read departure board', x: 2208, y: 790, radius: 72, german: 'BERLIN · 10:15 · GLEIS 1\nPOTSDAM · 10:30 · GLEIS 2', english: 'Berlin · 10:15 · platform 1\nPotsdam · 10:30 · platform 2', detail: 'Abfahrt means departure. Check the destination and platform before boarding.' }
    ]
  },
  station: {
    id: 'station', width: 900, height: 680, location: 'BAHNHOF DEUTSCHSTADT', spawn: { x: 450, y: 575 },
    exit: { id: 'station-exit', targetSceneId: 'town', x: 450, y: 628, radius: 48, name: 'town', action: 'Leave', prompt: 'Leave Bahnhof', targetPosition: { x: 1835, y: 870 } },
    doors: [{ id: 'station-train-door', targetSceneId: 'train', x: 735, y: 575, radius: 52, name: 'Regionalzug', action: 'Board', targetPosition: { x: 450, y: 575 } }],
    walls: [{ x: 0, y: 0, w: 900, h: 30 }, { x: 0, y: 30, w: 30, h: 650 }, { x: 870, y: 30, w: 30, h: 650 }, { x: 30, y: 650, w: 365, h: 30 }, { x: 505, y: 650, w: 365, h: 30 }],
    windows: [{ x: 120, y: 0, w: 135 }, { x: 382, y: 0, w: 135 }, { x: 645, y: 0, w: 135 }],
    furniture: [
      { id: 'ticket-counter', type: 'counter', x: 500, y: 150, w: 310, h: 76, solid: true },
      { id: 'waiting-bench-left', type: 'bench', x: 95, y: 340, w: 150, h: 48, solid: true },
      { id: 'waiting-bench-right', type: 'bench', x: 285, y: 340, w: 150, h: 48, solid: true },
      { id: 'ticket-machine', type: 'machine', x: 70, y: 180, w: 75, h: 112, solid: true }
    ],
    npcs: [
      { id: 'station-clerk', name: 'Frau Krüger', role: 'Mitarbeiterin am Fahrkartenschalter', x: 650, y: 285, color: '#71856d', hair: '#4b473c', greeting: 'Guten Tag! Wohin möchten Sie fahren?', translation: 'Good day! Where would you like to travel?', icon: '✦', conversationId: 'station-ticket-clerk' },
      { id: 'station-passenger', name: 'Milan', role: 'Ein Reisender', x: 515, y: 430, color: '#66818a', hair: '#4e3d35', greeting: 'Der Zug nach Berlin fährt von Gleis eins.', translation: 'The train to Berlin leaves from platform one.', icon: '◈' }
    ],
    interactables: [
      { id: 'station-departure-board', name: 'Abfahrtstafel', prompt: 'Read departure board', interaction: 'station-board', x: 450, y: 112, radius: 92, german: 'BERLIN · 10:15 · GLEIS 1\nPOTSDAM · 10:30 · GLEIS 2', english: 'Berlin · 10:15 · platform 1\nPotsdam · 10:30 · platform 2', detail: 'Abfahrt = departure · Ankunft = arrival. Read the time and platform before you travel.' },
      { id: 'station-ticket-machine', name: 'Fahrkartenautomat', prompt: 'Inspect ticket machine', x: 185, y: 245, radius: 70, german: 'Fahrkarten nach Berlin und Potsdam.', english: 'Tickets to Berlin and Potsdam.', detail: 'You can also practise buying a ticket with Frau Krüger at the counter.' },
      { id: 'station-information', name: 'Information', prompt: 'Read station information', x: 450, y: 220, radius: 65, german: 'Gleis 1 · Berlin\nGleis 2 · Potsdam', english: 'Platform 1 · Berlin\nPlatform 2 · Potsdam', detail: 'Gleis means track or platform. Follow the matching sign.' }
    ]
  },
  train: {
    id: 'train', width: 900, height: 680, location: 'REGIONALZUG · WAGEN 1', spawn: { x: 450, y: 575 },
    exit: { id: 'train-exit', targetSceneId: 'station', x: 450, y: 628, radius: 48, name: 'Bahnsteig 1', action: 'Leave', prompt: 'Exit to platform 1', targetPosition: { x: 675, y: 575 } },
    walls: [{ x: 0, y: 0, w: 900, h: 30 }, { x: 0, y: 30, w: 30, h: 650 }, { x: 870, y: 30, w: 30, h: 650 }, { x: 30, y: 650, w: 365, h: 30 }, { x: 505, y: 650, w: 365, h: 30 }],
    windows: [{ x: 110, y: 0, w: 145 }, { x: 378, y: 0, w: 145 }, { x: 645, y: 0, w: 145 }],
    furniture: [
      { id: 'seat-row-left', type: 'seat', x: 110, y: 145, w: 230, h: 70, solid: true },
      { id: 'seat-row-right', type: 'seat', x: 560, y: 145, w: 230, h: 70, solid: true },
      { id: 'seat-row-left-back', type: 'seat', x: 110, y: 300, w: 230, h: 70, solid: true },
      { id: 'seat-row-right-back', type: 'seat', x: 560, y: 300, w: 230, h: 70, solid: true },
      { id: 'luggage-rack-left', type: 'rack', x: 60, y: 85, w: 270, h: 24, solid: true },
      { id: 'luggage-rack-right', type: 'rack', x: 570, y: 85, w: 270, h: 24, solid: true }
    ],
    npcs: [
      { id: 'ticket-inspector', name: 'Herr Braun', role: 'Der Zugbegleiter', x: 450, y: 260, color: '#5c8290', hair: '#57473b', greeting: 'Guten Tag. Ihre Fahrkarte, bitte.', translation: 'Good day. Your ticket, please.', icon: '✦', conversationId: 'station-ticket-inspector' },
      { id: 'train-passenger', name: 'Nora', role: 'Eine Reisende', x: 450, y: 450, color: '#a478a1', hair: '#382d38', greeting: 'Der nächste Halt ist Berlin.', translation: 'The next stop is Berlin.', icon: '✿' }
    ],
    interactables: [{ id: 'train-destination-display', name: 'Next stop display', prompt: 'Read destination display', x: 450, y: 70, radius: 82, german: 'NÄCHSTER HALT · BERLIN', english: 'NEXT STOP · BERLIN', detail: 'Der nächste Halt = the next stop.' }]
  },
  supermarket: {
    id: 'supermarket', width: 900, height: 680, location: 'SUPERMARKT', spawn: { x: 450, y: 575 },
    exit: { id: 'supermarket-exit', targetSceneId: 'town', x: 450, y: 628, radius: 48, name: 'town', action: 'Leave', prompt: 'Exit Supermarkt', targetPosition: { x: 1005, y: 895 } },
    walls: [
      { x: 0, y: 0, w: 900, h: 30 }, { x: 0, y: 30, w: 30, h: 650 }, { x: 870, y: 30, w: 30, h: 650 },
      { x: 30, y: 650, w: 365, h: 30 }, { x: 505, y: 650, w: 365, h: 30 }
    ],
    windows: [{ x: 105, y: 0, w: 130 }, { x: 385, y: 0, w: 130 }, { x: 665, y: 0, w: 130 }],
    furniture: [
      { id: 'produce-shelf', type: 'shelf', x: 72, y: 180, w: 230, h: 58, solid: true, sign: 'OBST & GEMÜSE' },
      { id: 'bread-shelf', type: 'shelf', x: 72, y: 310, w: 230, h: 58, solid: true, sign: 'BACKWAREN' },
      { id: 'drink-shelf', type: 'shelf', x: 72, y: 440, w: 230, h: 58, solid: true, sign: 'GETRÄNKE' },
      { id: 'middle-shelf', type: 'shelf', x: 365, y: 330, w: 185, h: 58, solid: true, sign: 'MILCHPRODUKTE' },
      { id: 'household-shelf', type: 'shelf', x: 610, y: 390, w: 210, h: 58, solid: true, sign: 'HAUSHALT' },
      { id: 'checkout-counter', type: 'counter', x: 540, y: 150, w: 280, h: 76, solid: true },
      { id: 'checkout-register', type: 'register', x: 678, y: 145, w: 48, h: 42, solid: false }
    ],
    npcs: [
      { id: 'shopkeeper', name: 'Herr Weber', role: 'Der Verkäufer', x: 680, y: 285, color: '#66818a', hair: '#4e3d35', greeting: 'Guten Tag! Kann ich Ihnen helfen?', translation: 'Good day! Can I help you?', icon: '✦', conversationId: 'supermarket-shopping' }
    ],
    interactables: [
      { id: 'apples-display', name: 'Apples', prompt: 'Look at apples', x: 185, y: 267, radius: 62, german: 'Äpfel · 3 €', english: 'Apples · €3', detail: 'Die Äpfel kosten drei Euro. The apples cost three euros.', vocabularyIds: ['apples', 'number_3'] },
      { id: 'bread-display-market', name: 'Bread rolls', prompt: 'Look at bread rolls', x: 184, y: 397, radius: 62, german: 'Brötchen · 2 €', english: 'Bread rolls · €2', detail: 'Zwei Brötchen kosten zwei Euro. Two bread rolls cost two euros.', vocabularyIds: ['buns', 'number_2'] },
      { id: 'milk-display', name: 'Milk', prompt: 'Look at milk', x: 183, y: 527, radius: 62, german: 'Die Milch · 1 €', english: 'The milk · €1', detail: 'Ein Liter Milch kostet einen Euro. One litre of milk costs one euro.', vocabularyIds: ['number_1'] }
    ]
  },
  cafe: {
    id: 'cafe', width: 900, height: 680, location: 'CAFÉ AM PLATZ', spawn: { x: 450, y: 555 },
    exit: { id: 'cafe-exit', targetSceneId: 'town', x: 450, y: 628, radius: 48, name: 'town', action: 'Leave', prompt: 'Exit café', targetPosition: { x: 1231, y: 350 } },
    walls: [
      { x: 0, y: 0, w: 900, h: 30 }, { x: 0, y: 30, w: 30, h: 650 }, { x: 870, y: 30, w: 30, h: 650 },
      { x: 30, y: 650, w: 365, h: 30 }, { x: 505, y: 650, w: 365, h: 30 }
    ],
    windows: [{ x: 150, y: 0, w: 125 }, { x: 388, y: 0, w: 125 }, { x: 626, y: 0, w: 125 }],
    furniture: [
      { id: 'counter', type: 'counter', x: 505, y: 155, w: 300, h: 82, solid: true },
      { id: 'pastry-display', type: 'display', x: 526, y: 174, w: 88, h: 36, solid: false },
      { id: 'coffee-machine', type: 'machine', x: 676, y: 153, w: 56, h: 51, solid: false },
      { id: 'table-window', type: 'table', x: 125, y: 215, w: 145, h: 82, solid: true },
      { id: 'table-corner', type: 'table', x: 690, y: 390, w: 132, h: 76, solid: true },
      { id: 'table-center', type: 'table', x: 340, y: 380, w: 125, h: 70, solid: true },
      { id: 'chair-window-left', type: 'chair', x: 92, y: 238, w: 27, h: 32, solid: true },
      { id: 'chair-window-right', type: 'chair', x: 278, y: 238, w: 27, h: 32, solid: true },
      { id: 'chair-corner-left', type: 'chair', x: 655, y: 410, w: 27, h: 32, solid: true },
      { id: 'chair-corner-right', type: 'chair', x: 830, y: 410, w: 27, h: 32, solid: true },
      { id: 'chair-center', type: 'chair', x: 387, y: 460, w: 31, h: 27, solid: true }
    ],
    npcs: [
      { id: 'greta', name: 'Greta', role: 'Die Kellnerin', x: 654, y: 285, color: '#8b6c91', hair: '#44333e', greeting: 'Guten Tag! Willkommen im Café am Platz.', translation: 'Good day! Welcome to Café am Platz.', icon: '✿', conversationId: 'cafe-waiter' },
      { id: 'otto', name: 'Otto', role: 'Ein Stammgast', x: 202, y: 337, color: '#738b78', hair: '#4b473c', greeting: 'Guten Tag! Der Kaffee duftet wunderbar.', translation: 'Good day! The coffee smells wonderful.', icon: '✦' },
      { id: 'lina', name: 'Lina', role: 'Eine Besucherin', x: 760, y: 518, color: '#bf876b', hair: '#65443a', greeting: 'Hallo! Heute ist es sehr gemütlich.', translation: 'Hello! It is very cozy today.', icon: '✿' }
    ],
    interactables: [
      { id: 'menu-board', name: 'Menu board', prompt: 'Read menu', x: 450, y: 97, radius: 74, german: 'Kaffee · Wasser · Brot · Kuchen · Rechnung', english: 'Coffee · water · bread · cake · bill', detail: 'Order with “Ich hätte gern …, bitte.” Ask for the bill with “Die Rechnung, bitte.”' },
      { id: 'pastry-display', name: 'Pastry display', prompt: 'Look at pastries', x: 570, y: 226, radius: 70, german: 'Frische Brötchen und Kuchen.', english: 'Fresh bread rolls and cake.', detail: '“Ein Brot, bitte” means “A loaf of bread, please.”' },
      { id: 'coffee-machine', name: 'Coffee machine', prompt: 'Look at coffee machine', x: 704, y: 230, radius: 68, german: 'Eine Tasse Kaffee, bitte.', english: 'A cup of coffee, please.', detail: 'Greta prepares each drink behind the counter.' }
    ]
  },
  bakery: {
    id: 'bakery', width: 900, height: 680, location: 'BÄCKEREI AM MARKTPLATZ', spawn: { x: 450, y: 575 },
    exit: { id: 'bakery-exit', targetSceneId: 'town', x: 450, y: 628, radius: 48, name: 'town', action: 'Leave', prompt: 'Leave bakery', targetPosition: { x: 282, y: 356 } },
    walls: [
      { x: 0, y: 0, w: 900, h: 30 }, { x: 0, y: 30, w: 30, h: 650 }, { x: 870, y: 30, w: 30, h: 650 },
      { x: 30, y: 650, w: 365, h: 30 }, { x: 505, y: 650, w: 365, h: 30 }
    ],
    windows: [{ x: 130, y: 0, w: 130 }, { x: 640, y: 0, w: 130 }],
    furniture: [
      { id: 'bakery-counter', type: 'counter', x: 475, y: 207, w: 330, h: 82, solid: true },
      { id: 'bread-display', type: 'display', x: 490, y: 218, w: 125, h: 54, solid: false },
      { id: 'pastry-shelf', type: 'shelf', x: 82, y: 195, w: 190, h: 48, solid: true },
      { id: 'bread-shelf', type: 'shelf', x: 82, y: 315, w: 190, h: 48, solid: true },
      { id: 'small-table', type: 'table', x: 312, y: 402, w: 118, h: 69, solid: true },
      { id: 'table-chair', type: 'chair', x: 354, y: 474, w: 30, h: 30, solid: true }
    ],
    npcs: [
      { id: 'emil', name: 'Emil', role: 'Der Bäcker', x: 650, y: 345, color: '#c28d59', hair: '#5a3e2c', greeting: 'Guten Tag! Willkommen in meiner Bäckerei.', translation: 'Good day! Welcome to my bakery.', icon: '✿', conversationId: 'bakery-counter', preparationId: 'bakery' }
    ],
    interactables: [
      { id: 'bakery-service-counter', name: 'Service counter', prompt: 'Inspect counter', x: 455, y: 304, radius: 48, german: 'Ich hätte gern ein Brot, bitte.', english: 'I would like a loaf of bread, please.', detail: 'This is where you order. Talk to Emil when you are ready to practise.' },
      { id: 'bakery-menu', name: 'Price board', prompt: 'Read price board', x: 448, y: 110, radius: 76, german: 'Brot · 2 €     Brötchen · 1 €', english: 'Loaf of bread · €2     Bread roll · €1', detail: 'Ask “Wie viel kostet das?” to ask how much an item costs.' },
      { id: 'bread-display', name: 'Bread display', prompt: 'Look at bread', x: 555, y: 297, radius: 68, german: 'Frisches Brot und Brötchen.', english: 'Fresh bread and bread rolls.', detail: '“Ein Brot” is a loaf of bread. “Ein Brötchen” is one bread roll.' }
    ]
  },
  bank: {
    id: 'bank', width: 900, height: 680, location: 'STADTBANK DEUTSCHSTADT', spawn: { x: 450, y: 575 },
    exit: { id: 'bank-exit', targetSceneId: 'town', x: 450, y: 628, radius: 48, name: 'town', action: 'Leave', targetPosition: { x: 1405, y: 480 } },
    walls: [
      { x: 0, y: 0, w: 900, h: 30 }, { x: 0, y: 30, w: 30, h: 650 }, { x: 870, y: 30, w: 30, h: 650 },
      { x: 30, y: 650, w: 365, h: 30 }, { x: 505, y: 650, w: 365, h: 30 }
    ],
    windows: [{ x: 115, y: 0, w: 130 }, { x: 655, y: 0, w: 130 }],
    furniture: [
      { id: 'reception-desk', type: 'reception', x: 175, y: 150, w: 145, h: 58, solid: true },
      { id: 'bank-service-counter', type: 'counter', x: 470, y: 150, w: 340, h: 75, solid: true },
      { id: 'atm-fixture', type: 'atm', x: 48, y: 228, w: 88, h: 120, solid: true },
      { id: 'waiting-bench-left', type: 'bench', x: 200, y: 385, w: 150, h: 48, solid: true },
      { id: 'waiting-bench-right', type: 'bench', x: 530, y: 430, w: 150, h: 48, solid: true },
      { id: 'waiting-chair', type: 'chair', x: 365, y: 390, w: 34, h: 36, solid: true },
      { id: 'notice-desk', type: 'table', x: 725, y: 445, w: 95, h: 55, solid: true }
    ],
    npcs: [
      { id: 'mina', name: 'Mina Yilmaz', role: 'Mitarbeiterin am Empfang', x: 250, y: 255, color: '#8e755b', hair: '#3e3029', greeting: 'Guten Tag! Willkommen. Wie kann ich Ihnen helfen?', translation: 'Good day! Welcome. How can I help you?', icon: '✿', conversationId: 'bank-reception' },
      { id: 'helena', name: 'Frau Becker', role: 'Bankmitarbeiterin', x: 650, y: 277, color: '#66818a', hair: '#4e3d35', greeting: 'Guten Tag! Willkommen bei der Stadtbank.', translation: 'Good day! Welcome to the town bank.', icon: '✦', conversationId: 'bank-employee', preparationId: 'bank' },
      { id: 'herr-schneider', name: 'Herr Schneider', role: 'Ein wartender Kunde', x: 430, y: 465, color: '#71856d', hair: '#4e473d', greeting: 'Guten Tag! Warten Sie auch auf Hilfe?', translation: 'Good day! Are you also waiting for help?', icon: '◈', conversationId: 'bank-customer' }
    ],
    interactables: [
      { id: 'bank-atm', name: 'Geldautomat', prompt: 'Use ATM', interaction: 'atm', x: 175, y: 285, radius: 86 },
      { id: 'bank-information', name: 'Information board', prompt: 'Read information board', interaction: 'information', x: 450, y: 105, radius: 78 }
    ]
  },
  rathaus: {
    id: 'rathaus', width: 900, height: 680, location: 'RATHAUS DEUTSCHSTADT', spawn: { x: 450, y: 575 },
    exit: { id: 'rathaus-exit', targetSceneId: 'town', x: 450, y: 628, radius: 48, name: 'town', action: 'Leave', prompt: 'Leave Rathaus', targetPosition: { x: 585, y: 335 } },
    walls: [{ x: 0, y: 0, w: 900, h: 30 }, { x: 0, y: 30, w: 30, h: 650 }, { x: 870, y: 30, w: 30, h: 650 }, { x: 30, y: 650, w: 365, h: 30 }, { x: 505, y: 650, w: 365, h: 30 }],
    windows: [{ x: 140, y: 0, w: 130 }, { x: 630, y: 0, w: 130 }],
    furniture: [{ id: 'rathaus-counter', type: 'reception', x: 560, y: 170, w: 240, h: 62, solid: true }, { id: 'waiting-bench', type: 'bench', x: 115, y: 360, w: 150, h: 46, solid: true }],
    npcs: [{ id: 'rathaus-clerk', name: 'Frau Neumann', role: 'Mitarbeiterin im Rathaus', x: 650, y: 285, color: '#71856d', hair: '#4b473c', greeting: 'Guten Tag! Wie kann ich Ihnen helfen?', translation: 'Good day! How can I help you?', icon: '✿', conversationId: 'rathaus-help' }],
    interactables: [{ id: 'rathaus-office-sign', name: 'Office sign', prompt: 'Read office sign', interaction: 'rathaus-sign', x: 450, y: 165, radius: 72, german: 'Büro 1 · Auskunft     Büro 2 · Termine', english: 'Office 1 · Information     Office 2 · Appointments', detail: 'Mia has an appointment. Which office should you show her?' }]
  },
  wohnhaus: {
    id: 'wohnhaus', width: 900, height: 680, location: 'LUKAS’ WOHNHAUS', spawn: { x: 450, y: 575 },
    exit: { id: 'wohnhaus-exit', targetSceneId: 'town', x: 450, y: 628, radius: 48, name: 'town', action: 'Leave', prompt: 'Leave Wohnhaus', targetPosition: { x: 320, y: 890 } },
    walls: [{ x: 0, y: 0, w: 900, h: 30 }, { x: 0, y: 30, w: 30, h: 650 }, { x: 870, y: 30, w: 30, h: 650 }, { x: 30, y: 650, w: 365, h: 30 }, { x: 505, y: 650, w: 365, h: 30 }],
    windows: [{ x: 140, y: 0, w: 130 }, { x: 630, y: 0, w: 130 }],
    furniture: [{ id: 'living-room-table', type: 'table', x: 160, y: 290, w: 170, h: 86, solid: true }, { id: 'hall-cupboard', type: 'shelf', x: 650, y: 185, w: 150, h: 88, solid: true }, { id: 'kitchen-counter', type: 'counter', x: 590, y: 390, w: 210, h: 60, solid: true }],
    npcs: [{ id: 'lukas', name: 'Lukas', role: 'Bewohner', x: 450, y: 330, color: '#66818a', hair: '#4e3d35', greeting: 'Hallo! Wo ist meine Tasche?', translation: 'Hello! Where is my bag?', icon: '✦', conversationId: 'home-lukas' }],
    interactables: [
      { id: 'home-table-clue', name: 'Living-room table', prompt: 'Inspect table', interaction: 'home-clue', clueId: 'table-clue', x: 245, y: 410, radius: 68, german: 'Auf dem Tisch liegt ein Zettel: „Der Schlüssel ist im Schrank.“', english: 'On the table is a note: “The key is in the cupboard.”', detail: 'Der Tisch = the table. You found the next clue.', vocabularyIds: ['table','key','cupboard'] },
      { id: 'home-cupboard-clue', name: 'Cupboard', prompt: 'Search cupboard', interaction: 'home-clue', clueId: 'cupboard-clue', x: 720, y: 310, radius: 70, german: 'Im Schrank liegt der Schlüssel zur Küche.', english: 'The key to the kitchen is in the cupboard.', detail: 'Der Schlüssel = the key · der Schrank = the cupboard.', vocabularyIds: ['key','cupboard','kitchen'] },
      { id: 'home-kitchen-bag', name: 'Kitchen door', prompt: 'Look in kitchen', interaction: 'home-clue', clueId: 'kitchen-bag', x: 700, y: 500, radius: 76, german: 'Die Tasche steht neben der Küchentür!', english: 'The bag is beside the kitchen door!', detail: '„Ich habe sie gefunden!“ means “I found it!”', vocabularyIds: ['bag','kitchen','door'] }
    ]
  }
};
