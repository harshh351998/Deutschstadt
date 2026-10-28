// Reusable exercise evaluation and local learning-progress helpers.
(() => {
  'use strict';
  const catalog = window.DeutschstadtLessons;
  const knownLessons = Object.values(catalog.lessons);
  const validLessonIds = new Set(knownLessons.map(lesson => lesson.id));
  const knownConversations = Object.values(catalog.conversations || {});
  const DAY = 24 * 60 * 60 * 1000;
  const LEVELS = Object.freeze([
    { level: 1, rank: 'Neuankömmling', xp: 0 },
    { level: 2, rank: 'Stadtentdecker', xp: 20 },
    { level: 3, rank: 'Grußfreund', xp: 40 },
    { level: 4, rank: 'Marktplatzbesucher', xp: 60 },
    { level: 5, rank: 'Zahlenkenner', xp: 80 },
    { level: 6, rank: 'Bäckereifreund', xp: 100 },
    { level: 7, rank: 'Cafébesucher', xp: 125 },
    { level: 8, rank: 'Stadtbummler', xp: 150 },
    { level: 9, rank: 'Nachbarschaftsfreund', xp: 180 },
    { level: 10, rank: 'Deutschstadt-Kenner', xp: 210 }
  ]);

  function normalizeXp(value) { return Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0; }

  function progressionForXp(value) {
    const xp = normalizeXp(value);
    let current = LEVELS[0];
    for (const level of LEVELS) {
      if (xp < level.xp) break;
      current = level;
    }
    const next = LEVELS[current.level] || null;
    const xpIntoLevel = xp - current.xp;
    const xpToNext = next ? next.xp - current.xp : 0;
    return {
      ...current, currentXp: xp, nextXp: next?.xp ?? null, nextRank: next?.rank ?? null,
      xpIntoLevel, xpToNext, isMaxLevel: !next,
      progressPercent: next ? Math.min(100, (xpIntoLevel / xpToNext) * 100) : 100
    };
  }

  function levelUpsBetween(previousXp, currentXp) {
    const previous = normalizeXp(previousXp);
    const current = normalizeXp(currentXp);
    if (current <= previous) return [];
    return LEVELS.filter(level => level.xp > previous && level.xp <= current).map(level => ({ ...level }));
  }

  function emptyProgress() {
    const lessons = Object.fromEntries(knownLessons.map(lesson => [lesson.id, { status: 'not-started', attempts: 0, completedAt: null, correctAnswers: 0 }]));
    const vocabulary = Object.fromEntries(Object.entries(catalog.vocabulary).map(([id, definition]) => [id, {
      id, german: definition.german, english: definition.english, example: definition.example, lessonId: definition.lessonId, topic: definition.topic || null,
      correct: 0, incorrect: 0, hasAnsweredCorrectly: false, correctStreak: 0, history: [], nextReviewAt: null, status: 'learning'
    }]));
    const conversations = Object.fromEntries(knownConversations.map(conversation => [conversation.id, { status: 'not-started', nodeId: conversation.startNode, order: null, correctAnswers: 0 }]));
    return {
      lessons, vocabulary, rewardClaims: [], activeLesson: null, conversations,
      sideMissions: Object.fromEntries(Object.keys(catalog.sideMissions || {}).map(id => [id, { status: 'locked', completedAt: null, objectives: {} }])),
      missions: {
        bankVisit: { objectives: { entered: false, employeeTalked: false, accountPhrase: false, atmUsed: false, vocabularyComplete: false }, completed: false, completedAt: null },
        supermarket: { objectives: { entered: false, practiced: false, completed: false }, completedAt: null }
      }
    };
  }
  function asCount(value) { return Number.isInteger(value) && value >= 0 ? value : 0; }
  function normalizeDate(value) { return typeof value === 'string' && Number.isFinite(Date.parse(value)) ? new Date(value).toISOString() : null; }

  function normalizeProgress(raw, context = {}) {
    const source = raw && typeof raw === 'object' ? raw : {};
    const result = emptyProgress();
    for (const lesson of knownLessons) {
      const saved = source.lessons?.[lesson.id];
      const status = ['not-started', 'in-progress', 'completed'].includes(saved?.status) ? saved.status : 'not-started';
      result.lessons[lesson.id] = {
        status,
        attempts: asCount(saved?.attempts),
        completedAt: normalizeDate(saved?.completedAt),
        correctAnswers: asCount(saved?.correctAnswers)
      };
    }
    for (const [id, definition] of Object.entries(catalog.vocabulary)) {
      const saved = source.vocabulary?.[id] || {};
      const history = Array.isArray(saved.history) ? saved.history.filter(entry => entry && typeof entry.correct === 'boolean' && Number.isFinite(entry.answeredAt)).slice(-50).map(entry => ({ correct: entry.correct, answeredAt: entry.answeredAt })) : [];
      const streak = asCount(saved.correctStreak);
      result.vocabulary[id] = {
        id, german: definition.german, english: definition.english, example: definition.example, lessonId: definition.lessonId, topic: definition.topic || null,
        correct: asCount(saved.correct), incorrect: asCount(saved.incorrect), hasAnsweredCorrectly: asCount(saved.correct) > 0, correctStreak: streak,
        history, nextReviewAt: normalizeDate(saved.nextReviewAt), status: streak >= 3 ? 'reviewing' : 'learning'
      };
    }
    for (const conversation of knownConversations) {
      const saved = source.conversations?.[conversation.id];
      const legacyNodeId = conversation.id === 'cafe-waiter' && saved?.nodeId === 'thanks' ? 'bill-question' : saved?.nodeId;
      const nodeId = Object.hasOwn(conversation.nodes, legacyNodeId) ? legacyNodeId : conversation.startNode;
      const validOrders = new Set(['coffee', 'water', 'bread', 'cake', ...Object.keys(conversation.orders || {})]);
      result.conversations[conversation.id] = {
        status: ['not-started', 'in-progress', 'completed'].includes(saved?.status) ? saved.status : 'not-started',
        nodeId,
        order: validOrders.has(saved?.order) ? saved.order : null,
        correctAnswers: asCount(saved?.correctAnswers)
      };
    }
    result.rewardClaims = Array.isArray(source.rewardClaims) ? [...new Set(source.rewardClaims.filter(id => typeof id === 'string' && /^lesson:[\w-]+$/.test(id)))].slice(-100) : [];
    const savedSupermarket = source.missions?.supermarket;
    const supermarketConversation = result.conversations['supermarket-shopping'];
    const supermarketCompleted = result.lessons['numbers-prices'].status === 'completed'
      || savedSupermarket?.objectives?.completed === true || supermarketConversation?.status === 'completed';
    result.missions.supermarket = {
      objectives: {
        entered: savedSupermarket?.objectives?.entered === true || context.sceneId === 'supermarket',
        practiced: savedSupermarket?.objectives?.practiced === true || ['in-progress', 'completed'].includes(supermarketConversation?.status),
        completed: supermarketCompleted
      },
      completedAt: normalizeDate(savedSupermarket?.completedAt) || result.lessons['numbers-prices'].completedAt
    };
    const savedBankMission = source.missions?.bankVisit;
    const bankObjectiveIds = ['entered', 'employeeTalked', 'accountPhrase', 'atmUsed', 'vocabularyComplete'];
    for (const objectiveId of bankObjectiveIds) result.missions.bankVisit.objectives[objectiveId] = savedBankMission?.objectives?.[objectiveId] === true;
    result.missions.bankVisit.completedAt = normalizeDate(savedBankMission?.completedAt);
    const bankConversation = result.conversations['bank-employee'];
    const bankConversationProgress = ['bank-employee', 'bank-reception', 'bank-customer']
      .some(id => result.conversations[id]?.status === 'in-progress' || result.conversations[id]?.status === 'completed');
    const completedAccountRequest = bankConversation.status === 'completed'
      || (bankConversation.status === 'in-progress' && ['documents', 'thanks', 'goodbye'].includes(bankConversation.nodeId));
    const bankRewardClaimed = result.rewardClaims.includes('lesson:bank-visit');
    const mission = result.missions.bankVisit;
    const objectives = mission.objectives;
    const explicitObjectiveEvidence = bankObjectiveIds.some(id => objectives[id]);
    const bankNpcGreeted = Array.isArray(context.greeted) && ['helena', 'mina', 'herr-schneider'].some(id => context.greeted.includes(id));
    objectives.entered = objectives.entered || context.sceneId === 'bank' || bankNpcGreeted || bankConversationProgress || explicitObjectiveEvidence;
    objectives.employeeTalked = objectives.employeeTalked || bankConversation.status === 'completed';
    objectives.accountPhrase = objectives.accountPhrase || completedAccountRequest;
    objectives.vocabularyComplete = objectives.vocabularyComplete || result.lessons['bank-basics'].status === 'completed';
    const allObjectivesComplete = bankObjectiveIds.every(id => objectives[id]);
    mission.completed = savedBankMission?.completed === true || bankRewardClaimed || allObjectivesComplete;
    if (mission.completed) {
      for (const id of bankObjectiveIds) objectives[id] = true;
      // A completion flag or the one-time reward claim proves the old mission
      // already completed. Record the claim during migration so it cannot pay twice.
      if (!result.rewardClaims.includes('lesson:bank-visit')) result.rewardClaims.push('lesson:bank-visit');
    }
    for (const [id, definition] of Object.entries(catalog.sideMissions || {})) {
      const saved = source.sideMissions?.[id];
      const checkpoint = result.conversations[definition.conversationId];
      const unlocked = result.lessons[definition.requiresLessonId]?.status === 'completed'
        && result.conversations[definition.requiresConversationId]?.status === 'completed';
      const objectives = Object.fromEntries((definition.requiredObjectives || []).map(objectiveId => [objectiveId,
        saved?.objectives?.[objectiveId] === true || (objectiveId === 'conversation' && checkpoint?.status === 'completed')]));
      const claimed = result.rewardClaims.includes(`lesson:${id}`);
      const completed = claimed || ((definition.requiredObjectives || []).length
        ? (definition.requiredObjectives || []).every(objectiveId => objectives[objectiveId])
        : checkpoint?.status === 'completed');
      if (claimed) for (const objectiveId of Object.keys(objectives)) objectives[objectiveId] = true;
      result.sideMissions[id] = {
        status: completed ? 'completed' : !unlocked ? 'locked' : checkpoint?.status === 'in-progress' || (checkpoint?.status === 'completed' && (definition.requiredObjectives || []).length > 0) || Object.values(objectives).some(Boolean) ? 'in-progress' : 'available',
        completedAt: completed ? normalizeDate(saved?.completedAt) || new Date().toISOString() : null,
        objectives
      };
    }
    const active = source.activeLesson;
    if (active && validLessonIds.has(active.lessonId)) {
      const lesson = catalog.lessons[active.lessonId];
      if (Number.isInteger(active.exerciseIndex) && active.exerciseIndex >= 0 && active.exerciseIndex < lesson.exercises.length) {
        result.activeLesson = { lessonId: active.lessonId, exerciseIndex: active.exerciseIndex, correctAnswers: asCount(active.correctAnswers) };
      }
    }
    return result;
  }

  function normalizeAnswer(value) {
    return String(value ?? '').trim().toLocaleLowerCase('de-DE').replace(/[.!?…,:;]+$/u, '').replace(/\s+/g, ' ');
  }

  function evaluate(exercise, response) {
    if (exercise.type === 'sentence-build') return normalizeAnswer(response) === normalizeAnswer(exercise.answer);
    if (exercise.type === 'de-en' || exercise.type === 'en-de') return (exercise.acceptedAnswers || []).some(answer => normalizeAnswer(answer) === normalizeAnswer(response));
    if (exercise.type === 'fill-blank') return normalizeAnswer(response) === normalizeAnswer(exercise.answer);
    return String(response ?? '') === String(exercise.answer ?? '');
  }

  function recordAnswer(progress, exercise, isCorrect, now = Date.now()) {
    for (const id of new Set(exercise.vocabularyIds || [])) {
      const word = progress.vocabulary[id];
      if (!word) continue;
      if (isCorrect) { word.correct++; word.correctStreak++; }
      else { word.incorrect++; word.correctStreak = 0; }
      word.hasAnsweredCorrectly = word.correct > 0;
      word.status = word.correctStreak >= 3 ? 'reviewing' : 'learning';
      const delay = isCorrect ? [1, 3, 7, 14, 30][Math.min(word.correctStreak - 1, 4)] * DAY : 10 * 60 * 1000;
      word.nextReviewAt = new Date(now + delay).toISOString();
      word.history.push({ correct: isCorrect, answeredAt: now });
      if (word.history.length > 50) word.history.splice(0, word.history.length - 50);
    }
  }

  function createSession(lessonId, exerciseIndex = 0, correctAnswers = 0) {
    const lesson = catalog.lessons[lessonId];
    if (!lesson) throw new Error(`Unknown lesson: ${lessonId}`);
    let index = Math.min(Math.max(0, exerciseIndex), lesson.exercises.length);
    let score = asCount(correctAnswers);
    let answered = false;
    return {
      lesson,
      get index() { return index; },
      get score() { return score; },
      get exercise() { return lesson.exercises[index] || null; },
      get complete() { return index >= lesson.exercises.length; },
      submit(response) {
        if (this.complete || answered) return null;
        const exercise = this.exercise;
        const correct = evaluate(exercise, response);
        if (correct) score++;
        answered = true;
        return { correct, response, exercise, feedback: correct ? exercise.feedbackCorrect : exercise.feedbackIncorrect };
      },
      retry() {
        if (!answered || this.complete) return false;
        answered = false;
        return true;
      },
      next() { if (!answered || this.complete) return false; index++; answered = false; return true; }
    };
  }

  function createConversationSession(conversationId, progress) {
    const conversation = catalog.conversations?.[conversationId];
    if (!conversation) throw new Error(`Unknown conversation: ${conversationId}`);
    let checkpoint = progress.conversations[conversationId];
    if (checkpoint.status !== 'in-progress') {
      checkpoint = progress.conversations[conversationId] = { status: 'in-progress', nodeId: conversation.startNode, order: null, correctAnswers: 0 };
    }
    const finish = () => {
      checkpoint.status = 'completed';
      if (conversation.trackLessonCompletion !== false && progress.lessons[conversation.lessonId]) {
        const lesson = progress.lessons[conversation.lessonId];
        lesson.status = 'completed';
        lesson.completedAt = new Date().toISOString();
        lesson.correctAnswers = checkpoint.correctAnswers;
      }
      return { complete: true, correctAnswers: checkpoint.correctAnswers };
    };
    const session = {
      get node() { return conversation.nodes[checkpoint.nodeId]; },
      get order() { return checkpoint.order; },
      get correctAnswers() { return checkpoint.correctAnswers; },
      choose(choiceId) {
        const node = this.node;
        const choice = node?.choices?.find(item => item.id === choiceId);
        if (!choice) return null;
        recordAnswer(progress, { vocabularyIds: choice.vocabularyIds || node.vocabularyIds }, choice.correct);
        if (!choice.correct) return { correct: false, feedback: choice.feedback, choice, node };
        checkpoint.correctAnswers++;
        if (choice.storeOrder) checkpoint.order = choice.storeOrder;
        if (choice.next === 'complete') return { correct: true, feedback: choice.feedback, choice, node, ...finish() };
        checkpoint.nodeId = choice.next;
        return { correct: true, feedback: choice.feedback, choice, node };
      },
      continue() {
        const node = this.node;
        if (!node || node.choices?.length) return null;
        if (node.next === 'complete') return finish();
        if (!conversation.nodes[node.next]) return null;
        checkpoint.nodeId = node.next;
        return { complete: false, node: this.node };
      }
    };
    return session;
  }

  function unitsFor(progress) {
    const hasReviewWords = Object.values(progress.vocabulary).some(word => word.correct + word.incorrect > 0);
    const conversations = Object.values(catalog.conversations || {});
    return catalog.units.map((unit, index) => {
      const lesson = unit.lessonId && progress.lessons[unit.lessonId];
      const lessonDefinition = unit.lessonId && catalog.lessons[unit.lessonId];
      const hasExerciseContent = Boolean(lessonDefinition?.exercises?.length);
      const lessonConversations = unit.lessonId ? conversations.filter(conversation => conversation.lessonId === unit.lessonId && conversation.startNode && conversation.nodes?.[conversation.startNode]) : [];
      const hasConversationContent = lessonConversations.length > 0;
      const playable = Boolean(lessonDefinition && (hasExerciseContent || hasConversationContent));
      const hasSavedCheckpoint = progress.activeLesson?.lessonId === unit.lessonId
        || lessonConversations.some(conversation => progress.conversations[conversation.id]?.status === 'in-progress');
      const lessonPrerequisiteMet = !unit.requiresLessonId || progress.lessons[unit.requiresLessonId]?.status === 'completed';
      const conversationPrerequisiteMet = !unit.requiresConversationId || progress.conversations[unit.requiresConversationId]?.status === 'completed';
      const prerequisiteMet = lessonPrerequisiteMet && conversationPrerequisiteMet;
      const status = lesson?.status === 'completed' ? 'completed'
        : unit.id === 'review' && hasReviewWords ? 'available'
          : playable && prerequisiteMet ? 'available' : 'locked';
      const requiredLesson = unit.requiresLessonId && catalog.lessons[unit.requiresLessonId];
      const requiredConversation = unit.requiresConversationId && catalog.conversations[unit.requiresConversationId];
      const lockedReason = status !== 'locked' ? null
        : unit.id === 'review' ? 'Answer a few lesson questions to unlock word review.'
          : !playable ? 'Coming later — lesson activities are not available yet.'
          : requiredLesson && !lessonPrerequisiteMet ? `Complete “${requiredLesson.title}” to unlock this lesson.`
            : requiredConversation ? `Complete your conversation with ${requiredConversation.displayName || 'this character'} to unlock this lesson.`
            : 'Complete the previous unit to unlock this lesson.';
      return { ...unit, order: index + 1, status, lockedReason, playable, hasExerciseContent, hasConversationContent, hasSavedCheckpoint };
    });
  }

  function journalUnitsFor(progress) {
    return unitsFor(progress).filter(unit => !unit.locationId || ['numbers', 'shopping', 'station'].includes(unit.id));
  }

  // A single view of the next required activity. It is derived from existing
  // lesson, conversation, and bank-mission save fields so no parallel mission
  // state can drift out of sync with the Learning Journal.
  function currentMission(progress) {
    const lesson = id => progress.lessons[id] || { status: 'not-started' };
    const conversation = id => progress.conversations[id] || { status: 'not-started' };
    const make = (id, title, objective, destination, target = {}, progressLabel = null) => ({ id, title, objective, destination, progressLabel, ...target });
    const nodeObjective = (id, map, fallback) => conversation(id).status === 'in-progress' ? (map[conversation(id).nodeId] || fallback) : fallback;
    if (lesson('greetings-basics').status !== 'completed') return make('greetings', 'Greetings & introductions', progress.activeLesson?.lessonId === 'greetings-basics' ? 'Resume the greeting lesson in the Learning Journal.' : 'Start the greeting lesson in the Learning Journal.', 'Learning Journal', { action: 'lesson', lessonId: 'greetings-basics' });
    if (conversation('anna-introduction').status !== 'completed') return make('first-conversation', 'First conversation', nodeObjective('anna-introduction', { welcome: 'Tell Anna your name.', 'nice-to-meet-you': 'Thank Anna or say goodbye.', farewell: 'Finish your conversation with Anna.' }, 'Meet Anna and introduce yourself.'), 'Town square', { sceneId: 'town', npcId: 'anna', action: 'talk' });
    if (lesson('numbers-prices').status !== 'completed') {
      const market = progress.missions?.supermarket || { objectives: {} };
      const shopping = conversation('supermarket-shopping');
      const objective = shopping.status === 'in-progress'
        ? ({ welcome: 'Ask Herr Weber about the apples.', price: 'Listen and choose the correct apple price.', order: 'Tell Herr Weber you will take the apples.', goodbye: 'Finish your shopping conversation.' }[shopping.nodeId] || 'Continue your shopping conversation.')
        : market.objectives.entered ? 'Talk to Herr Weber to practise numbers and prices.' : 'Enter the Supermarkt and talk to Herr Weber.';
      const completedSteps = Number(market.objectives.entered) + Number(market.objectives.practiced);
      return make('numbers', 'Numbers & prices', objective, 'Supermarkt', {
        sceneId: 'supermarket', npcId: 'shopkeeper', doorId: 'supermarket-entrance', action: market.objectives.entered ? 'talk' : 'enter',
        progressLabel: `${completedSteps} / 3 steps`
      });
    }
    if (lesson('bakery-order').status !== 'completed') return make('bakery', 'A Morning at the Bakery', nodeObjective('bakery-counter', { welcome: 'Choose bread or a bread roll.', 'price-question': 'Ask Emil how much it costs.', price: 'Listen to the price in euros.', payment: 'Pay the matching amount.', thanks: 'Thank Emil politely.', farewell: 'Finish the bakery conversation.' }, 'Enter the bakery and talk to Emil.'), 'Bakery · Market Square', { sceneId: 'bakery', npcId: 'emil', doorId: 'bakery-entrance', action: 'talk' });
    if (lesson('cafe-conversation').status !== 'completed') return make('cafe', 'Café and Restaurant', nodeObjective('cafe-waiter', { welcome: 'Greet Greta.', order: 'Choose coffee, water, bread, or cake.', 'coffee-response': 'Listen to Greta’s response.', 'water-response': 'Listen to Greta’s response.', 'bread-response': 'Listen to Greta’s response.', 'cake-response': 'Listen to Greta’s response.', 'bill-question': 'Ask Greta for the bill.', closing: 'Thank Greta for the bill.', farewell: 'Finish your café conversation.' }, 'Enter the café and talk to Greta.'), 'Café am Platz', { sceneId: 'cafe', npcId: 'greta', doorId: 'cafe-entrance', action: 'talk' });
    const bank = progress.missions.bankVisit;
    if (!bank.completed) {
      const done = Object.values(bank.objectives).filter(Boolean).length;
      const progressLabel = `${done} / ${Object.keys(bank.objectives).length} objectives`;
      if (!bank.objectives.entered) return make('bank', 'A Visit to the Bank', 'Enter the bank and speak to Frau Becker.', 'Stadtbank Deutschstadt', { sceneId: 'bank', npcId: 'helena', doorId: 'bank-entrance', action: 'enter' }, progressLabel);
      if (!bank.objectives.employeeTalked) return make('bank', 'A Visit to the Bank', 'Speak with Frau Becker at the service counter.', 'Stadtbank · service counter', { sceneId: 'bank', npcId: 'helena', action: 'talk' }, progressLabel);
      if (!bank.objectives.atmUsed) return make('bank', 'A Visit to the Bank', 'Try one option at the Geldautomat.', 'Stadtbank · Geldautomat', { sceneId: 'bank', objectId: 'bank-atm', action: 'interact' }, progressLabel);
      if (!bank.objectives.vocabularyComplete) return make('bank', 'A Visit to the Bank', 'Complete the short bank vocabulary question.', 'Learning Journal', { sceneId: 'bank', action: 'lesson', lessonId: 'bank-basics' }, progressLabel);
    }
    if (lesson('bank-basics').status !== 'completed') return make('bank-vocabulary', 'Opening a bank account', 'Complete the short bank vocabulary lesson in the Learning Journal.', 'Learning Journal', { sceneId: 'bank', action: 'lesson', lessonId: 'bank-basics' });
    return make('chapter-complete', 'Chapter complete', 'You have completed the available lessons. Keep exploring the town or review a completed lesson.', 'Free exploration', { status: 'complete', action: 'explore' });
  }

  function conversationLessonRedirect(progress, conversationId) {
    const conversation = catalog.conversations[conversationId];
    const mission = currentMission(progress);
    if (!conversation || mission.action !== 'lesson' || conversation.lessonId !== mission.lessonId) return null;
    return { lessonId: mission.lessonId, destination: mission.destination, objective: mission.objective };
  }

  function sideMissionFor(progress, sideMissionId) {
    const definition = catalog.sideMissions?.[sideMissionId];
    if (!definition) return null;
    const checkpoint = progress.conversations?.[definition.conversationId] || { status: 'not-started', nodeId: 'welcome' };
    const saved = progress.sideMissions?.[sideMissionId] || { status: 'locked', objectives: {} };
    const unlocked = progress.lessons?.[definition.requiresLessonId]?.status === 'completed'
      && progress.conversations?.[definition.requiresConversationId]?.status === 'completed';
    const required = definition.requiredObjectives || [];
    const completed = progress.rewardClaims?.includes(`lesson:${sideMissionId}`) || (required.length
      ? required.every(objectiveId => objectiveId === 'conversation' ? checkpoint.status === 'completed' : saved.objectives?.[objectiveId] === true)
      : checkpoint.status === 'completed');
    const inProgress = checkpoint.status === 'in-progress' || (checkpoint.status === 'completed' && required.length > 0) || Object.values(saved.objectives || {}).some(Boolean);
    const status = completed ? 'completed' : !unlocked ? 'locked' : inProgress ? 'in-progress' : 'available';
    const incompleteObjective = required.find(objectiveId => objectiveId !== 'conversation' && saved.objectives?.[objectiveId] !== true);
    const objective = status === 'completed' ? `Completed · review the new words in your Learning Journal.`
      : status === 'locked' ? 'Complete your greetings lesson and introduction with Anna to unlock this side mission.'
        : status === 'in-progress' ? (definition.objectives?.[checkpoint.nodeId] || (incompleteObjective && definition.objectives?.[incompleteObjective]) || 'Continue the side mission.')
          : `Visit ${definition.destination} and speak with the local resident.`;
    return {
      ...definition, status, objective,
      objectives: { ...(saved.objectives || {}) },
      destination: status === 'locked' ? 'Learning Journal · Anna' : definition.destination,
      action: status === 'locked' ? 'unavailable' : status === 'completed' ? 'complete' : 'talk'
    };
  }

  function currentSideMission(progress) {
    const missions = Object.keys(catalog.sideMissions || {}).map(id => sideMissionFor(progress, id)).filter(Boolean);
    return missions.find(mission => mission.status === 'in-progress') || missions.find(mission => mission.status === 'available') || null;
  }

  function completeSideMissionObjective(progress, missionId, objectiveId) {
    const definition = catalog.sideMissions?.[missionId];
    if (!definition?.requiredObjectives?.includes(objectiveId)) return false;
    const mission = progress.sideMissions?.[missionId];
    if (!mission || sideMissionFor(progress, missionId)?.status === 'locked' || sideMissionFor(progress, missionId)?.status === 'completed' || mission.objectives?.[objectiveId]) return false;
    mission.objectives[objectiveId] = true;
    return true;
  }

  function reviewQueue(progress, now = Date.now()) {
    return Object.values(progress.vocabulary).filter(word => word.correct + word.incorrect > 0).sort((a, b) => {
      const aMissed = a.incorrect > 0 ? 1 : 0, bMissed = b.incorrect > 0 ? 1 : 0;
      if (aMissed !== bMissed) return bMissed - aMissed;
      const aDue = a.nextReviewAt ? Date.parse(a.nextReviewAt) : Number.POSITIVE_INFINITY;
      const bDue = b.nextReviewAt ? Date.parse(b.nextReviewAt) : Number.POSITIVE_INFINITY;
      const aOverdue = aDue <= now ? 1 : 0, bOverdue = bDue <= now ? 1 : 0;
      if (aOverdue !== bOverdue) return bOverdue - aOverdue;
      if (a.incorrect !== b.incorrect) return b.incorrect - a.incorrect;
      if (aDue !== bDue) return aDue - bDue;
      return a.id.localeCompare(b.id);
    });
  }

  function claimReward(progress, rewardId) {
    const claim = `lesson:${rewardId}`;
    if (progress.rewardClaims.includes(claim)) return false;
    progress.rewardClaims.push(claim);
    return true;
  }

  function completeConversationLesson(progress, conversationId) {
    const definition = catalog.conversations?.[conversationId];
    const checkpoint = progress.conversations?.[conversationId];
    if (!definition?.completionNodeId || !checkpoint || checkpoint.status !== 'in-progress'
      || checkpoint.nodeId !== definition.completionNodeId || !progress.lessons?.[definition.lessonId]) return false;
    checkpoint.status = 'completed';
    const lesson = progress.lessons[definition.lessonId];
    lesson.status = 'completed';
    lesson.completedAt = lesson.completedAt || new Date().toISOString();
    lesson.correctAnswers = checkpoint.correctAnswers;
    return true;
  }

  window.DeutschstadtLearning = { LEVELS, normalizeXp, progressionForXp, levelUpsBetween, emptyProgress, normalizeProgress, normalizeAnswer, evaluate, recordAnswer, createSession, createConversationSession, unitsFor, journalUnitsFor, currentMission, sideMissionFor, currentSideMission, completeSideMissionObjective, conversationLessonRedirect, reviewQueue, claimReward, completeConversationLesson };
})();
