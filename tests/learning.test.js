const { readFileSync } = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');

function loadLearning() {
  const window = {};
  const context = vm.createContext({ window });
  for (const file of ['lessons.js', 'learning.js']) {
    vm.runInContext(readFileSync(path.join(__dirname, '..', file), 'utf8'), context, { filename: file });
  }
  return { lessons: window.DeutschstadtLessons, learning: window.DeutschstadtLearning };
}

test('the playable beginner path unlocks in order and unavailable topics stay locked', () => {
  const { lessons, learning } = loadLearning();
  const progress = learning.emptyProgress();
  const status = id => learning.unitsFor(progress).find(unit => unit.id === id);

  assert.equal(status('greetings').status, 'available');
  assert.equal(status('numbers').status, 'locked');
  assert.match(status('numbers').lockedReason, /Your first conversations/);
  assert.equal(status('bakery').status, 'locked');
  assert.equal(status('cafe').status, 'locked');
  assert.equal(status('bank').status, 'locked');

  progress.lessons['greetings-basics'].status = 'completed';
  assert.equal(status('numbers').status, 'locked', 'Anna is also required before Numbers');
  progress.conversations['anna-introduction'].status = 'completed';
  assert.equal(status('numbers').status, 'available');

  for (const [lessonId, unitId] of [
    ['numbers-prices', 'bakery'],
    ['bakery-order', 'cafe'],
    ['cafe-conversation', 'bank']
  ]) {
    progress.lessons[lessonId].status = 'completed';
    assert.equal(status(unitId).status, 'available', `${unitId} unlocks after ${lessonId}`);
  }

  progress.lessons['bank-basics'].status = 'completed';
  assert.equal(status('shopping').status, 'available');
  assert.equal(status('shopping').lessonId, 'shopping-basics');
  assert.equal(learning.journalUnitsFor(progress).some(unit => unit.id === 'shopping'), true);
  assert.equal(lessons.units.find(unit => unit.id === 'station').lessonId, 'train-station');
});

test('Directions unlocks only after Shopping and remains optional to the completed main story', () => {
  const { lessons, learning } = loadLearning();
  const progress = learning.emptyProgress();
  const directions = () => learning.journalUnitsFor(progress).find(unit => unit.id === 'directions');
  assert.equal(directions().status, 'locked');
  assert.match(directions().lockedReason, /Shopping/);
  progress.lessons['shopping-basics'].status = 'completed';
  assert.equal(directions().status, 'available');
  assert.equal(directions().hasConversationContent, true);
  for (const id of ['greetings-basics', 'numbers-prices', 'bakery-order', 'cafe-conversation', 'bank-basics']) progress.lessons[id].status = 'completed';
  progress.conversations['anna-introduction'].status = 'completed';
  progress.missions.bankVisit.completed = true;
  assert.equal(learning.currentMission(progress).id, 'chapter-complete', 'Directions does not extend main-story prerequisites');
  assert.equal(lessons.units.find(unit => unit.id === 'directions').requiresLessonId, 'shopping-basics');
});

test('Train station lesson is journal-visible only after Directions and its conversation completes once', () => {
  const { lessons, learning } = loadLearning();
  const progress = learning.emptyProgress();
  const station = () => learning.journalUnitsFor(progress).find(unit => unit.id === 'station');
  assert.equal(station().status, 'locked');
  assert.match(station().lockedReason, /Finding the Rathaus/);
  for (const id of ['greetings-basics', 'numbers-prices', 'bakery-order', 'cafe-conversation', 'bank-basics', 'shopping-basics']) progress.lessons[id].status = 'completed';
  assert.equal(station().status, 'locked', 'the Directions mission remains the actual prerequisite');
  progress.lessons['directions-basics'].status = 'completed';
  assert.equal(station().status, 'available');
  assert.equal(station().playable, true);
  assert.equal(lessons.units.find(unit => unit.id === 'station').requiresLessonId, 'directions-basics');

  const session = learning.createConversationSession('station-ticket-clerk', progress);
  for (const choiceId of ['ask-berlin-ticket', 'one-way', 'time-1015', 'platform-one', 'thank-clerk']) {
    assert.equal(session.choose(choiceId).correct, true, `${choiceId} is a valid learning step`);
  }
  assert.equal(session.node.speaker, 'Frau Krüger · Fahrkartenschalter');
  assert.equal(session.continue().complete, true, 'the explicit farewell completes the lesson');
  assert.equal(progress.lessons['train-station'].status, 'completed');
  assert.equal(progress.conversations['station-ticket-clerk'].status, 'completed');
  assert.equal(learning.claimReward(progress, 'train-station'), true);
  assert.equal(learning.claimReward(learning.normalizeProgress(JSON.parse(JSON.stringify(progress))), 'train-station'), false);
  const inspector = learning.createConversationSession('station-ticket-inspector', progress);
  assert.equal(inspector.choose('show-ticket').correct, true);
  assert.equal(inspector.continue().complete, true);
  assert.equal(progress.lessons['train-station'].status, 'completed', 'optional train practice does not replace lesson completion');
  assert.equal(lessons.conversations['station-ticket-inspector'].rewardXp || 0, 0, 'optional inspector practice awards no XP');
  const restored = learning.normalizeProgress(JSON.parse(JSON.stringify(progress)));
  assert.equal(restored.lessons['directions-basics'].status, 'completed');
  assert.equal(restored.lessons['train-station'].status, 'completed');
  assert.equal(learning.unitsFor(restored).find(unit => unit.id === 'daily-life').status, 'locked', 'later placeholder unlocks against the actual station lesson id');
});

test('wrong station answers are retryable and old chapter saves keep their story progress', () => {
  const { learning } = loadLearning();
  const progress = learning.emptyProgress();
  for (const id of ['greetings-basics', 'numbers-prices', 'bakery-order', 'cafe-conversation', 'bank-basics', 'shopping-basics', 'directions-basics']) progress.lessons[id].status = 'completed';
  progress.missions.bankVisit.completed = true;
  const legacy = JSON.parse(JSON.stringify(progress));
  delete legacy.lessons['train-station'];
  delete legacy.conversations['station-ticket-clerk'];
  const restored = learning.normalizeProgress(legacy);
  restored.lessons['train-station'].status = 'in-progress';
  const session = learning.createConversationSession('station-ticket-clerk', restored);
  assert.equal(session.choose('ask-for-cafe').correct, false);
  assert.equal(session.node.speaker, 'Frau Krüger · Fahrkartenschalter');
  assert.equal(session.choose('ask-berlin-ticket').correct, true);
  assert.equal(restored.missions.bankVisit.completed, true);
  assert.equal(restored.lessons['directions-basics'].status, 'completed');
  assert.equal(restored.lessons['train-station'].status, 'in-progress');
});

test('Directions conversation checkpoints persist and only route arrival completes its lesson reward', () => {
  const { lessons, learning } = loadLearning();
  const progress = learning.emptyProgress();
  progress.lessons['shopping-basics'].status = 'completed';
  const session = learning.createConversationSession('directions-conversation', progress);
  assert.equal(session.choose('turn-right-first').correct, false);
  assert.equal(session.node.speaker, 'Theo · Nachbar', 'incorrect direction can be retried');
  assert.equal(session.choose('go-straight').correct, true);
  assert.equal(session.choose('turn-left').correct, true);
  assert.equal(session.choose('turn-right-north').correct, true);
  assert.equal(progress.conversations['directions-conversation'].nodeId, 'route-ready');
  assert.equal(progress.lessons['directions-basics'].status, 'not-started', 'dialogue alone does not finish the route lesson');
  progress.conversations['directions-conversation'].nodeId = 'route-crossroads';
  const restored = learning.normalizeProgress(JSON.parse(JSON.stringify(progress)));
  assert.equal(restored.conversations['directions-conversation'].nodeId, 'route-crossroads', 'route checkpoint survives save normalization');
  assert.equal(learning.completeConversationLesson(restored, 'directions-conversation'), false, 'arrival cannot be claimed before the route is finished');
  restored.conversations['directions-conversation'].nodeId = lessons.conversations['directions-conversation'].completionNodeId;
  assert.equal(learning.completeConversationLesson(restored, 'directions-conversation'), true);
  assert.equal(learning.completeConversationLesson(restored, 'directions-conversation'), false, 'completion is one-time');
  assert.equal(restored.lessons['directions-basics'].status, 'completed');
  assert.equal(learning.claimReward(restored, 'directions-basics'), true);
  assert.equal(learning.claimReward(restored, 'directions-basics'), false, 'replay cannot claim XP twice');
  const chapterSave = learning.emptyProgress();
  for (const id of ['greetings-basics', 'numbers-prices', 'bakery-order', 'cafe-conversation', 'bank-basics']) chapterSave.lessons[id].status = 'completed';
  chapterSave.conversations['anna-introduction'].status = 'completed';
  chapterSave.missions.bankVisit.completed = true;
  const oldChapterSave = learning.normalizeProgress(JSON.parse(JSON.stringify(chapterSave)));
  assert.equal(oldChapterSave.missions.bankVisit.completed, true);
  assert.equal(learning.currentMission(oldChapterSave).id, 'chapter-complete');
});

test('the authoritative mission view follows saved lesson and conversation progress', () => {
  const { learning } = loadLearning();
  const progress = learning.emptyProgress();
  const current = () => learning.currentMission(progress);

  assert.equal(current().id, 'greetings');
  progress.lessons['greetings-basics'].status = 'completed';
  assert.deepEqual({ id: current().id, scene: current().sceneId, npc: current().npcId }, { id: 'first-conversation', scene: 'town', npc: 'anna' });
  assert.equal(learning.unitsFor(progress).find(unit => unit.id === 'numbers').status, 'locked');
  progress.conversations['anna-introduction'].status = 'completed';
  assert.equal(learning.unitsFor(progress).find(unit => unit.id === 'numbers').status, 'available');
  assert.equal(current().id, 'numbers');
  progress.lessons['numbers-prices'].status = 'completed';
  assert.equal(current().doorId, 'bakery-entrance');
  progress.lessons['bakery-order'].status = 'completed';
  assert.equal(current().doorId, 'cafe-entrance');
  progress.lessons['cafe-conversation'].status = 'completed';
  assert.deepEqual({ id: current().id, door: current().doorId, npc: current().npcId }, { id: 'bank', door: 'bank-entrance', npc: 'helena' });
  progress.missions.bankVisit.objectives.entered = true;
  progress.missions.bankVisit.objectives.employeeTalked = true;
  assert.equal(current().objectId, 'bank-atm');
  progress.missions.bankVisit.objectives.atmUsed = true;
  assert.equal(current().lessonId, 'bank-basics');
});

test('Anna interaction points to the active greetings lesson until the lesson is completed', () => {
  const { learning } = loadLearning();
  const progress = learning.emptyProgress();
  progress.lessons['greetings-basics'].status = 'in-progress';
  progress.activeLesson = { lessonId: 'greetings-basics', exerciseIndex: 1, correctAnswers: 1 };

  assert.deepEqual({ ...learning.currentMission(progress) }, {
    id: 'greetings', title: 'Greetings & introductions',
    objective: 'Resume the greeting lesson in the Learning Journal.',
    destination: 'Learning Journal', progressLabel: null,
    action: 'lesson', lessonId: 'greetings-basics'
  });
  assert.deepEqual({ ...learning.conversationLessonRedirect(progress, 'anna-introduction') }, {
    lessonId: 'greetings-basics',
    destination: 'Learning Journal',
    objective: 'Resume the greeting lesson in the Learning Journal.'
  });

  progress.lessons['greetings-basics'].status = 'completed';
  assert.equal(learning.conversationLessonRedirect(progress, 'anna-introduction'), null);
  assert.equal(learning.currentMission(progress).id, 'first-conversation');
});

test('Numbers & Prices routes to the Supermarkt after the existing greeting prerequisites', () => {
  const { lessons, learning } = loadLearning();
  const progress = learning.emptyProgress();
  progress.lessons['greetings-basics'].status = 'completed';
  assert.equal(learning.currentMission(progress).id, 'first-conversation');
  progress.conversations['anna-introduction'].status = 'completed';
  const mission = learning.currentMission(progress);
  assert.equal(mission.id, 'numbers');
  assert.equal(mission.destination, 'Supermarkt');
  assert.equal(mission.doorId, 'supermarket-entrance');
  assert.equal(mission.action, 'enter');
  assert.equal(mission.lessonId, undefined, 'the activity is not directed to the Journal lesson launcher');
  assert.equal(learning.journalUnitsFor(progress).some(unit => unit.id === 'numbers'), true);
  assert.ok(learning.unitsFor(progress).some(unit => unit.id === 'numbers'), 'underlying prerequisite data remains available');
  assert.equal(lessons.lessons['numbers-prices'].exercises.length > 0, true, 'legacy lesson content remains intact');
});

test('Numbers & Prices stays story-linked while its existing exercise lesson is visible for replay', () => {
  const { lessons, learning } = loadLearning();
  const progress = learning.emptyProgress();
  progress.lessons['greetings-basics'].status = 'completed';
  progress.conversations['anna-introduction'].status = 'completed';
  const unit = learning.journalUnitsFor(progress).find(item => item.id === 'numbers');
  assert.equal(unit.lessonId, 'numbers-prices');
  assert.equal(unit.status, 'available');
  assert.equal(lessons.units.filter(item => item.lessonId === 'numbers-prices').length, 1, 'no duplicate unit or lesson was introduced');
  assert.equal(lessons.units.find(item => item.id === 'bakery').requiresLessonId, 'numbers-prices');
  assert.equal(lessons.lessons['numbers-prices'].exercises.length, 7);
  progress.lessons['numbers-prices'].status = 'completed';
  const restored = learning.normalizeProgress(JSON.parse(JSON.stringify(progress)));
  assert.equal(learning.journalUnitsFor(restored).find(item => item.id === 'numbers').status, 'completed');
  assert.equal(learning.claimReward(restored, 'numbers-prices'), true);
  assert.equal(learning.claimReward(restored, 'numbers-prices'), false);
});

test('supermarket shopping retries wrong choices and completes the preserved numbers lesson', () => {
  const { learning } = loadLearning();
  const progress = learning.emptyProgress();
  progress.lessons['greetings-basics'].status = 'completed';
  progress.conversations['anna-introduction'].status = 'completed';
  const session = learning.createConversationSession('supermarket-shopping', progress);

  assert.equal(session.choose('ask-directions').correct, false);
  assert.equal(session.node.speaker, 'Herr Weber, der Verkäufer');
  assert.equal(session.choose('ask-price').correct, true);
  assert.equal(session.node.german, 'Die Äpfel kosten drei Euro. Wie viel kosten die Äpfel?');
  assert.equal(session.choose('two-euros').correct, false);
  assert.equal(session.node.german, 'Die Äpfel kosten drei Euro. Wie viel kosten die Äpfel?');
  assert.equal(session.choose('three-euros').correct, true);
  assert.equal(session.choose('ask-again').correct, false);
  assert.equal(session.choose('take-apples').correct, true);
  assert.equal(session.continue().complete, true);
  assert.equal(progress.lessons['numbers-prices'].status, 'completed');
  assert.equal(learning.currentMission(progress).id, 'bakery');
  assert.equal(learning.claimReward(progress, 'numbers-prices'), true);
  assert.equal(learning.claimReward(progress, 'numbers-prices'), false);
});

test('Shopping stays bank-gated, teaches products and locations, retries, and completes only after the full dialogue', () => {
  const { lessons, learning } = loadLearning();
  const progress = learning.emptyProgress();
  const shoppingUnit = () => learning.journalUnitsFor(progress).find(unit => unit.id === 'shopping');
  assert.equal(shoppingUnit().status, 'locked');
  assert.match(shoppingUnit().lockedReason, /bank/i);

  progress.lessons['bank-basics'].status = 'completed';
  assert.equal(shoppingUnit().status, 'available');
  for (const id of ['greetings-basics', 'numbers-prices', 'bakery-order', 'cafe-conversation']) progress.lessons[id].status = 'completed';
  progress.conversations['anna-introduction'].status = 'completed';
  progress.missions.bankVisit.completed = true;
  assert.equal(learning.currentMission(progress).id, 'chapter-complete', 'Shopping lesson availability does not rewrite main-story progression');
  const conversation = lessons.conversations['shopping-conversation'];
  assert.equal(conversation.lessonId, 'shopping-basics');
  assert.equal(conversation.rewardId, 'shopping-basics');
  for (const id of ['milk', 'water_product', 'cheese', 'suchen', 'apples', 'bread', 'find_bread', 'have_apples', 'shopping_close']) {
    assert.ok(lessons.vocabulary[id], `shopping vocabulary ${id} exists`);
  }

  progress.lessons['shopping-basics'].status = 'in-progress'; // Mirrors startConversation() before the UI opens.
  const session = learning.createConversationSession('shopping-conversation', progress);
  assert.equal(session.choose('ask-bank').correct, false);
  assert.equal(progress.conversations['shopping-conversation'].nodeId, 'welcome', 'an incorrect response keeps the learner on the same question');
  assert.equal(session.choose('look-for-milk').correct, true);
  assert.equal(session.node.german, 'Die Milch finden Sie im Kühlregal.');
  assert.equal(session.continue().complete, false);
  assert.equal(progress.conversations['shopping-conversation'].nodeId, 'bread-question');
  assert.equal(session.choose('ask-for-apples-early').correct, false);
  assert.equal(progress.conversations['shopping-conversation'].nodeId, 'bread-question');
  assert.equal(session.choose('ask-bread-location').correct, true);
  assert.equal(session.node.german.includes('hinten links'), true);
  assert.equal(session.choose('ask-for-apples').correct, true);
  assert.equal(session.node.german.includes('Obstregal'), true);
  assert.equal(session.choose('polite-close').correct, true);
  assert.equal(session.node.german, 'Gern geschehen. Auf Wiedersehen!');
  assert.equal(progress.lessons['shopping-basics'].status, 'in-progress', 'the closing dialogue must still be completed');
  assert.equal(session.continue().complete, true);
  assert.equal(progress.lessons['shopping-basics'].status, 'completed');
  assert.equal(learning.claimReward(progress, 'shopping-basics'), true);
  assert.equal(learning.claimReward(progress, 'shopping-basics'), false);
  const restored = learning.normalizeProgress(JSON.parse(JSON.stringify(progress)));
  assert.equal(learning.journalUnitsFor(restored).find(unit => unit.id === 'shopping').status, 'completed');
  assert.equal(restored.lessons['shopping-basics'].status, 'completed');
  assert.equal(restored.rewardClaims.includes('lesson:shopping-basics'), true);
});

test('Shopping accepts the taught water request as an alternative first product', () => {
  const { learning } = loadLearning();
  const progress = learning.emptyProgress();
  progress.lessons['bank-basics'].status = 'completed';
  const session = learning.createConversationSession('shopping-conversation', progress);
  assert.equal(session.choose('look-for-water').correct, true);
  assert.equal(session.node.german, 'Das Wasser finden Sie im Getränkeregal.');
  assert.ok(progress.vocabulary.water_product.correct > 0);
});

test('older saves receive safe Shopping defaults without losing completed Bank progress', () => {
  const { learning } = loadLearning();
  const older = learning.emptyProgress();
  for (const id of ['greetings-basics', 'numbers-prices', 'bakery-order', 'cafe-conversation', 'bank-basics']) older.lessons[id].status = 'completed';
  older.conversations['anna-introduction'].status = 'completed';
  older.missions.bankVisit.completed = true;
  older.rewardClaims = ['lesson:bank-visit'];
  delete older.lessons['shopping-basics'];
  delete older.conversations['shopping-conversation'];

  const restored = learning.normalizeProgress(JSON.parse(JSON.stringify(older)));
  assert.equal(restored.lessons['bank-basics'].status, 'completed');
  assert.equal(restored.lessons['shopping-basics'].status, 'not-started');
  assert.equal(restored.conversations['shopping-conversation'].status, 'not-started');
  assert.equal(learning.journalUnitsFor(restored).find(unit => unit.id === 'shopping').status, 'available');
  assert.equal(learning.currentMission(restored).id, 'chapter-complete');
  assert.deepEqual([...restored.rewardClaims], ['lesson:bank-visit']);
});

test('old completed Numbers & Prices saves stay completed and keep reward history', () => {
  const { learning } = loadLearning();
  const oldProgress = learning.emptyProgress();
  oldProgress.lessons['greetings-basics'].status = 'completed';
  oldProgress.conversations['anna-introduction'].status = 'completed';
  oldProgress.lessons['numbers-prices'].status = 'completed';
  oldProgress.lessons['numbers-prices'].completedAt = '2025-01-02T00:00:00.000Z';
  oldProgress.rewardClaims = ['lesson:numbers-prices'];
  const restored = learning.normalizeProgress(JSON.parse(JSON.stringify(oldProgress)));
  assert.equal(restored.lessons['numbers-prices'].status, 'completed');
  assert.deepEqual([...restored.rewardClaims], ['lesson:numbers-prices']);
  assert.equal(restored.missions.supermarket.objectives.completed, true);
  assert.equal(learning.currentMission(restored).id, 'bakery');
  assert.equal(learning.claimReward(restored, 'numbers-prices'), false);
});

test('the approved ten-level XP thresholds and ranks are calculated from XP alone', () => {
  const { learning } = loadLearning();
  const expected = [
    [1, 'Neuankömmling', 0], [2, 'Stadtentdecker', 20], [3, 'Grußfreund', 40],
    [4, 'Marktplatzbesucher', 60], [5, 'Zahlenkenner', 80], [6, 'Bäckereifreund', 100],
    [7, 'Cafébesucher', 125], [8, 'Stadtbummler', 150], [9, 'Nachbarschaftsfreund', 180],
    [10, 'Deutschstadt-Kenner', 210]
  ];
  assert.deepEqual(Array.from(learning.LEVELS, ({ level, rank, xp }) => [level, rank, xp]), expected);
  for (const [level, rank, xp] of expected) {
    const actual = learning.progressionForXp(xp);
    assert.equal(actual.level, level);
    assert.equal(actual.rank, rank);
  }
  for (let index = 1; index < expected.length; index += 1) {
    assert.equal(learning.progressionForXp(expected[index][2] - 1).level, expected[index - 1][0]);
  }
});

test('level-up transitions report every crossed threshold once, including multi-level rewards', () => {
  const { learning } = loadLearning();
  assert.deepEqual(Array.from(learning.levelUpsBetween(19, 20), level => level.level), [2]);
  assert.deepEqual(Array.from(learning.levelUpsBetween(39, 80), level => level.level), [3, 4, 5]);
  assert.equal(learning.levelUpsBetween(210, 260).length, 0);
  assert.equal(learning.levelUpsBetween(100, 99).length, 0);
});

test('level ten is the maximum state and XP remains cumulative beyond its threshold', () => {
  const { learning } = loadLearning();
  const atMaximum = learning.progressionForXp(210);
  assert.equal(atMaximum.level, 10);
  assert.equal(atMaximum.isMaxLevel, true);
  assert.equal(atMaximum.nextXp, null);
  assert.equal(atMaximum.progressPercent, 100);
  const overflow = learning.progressionForXp(260);
  assert.equal(overflow.currentXp, 260);
  assert.equal(overflow.level, 10);
  assert.equal(overflow.isMaxLevel, true);
});

test('legacy saves derive level from preserved XP without requiring a saved level field', () => {
  const { learning } = loadLearning();
  const legacySave = JSON.parse(JSON.stringify({ version: 5, xp: 75, learning: learning.emptyProgress() }));
  const xp = learning.normalizeXp(legacySave.xp);
  assert.equal(xp, 75);
  assert.equal(Object.hasOwn(legacySave, 'level'), false, 'save compatibility keeps XP as the only persisted progression value');
  assert.equal(learning.progressionForXp(xp).level, 4);
  assert.equal(learning.normalizeXp(-3), 0);
  assert.equal(learning.normalizeXp(Number.NaN), 0);
});

test('level progression does not change lesson prerequisites or duplicate reward protection', () => {
  const { learning } = loadLearning();
  const progress = learning.emptyProgress();
  assert.equal(learning.unitsFor(progress).find(unit => unit.id === 'greetings').status, 'available');
  assert.equal(learning.unitsFor(progress).find(unit => unit.id === 'numbers').status, 'locked');
  assert.equal(learning.claimReward(progress, 'bakery-order'), true);
  assert.equal(learning.claimReward(progress, 'bakery-order'), false);
  assert.equal(progress.rewardClaims.filter(id => id === 'lesson:bakery-order').length, 1);
});

test('a saved in-progress checkpoint can resume without losing its completion history', () => {
  const { learning } = loadLearning();
  const saved = learning.emptyProgress();
  saved.activeLesson = { lessonId: 'bakery-order', exerciseIndex: 2, correctAnswers: 1 };
  saved.lessons['bakery-order'].status = 'in-progress';
  const restored = learning.normalizeProgress(saved);
  let bakery = learning.unitsFor(restored).find(unit => unit.id === 'bakery');
  assert.equal(bakery.status, 'locked', 'a checkpoint does not bypass prerequisites');
  assert.equal(bakery.hasSavedCheckpoint, true);
  assert.deepEqual({ ...restored.activeLesson }, { lessonId: 'bakery-order', exerciseIndex: 2, correctAnswers: 1 });
  assert.equal(restored.lessons['bakery-order'].status, 'in-progress');
  restored.lessons['greetings-basics'].status = 'completed';
  restored.conversations['anna-introduction'].status = 'completed';
  restored.lessons['numbers-prices'].status = 'completed';
  bakery = learning.unitsFor(restored).find(unit => unit.id === 'bakery');
  assert.equal(bakery.status, 'available');
});

test('legacy mission and conversation progress survives normalization', () => {
  const { learning } = loadLearning();
  const saved = learning.emptyProgress();
  completePreBankLessons(saved);
  saved.missions.bankVisit.objectives.entered = true;
  saved.missions.bankVisit.objectives.atmUsed = true;
  saved.conversations['bank-employee'] = { status: 'in-progress', nodeId: 'documents', order: null, correctAnswers: 2 };
  saved.rewardClaims = ['lesson:bakery-order'];
  const restored = learning.normalizeProgress(saved);

  assert.equal(restored.missions.bankVisit.objectives.entered, true);
  assert.equal(restored.missions.bankVisit.objectives.atmUsed, true);
  assert.equal(restored.conversations['bank-employee'].nodeId, 'documents');
  assert.deepEqual([...restored.rewardClaims], ['lesson:bakery-order']);
  assert.equal(learning.unitsFor(restored).find(unit => unit.id === 'bank').status, 'available', 'an in-progress bank conversation remains resumable');
});

function completePreBankLessons(progress) {
  for (const id of ['greetings-basics', 'numbers-prices', 'bakery-order', 'cafe-conversation']) progress.lessons[id].status = 'completed';
  progress.conversations['anna-introduction'].status = 'completed';
}

test('a fully completed older bank save reconciles all objectives and keeps the reward claimed', () => {
  const { learning } = loadLearning();
  const legacy = {
    lessons: {
      'greetings-basics': { status: 'completed' }, 'numbers-prices': { status: 'completed' },
      'bakery-order': { status: 'completed' }, 'cafe-conversation': { status: 'completed' }, 'bank-basics': { status: 'completed' }
    },
    conversations: {
      'anna-introduction': { status: 'completed', nodeId: 'farewell' },
      'bank-employee': { status: 'completed', nodeId: 'goodbye' }
    },
    rewardClaims: ['lesson:bank-visit']
  };
  const restored = learning.normalizeProgress(legacy, { sceneId: 'town' });
  const mission = restored.missions.bankVisit;

  assert.equal(mission.completed, true);
  assert.deepEqual({ ...mission.objectives }, { entered: true, employeeTalked: true, accountPhrase: true, atmUsed: true, vocabularyComplete: true });
  assert.equal(restored.rewardClaims.filter(id => id === 'lesson:bank-visit').length, 1);
  assert.equal(learning.claimReward(restored, 'bank-visit'), false);
});

test('a completed bank conversation without ATM evidence does not complete the bank mission', () => {
  const { learning } = loadLearning();
  const saved = learning.emptyProgress();
  completePreBankLessons(saved);
  saved.lessons['bank-basics'].status = 'completed';
  saved.conversations['bank-employee'] = { status: 'completed', nodeId: 'goodbye' };
  const restored = learning.normalizeProgress(saved);

  assert.equal(restored.missions.bankVisit.objectives.entered, true);
  assert.equal(restored.missions.bankVisit.objectives.employeeTalked, true);
  assert.equal(restored.missions.bankVisit.objectives.accountPhrase, true);
  assert.equal(restored.missions.bankVisit.objectives.vocabularyComplete, true);
  assert.equal(restored.missions.bankVisit.objectives.atmUsed, false);
  assert.equal(restored.missions.bankVisit.completed, false);
  assert.equal(learning.currentMission(restored).objectId, 'bank-atm');
});

test('a partial older bank conversation restores only evidence-backed objectives', () => {
  const { learning } = loadLearning();
  const saved = learning.emptyProgress();
  completePreBankLessons(saved);
  saved.conversations['bank-employee'] = { status: 'in-progress', nodeId: 'documents', correctAnswers: 2 };
  const restored = learning.normalizeProgress(saved);
  const mission = restored.missions.bankVisit;

  assert.deepEqual({ ...mission.objectives }, { entered: true, employeeTalked: false, accountPhrase: true, atmUsed: false, vocabularyComplete: false });
  assert.equal(mission.completed, false);
  assert.equal(learning.currentMission(restored).id, 'bank');
});

test('an unstarted bank activity stays unstarted during normalization', () => {
  const { learning } = loadLearning();
  const saved = learning.emptyProgress();
  completePreBankLessons(saved);
  const restored = learning.normalizeProgress(saved);

  assert.equal(Object.values(restored.missions.bankVisit.objectives).some(Boolean), false);
  assert.equal(restored.missions.bankVisit.completed, false);
  assert.equal(learning.currentMission(restored).id, 'bank');
});

test('missing and malformed legacy bank fields normalize without false completion', () => {
  const { learning } = loadLearning();
  const restored = learning.normalizeProgress({
    conversations: 'invalid', missions: { bankVisit: { objectives: 'invalid', completed: 'yes' } }, rewardClaims: 'invalid'
  });

  assert.equal(Object.values(restored.missions.bankVisit.objectives).some(Boolean), false);
  assert.equal(restored.missions.bankVisit.completed, false);
  assert.deepEqual([...restored.rewardClaims], []);
});

test('normalizing a migrated bank save repeatedly is idempotent', () => {
  const { learning } = loadLearning();
  const saved = learning.emptyProgress();
  completePreBankLessons(saved);
  saved.lessons['bank-basics'].status = 'completed';
  saved.conversations['bank-employee'] = { status: 'completed', nodeId: 'goodbye' };
  saved.rewardClaims = ['lesson:bank-visit'];
  const once = learning.normalizeProgress(saved, { sceneId: 'bank' });
  const twice = learning.normalizeProgress(once, { sceneId: 'bank' });

  assert.deepEqual(JSON.parse(JSON.stringify(twice.missions.bankVisit)), JSON.parse(JSON.stringify(once.missions.bankVisit)));
  assert.deepEqual([...twice.rewardClaims], [...once.rewardClaims]);
});

test('optional bank conversations save vocabulary but do not complete the bank mission', () => {
  const { learning } = loadLearning();
  const progress = learning.emptyProgress();
  const session = learning.createConversationSession('bank-customer', progress);

  assert.equal(session.choose('waiting').correct, true);
  assert.equal(session.continue().complete, false);
  assert.equal(session.choose('thank').correct, true);
  assert.equal(session.continue().complete, true);
  assert.equal(progress.conversations['bank-customer'].status, 'completed');
  assert.equal(progress.vocabulary.bank_wait_here.correct, 1);
  assert.equal(progress.missions.bankVisit.completed, false);
  assert.ok(learning.normalizeProgress(progress).conversations['bank-customer']);
});

test('one-time reward claims cannot be reused after normalizing a save', () => {
  const { learning } = loadLearning();
  const progress = learning.normalizeProgress({ rewardClaims: ['lesson:bakery-order'] });

  assert.equal(learning.claimReward(progress, 'bakery-order'), false);
  assert.equal(learning.claimReward(progress, 'numbers-prices'), true);
  assert.equal(learning.claimReward(progress, 'numbers-prices'), false);
});

test('the bank vocabulary lesson evaluates its taught answer and completes', () => {
  const { lessons, learning } = loadLearning();
  const progress = learning.emptyProgress();
  const session = learning.createSession('bank-basics');
  const answer = session.exercise.options.find(option => option.id === session.exercise.answer).id;

  assert.equal(learning.evaluate(session.exercise, answer), true);
  assert.equal(session.submit(answer).correct, true);
  assert.equal(session.next(), true);
  assert.equal(session.complete, true);
  assert.equal(progress.lessons['bank-basics'].status, 'not-started', 'the game owns profile mutation around the reusable exercise session');
  assert.equal(lessons.lessons['bank-basics'].exercises.length, 1);
});

test('completed numbers-before-Anna saves stay completed without skipping Anna in the mission', () => {
  const { learning } = loadLearning();
  const saved = learning.emptyProgress();
  saved.lessons['greetings-basics'].status = 'completed';
  saved.lessons['numbers-prices'].status = 'completed';
  const restored = learning.normalizeProgress(saved);

  assert.equal(restored.lessons['numbers-prices'].status, 'completed');
  assert.equal(learning.unitsFor(restored).find(unit => unit.id === 'numbers').status, 'completed');
  assert.equal(learning.currentMission(restored).id, 'first-conversation');
});

test('the available chapter ends cleanly while future lessons remain locked', () => {
  const { learning } = loadLearning();
  const progress = learning.emptyProgress();
  for (const id of ['greetings-basics', 'numbers-prices', 'bakery-order', 'cafe-conversation', 'bank-basics']) progress.lessons[id].status = 'completed';
  progress.conversations['anna-introduction'].status = 'completed';
  progress.missions.bankVisit.completed = true;
  const mission = learning.currentMission(progress);
  const units = learning.unitsFor(progress);

  assert.equal(mission.status, 'complete');
  assert.equal(mission.action, 'explore');
  assert.equal(mission.destination, 'Free exploration');
  assert.equal(units.find(unit => unit.id === 'shopping').status, 'available', 'completed Bank prerequisite unlocks Shopping while the chapter mission remains complete');
  assert.equal(units.find(unit => unit.id === 'directions').status, 'locked');
  assert.equal(units.find(unit => unit.id === 'station').status, 'locked');
});

test('the Wochenmarkt side mission unlocks after introductions without changing main-story order', () => {
  const { learning } = loadLearning();
  const progress = learning.emptyProgress();
  const side = () => learning.sideMissionFor(progress, 'weekly-market');

  assert.equal(side().status, 'locked');
  assert.equal(side().destination, 'Learning Journal · Anna');
  assert.equal(learning.currentMission(progress).id, 'greetings');
  progress.conversations['weekly-market'].status = 'in-progress';
  assert.equal(learning.sideMissionFor(learning.normalizeProgress(progress), 'weekly-market').status, 'locked', 'a stray checkpoint cannot bypass unlock requirements');
  progress.conversations['weekly-market'].status = 'not-started';
  progress.lessons['greetings-basics'].status = 'completed';
  assert.equal(side().status, 'locked', 'Anna’s introduction is also required');
  progress.conversations['anna-introduction'].status = 'completed';
  assert.equal(side().status, 'available');
  assert.equal(side().action, 'talk');
  assert.equal(side().npcId, 'market-vendor');
  assert.equal(side().destination, 'Wochenmarkt');
  assert.equal(learning.currentMission(progress).id, 'numbers', 'the optional mission does not replace the active main objective');
});

test('the market conversation teaches, retries incorrect choices, and completes its side mission', () => {
  const { lessons, learning } = loadLearning();
  const progress = learning.emptyProgress();
  progress.lessons['greetings-basics'].status = 'completed';
  progress.conversations['anna-introduction'].status = 'completed';
  const initialMainMission = learning.currentMission(progress).id;
  const session = learning.createConversationSession('weekly-market', progress);
  assert.equal(learning.sideMissionFor(progress, 'weekly-market').status, 'in-progress');
  assert.equal(learning.sideMissionFor(progress, 'weekly-market').objective, 'Greet Frau Adler politely.');

  assert.equal(session.choose('goodbye').correct, false);
  assert.equal(session.node.speaker, 'Frau Adler, die Marktfrau');
  assert.equal(session.choose('greet').correct, true);
  assert.equal(session.choose('tomatoes').correct, true);
  assert.equal(session.order, 'tomatoes');
  assert.equal(session.choose('say-thanks').correct, false);
  assert.equal(session.node.german, 'Gern. Möchten Sie den Preis wissen?');
  assert.equal(session.choose('ask-price').correct, true);
  assert.equal(session.node.german, 'Die {item} kosten {price} Euro.');
  assert.equal(session.continue().complete, false);
  assert.equal(session.choose('ask-price-again').correct, false);
  assert.equal(session.choose('take-two').correct, true);
  assert.equal(session.choose('thank-vendor').correct, true);
  assert.equal(session.continue().complete, true);

  assert.equal(progress.conversations['weekly-market'].status, 'completed');
  assert.equal(progress.vocabulary.market_tomatoes.correct, 1);
  assert.equal(progress.vocabulary.market_tomatoes.topic, 'Auf dem Wochenmarkt');
  assert.equal(progress.vocabulary.market_price_question.correct, 1);
  assert.equal(progress.vocabulary.market_quantity.correct, 1);
  assert.equal(progress.vocabulary.market_quantity.incorrect, 0);
  assert.equal(learning.sideMissionFor(progress, 'weekly-market').status, 'completed');
  assert.equal(learning.currentMission(progress).id, initialMainMission);
  assert.equal(lessons.conversations['weekly-market'].rewardXp, 35);
  assert.equal(progress.rewardClaims.includes('lesson:weekly-market'), false, 'the learning engine itself does not claim rewards before game completion handling');
});

test('market completion reward is one-time and survives save normalization', () => {
  const { learning } = loadLearning();
  const progress = learning.emptyProgress();
  progress.lessons['greetings-basics'].status = 'completed';
  progress.conversations['anna-introduction'].status = 'completed';
  const session = learning.createConversationSession('weekly-market', progress);
  for (const choice of ['greet', 'apples', 'ask-price']) assert.equal(session.choose(choice).correct, true);
  session.continue();
  session.continue();
  for (const choice of ['take-two', 'thank-vendor']) assert.equal(session.choose(choice).correct, true);
  assert.equal(session.continue().complete, true);

  assert.equal(learning.claimReward(progress, 'weekly-market'), true);
  assert.equal(learning.claimReward(progress, 'weekly-market'), false);
  progress.sideMissions['weekly-market'] = { status: 'completed', completedAt: new Date().toISOString() };
  const replay = learning.createConversationSession('weekly-market', progress);
  for (const choice of ['greet', 'flowers', 'ask-price']) assert.equal(replay.choose(choice).correct, true);
  replay.continue();
  replay.continue();
  for (const choice of ['take-two', 'thank-vendor']) assert.equal(replay.choose(choice).correct, true);
  assert.equal(replay.continue().complete, true);
  assert.equal(learning.claimReward(progress, 'weekly-market'), false, 'replaying the finished conversation cannot claim XP again');
  const restored = learning.normalizeProgress(JSON.parse(JSON.stringify(progress)));
  assert.equal(learning.sideMissionFor(restored, 'weekly-market').status, 'completed');
  assert.equal(restored.rewardClaims.includes('lesson:weekly-market'), true);
  assert.equal(learning.claimReward(restored, 'weekly-market'), false, 'refreshing cannot claim the mission reward again');
  const again = learning.normalizeProgress(restored);
  assert.equal(learning.sideMissionFor(again, 'weekly-market').status, 'completed');
  assert.deepEqual([...again.rewardClaims], [...restored.rewardClaims]);
});

test('an in-progress market conversation restores its selected product and tracker objective', () => {
  const { learning } = loadLearning();
  const progress = learning.emptyProgress();
  progress.lessons['greetings-basics'].status = 'completed';
  progress.conversations['anna-introduction'].status = 'completed';
  const session = learning.createConversationSession('weekly-market', progress);
  session.choose('greet');
  session.choose('flowers');
  session.choose('ask-price');

  const restored = learning.normalizeProgress(JSON.parse(JSON.stringify(progress)));
  assert.equal(restored.conversations['weekly-market'].status, 'in-progress');
  assert.equal(restored.conversations['weekly-market'].nodeId, 'price-answer');
  assert.equal(restored.conversations['weekly-market'].order, 'flowers');
  assert.equal(learning.sideMissionFor(restored, 'weekly-market').objective, 'Listen and understand the price.');
  assert.equal(learning.sideMissionFor(restored, 'weekly-market').destination, 'Wochenmarkt');
});

test('new and legacy chapter-complete saves keep the main chapter intact with the optional market quest', () => {
  const { learning } = loadLearning();
  const fresh = learning.normalizeProgress(null);
  assert.equal(learning.sideMissionFor(fresh, 'weekly-market').status, 'locked');
  assert.equal(learning.currentMission(fresh).id, 'greetings');

  const legacy = learning.emptyProgress();
  for (const id of ['greetings-basics', 'numbers-prices', 'bakery-order', 'cafe-conversation', 'bank-basics']) legacy.lessons[id].status = 'completed';
  legacy.conversations['anna-introduction'].status = 'completed';
  legacy.missions.bankVisit.completed = true;
  legacy.rewardClaims = ['lesson:bank-visit', 'lesson:bakery-order'];
  const restored = learning.normalizeProgress(JSON.parse(JSON.stringify(legacy)));
  assert.equal(learning.currentMission(restored).status, 'complete');
  assert.equal(learning.sideMissionFor(restored, 'weekly-market').status, 'available');
  assert.ok(restored.rewardClaims.includes('lesson:bank-visit'));
  assert.ok(restored.rewardClaims.includes('lesson:bakery-order'));
  assert.equal(restored.sideMissions['weekly-market'].completedAt, null);
});

test('Rathaus side mission branches, retries wrong answers, and waits for the office sign task', () => {
  const { lessons, learning } = loadLearning();
  const progress = learning.emptyProgress();
  progress.lessons['greetings-basics'].status = 'completed';
  progress.conversations['anna-introduction'].status = 'completed';
  const mainMission = learning.currentMission(progress).id;
  assert.equal(learning.sideMissionFor(progress, 'rathaus').status, 'available');
  progress.rewardClaims.push('lesson:weekly-market');
  assert.equal(learning.currentSideMission(progress).id, 'rathaus', 'the tracker advances to Rathaus after the earlier optional market quest is complete');
  const session = learning.createConversationSession('rathaus-help', progress);
  assert.equal(session.choose('goodbye').correct, false);
  assert.equal(session.node.speaker, 'Frau Neumann · Rathausmitarbeiterin');
  assert.equal(session.choose('appointment').correct, true);
  assert.equal(session.node.german.includes('Büro 2'), true, 'response branch reflects the appointment choice');
  assert.equal(session.choose('ask-info').correct, true);
  assert.equal(session.choose('confuse').correct, false);
  assert.equal(session.choose('guide').correct, true);
  assert.equal(session.continue().complete, true);
  assert.equal(learning.sideMissionFor(progress, 'rathaus').status, 'in-progress', 'conversation alone is not mission completion');
  assert.equal(learning.sideMissionFor(progress, 'rathaus').objective, lessons.sideMissions.rathaus.objectives['office-sign']);
  assert.equal(learning.currentSideMission(progress).objective, lessons.sideMissions.rathaus.objectives['office-sign'], 'tracker next step agrees with the required remaining task');
  assert.equal(learning.completeSideMissionObjective(progress, 'rathaus', 'unknown'), false);
  assert.equal(learning.completeSideMissionObjective(progress, 'rathaus', 'office-sign'), true);
  assert.equal(learning.sideMissionFor(progress, 'rathaus').status, 'completed');
  assert.equal(learning.completeSideMissionObjective(progress, 'rathaus', 'office-sign'), false);
  assert.equal(learning.currentMission(progress).id, mainMission, 'optional mission leaves story progression unchanged');
  assert.equal(lessons.conversations['rathaus-help'].nodes.welcome.choices.find(choice => choice.id === 'appointment').translation, 'I have an appointment.');
  assert.equal(lessons.conversations['rathaus-help'].nodes['form-help'].choices[0].text, 'Können Sie mir das bitte erklären?');
  assert.equal(progress.vocabulary.appointment.correct, 1, 'correct choices update the existing vocabulary review system');
});

test('Wohnhaus bag mission requires dialogue and all three vocabulary clue interactions', () => {
  const { learning } = loadLearning();
  const progress = learning.emptyProgress();
  progress.lessons['greetings-basics'].status = 'completed';
  progress.conversations['anna-introduction'].status = 'completed';
  const mainMission = learning.currentMission(progress).id;
  const session = learning.createConversationSession('home-lukas', progress);
  assert.equal(session.choose('ignore').correct, false);
  assert.equal(session.choose('help').correct, true);
  assert.equal(session.choose('search').correct, true);
  assert.equal(session.choose('understand-key').correct, true);
  assert.equal(session.continue().complete, true);
  assert.equal(learning.sideMissionFor(progress, 'wohnhaus').status, 'in-progress');
  for (const id of ['table-clue', 'cupboard-clue']) {
    assert.equal(learning.completeSideMissionObjective(progress, 'wohnhaus', id), true);
    assert.equal(learning.sideMissionFor(progress, 'wohnhaus').status, 'in-progress');
  }
  assert.equal(learning.completeSideMissionObjective(progress, 'wohnhaus', 'kitchen-bag'), true);
  assert.equal(learning.sideMissionFor(progress, 'wohnhaus').status, 'completed');
  assert.equal(learning.currentMission(progress).id, mainMission);
  const restored = learning.normalizeProgress(JSON.parse(JSON.stringify(progress)));
  assert.equal(learning.sideMissionFor(restored, 'wohnhaus').status, 'completed', 'all clue flags survive reload normalization');
  assert.equal(learning.claimReward(restored, 'wohnhaus'), true);
  assert.equal(learning.claimReward(learning.normalizeProgress(JSON.parse(JSON.stringify(restored))), 'wohnhaus'), false, 'completion reward claim survives refresh');
});

test('old completed-chapter saves unlock optional home and Rathaus quests without completing them', () => {
  const { learning } = loadLearning();
  const old = learning.emptyProgress();
  for (const id of ['greetings-basics', 'numbers-prices', 'bakery-order', 'cafe-conversation', 'bank-basics']) old.lessons[id].status = 'completed';
  old.conversations['anna-introduction'].status = 'completed';
  old.missions.bankVisit.completed = true;
  old.rewardClaims = ['lesson:bank-visit'];
  const restored = learning.normalizeProgress(JSON.parse(JSON.stringify(old)));
  assert.equal(learning.currentMission(restored).status, 'complete');
  assert.equal(learning.sideMissionFor(restored, 'rathaus').status, 'available');
  assert.equal(learning.sideMissionFor(restored, 'wohnhaus').status, 'available');
  assert.equal(restored.sideMissions.rathaus.objectives.conversation, false);
});
