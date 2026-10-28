// Lesson content is kept separate from the reusable exercise and progress engine.
window.DeutschstadtLessons = {
  units: [
    { id: 'greetings', title: 'Greetings & introductions', lessonId: 'greetings-basics' },
    { id: 'numbers', title: 'Numbers & prices', lessonId: 'numbers-prices', requiresLessonId: 'greetings-basics', requiresConversationId: 'anna-introduction', locationId: 'supermarket' },
    { id: 'bakery', title: 'Bakery & food', lessonId: 'bakery-order', requiresLessonId: 'numbers-prices' },
    { id: 'cafe', title: 'Café & restaurant', lessonId: 'cafe-conversation', requiresLessonId: 'bakery-order' },
    { id: 'bank', title: 'A visit to the bank', lessonId: 'bank-basics', requiresLessonId: 'cafe-conversation' },
    { id: 'shopping', title: 'Shopping', lessonId: 'shopping-basics', requiresLessonId: 'bank-basics', locationId: 'supermarket' },
    { id: 'directions', title: 'Directions', lessonId: 'directions-basics', requiresLessonId: 'shopping-basics' },
    { id: 'station', title: 'Train station', lessonId: 'train-station', requiresLessonId: 'directions-basics', locationId: 'station' },
    { id: 'daily-life', title: 'Daily life', lessonId: null, requiresLessonId: 'train-station' },
    { id: 'neighbours', title: 'Friends & neighbours', lessonId: null, requiresLessonId: 'daily-life' },
    { id: 'review', title: 'Review challenge', lessonId: null }
  ],
  sideMissions: {
    'weekly-market': {
      id: 'weekly-market', title: 'Auf dem Wochenmarkt', englishTitle: 'At the Weekly Market',
      conversationId: 'weekly-market', npcId: 'market-vendor', destination: 'Wochenmarkt',
      requiresLessonId: 'greetings-basics', requiresConversationId: 'anna-introduction',
      objectives: {
        welcome: 'Greet Frau Adler politely.', order: 'Choose fruit, vegetables, or flowers.',
        'price-question': 'Ask how much the items cost.', 'price-answer': 'Listen and understand the price.',
        quantity: 'Choose a polite quantity.', thanks: 'Thank Frau Adler politely.', farewell: 'Finish the market conversation.'
      }
    },
    rathaus: {
      id: 'rathaus', title: 'Ein kleines Problem im Rathaus', englishTitle: 'A Small Problem at City Hall',
      conversationId: 'rathaus-help', npcId: 'rathaus-clerk', destination: 'Rathaus · Büro 2',
      requiresLessonId: 'greetings-basics', requiresConversationId: 'anna-introduction', rewardXp: 40,
      requiredObjectives: ['conversation', 'office-sign'],
      objectives: { welcome: 'Greet the clerk and explain what you need.', appointment: 'Choose the right phrase for your appointment or form.', directions: 'Ask for information politely.', visitor: 'Help Mia find Büro 2.', 'office-sign': 'Read the office sign and choose Mia’s destination.' }
    },
    wohnhaus: {
      id: 'wohnhaus', title: 'Wo ist meine Tasche?', englishTitle: 'Where Is My Bag?',
      conversationId: 'home-lukas', npcId: 'lukas', destination: 'Wohnhaus · Wohnzimmer',
      requiresLessonId: 'greetings-basics', requiresConversationId: 'anna-introduction', rewardXp: 40,
      requiredObjectives: ['conversation', 'table-clue', 'cupboard-clue', 'kitchen-bag'],
      objectives: { welcome: 'Offer to help Lukas find his bag.', story: 'Follow Lukas’s first clue.', room: 'Search the living room.', 'table-clue': 'Inspect the table for a clue.', 'cupboard-clue': 'Find the key in the cupboard.', 'kitchen-bag': 'Look in the kitchen and find the bag.' }
    }
  },
  vocabulary: {
    guten_tag: { german: 'Guten Tag.', english: 'Good day.', example: 'Guten Tag, Mia!', lessonId: 'greetings-basics' },
    hallo: { german: 'Hallo!', english: 'Hello!', example: 'Hallo, Anna!', lessonId: 'greetings-basics' },
    ich_heisse: { german: 'Ich heiße ...', english: 'My name is ...', example: 'Ich heiße Sam.', lessonId: 'greetings-basics' },
    wie_heisst_du: { german: 'Wie heißt du?', english: 'What is your name?', example: 'Hallo! Wie heißt du?', lessonId: 'greetings-basics' },
    bitte: { german: 'Bitte.', english: 'Please. / You’re welcome.', example: 'Ein Wasser, bitte.', lessonId: 'greetings-basics' },
    danke: { german: 'Danke.', english: 'Thank you.', example: 'Danke für deine Hilfe.', lessonId: 'greetings-basics' },
    entschuldigung: { german: 'Entschuldigung.', english: 'Excuse me. / Sorry.', example: 'Entschuldigung, wo ist der Markt?', lessonId: 'greetings-basics' },
    wie_gehts: { german: 'Wie geht es dir?', english: 'How are you?', example: 'Hallo, Sam. Wie geht es dir?', lessonId: 'greetings-basics' },
    gut_danke: { german: 'Gut, danke.', english: 'Good, thank you.', example: 'Wie geht es dir? — Gut, danke.', lessonId: 'greetings-basics' },
    number_0: { german: 'null', english: 'zero (0)', example: 'null Euro', lessonId: 'numbers-prices' },
    number_1: { german: 'eins', english: 'one (1)', example: 'eins, zwei, drei', lessonId: 'numbers-prices' },
    number_2: { german: 'zwei', english: 'two (2)', example: 'zwei Euro', lessonId: 'numbers-prices' },
    number_3: { german: 'drei', english: 'three (3)', example: 'drei Euro', lessonId: 'numbers-prices' },
    number_4: { german: 'vier', english: 'four (4)', example: 'vier Euro', lessonId: 'numbers-prices' },
    number_5: { german: 'fünf', english: 'five (5)', example: 'fünf Euro', lessonId: 'numbers-prices' },
    number_6: { german: 'sechs', english: 'six (6)', example: 'sechs Euro', lessonId: 'numbers-prices' },
    number_7: { german: 'sieben', english: 'seven (7)', example: 'sieben Euro', lessonId: 'numbers-prices' },
    number_8: { german: 'acht', english: 'eight (8)', example: 'acht Euro', lessonId: 'numbers-prices' },
    number_9: { german: 'neun', english: 'nine (9)', example: 'neun Euro', lessonId: 'numbers-prices' },
    number_10: { german: 'zehn', english: 'ten (10)', example: 'zehn Euro', lessonId: 'numbers-prices' },
    price_question: { german: 'Wie viel kostet das?', english: 'How much does that cost?', example: 'Wie viel kostet das Brot?', lessonId: 'numbers-prices' },
    price_answer: { german: 'Es kostet fünf Euro.', english: 'It costs five euros.', example: 'Das Brot kostet fünf Euro.', lessonId: 'numbers-prices' },
    apples: { german: 'die Äpfel', english: 'the apples', example: 'Wie viel kosten die Äpfel?', lessonId: 'numbers-prices' },
    apple_price_question: { german: 'Wie viel kosten die Äpfel?', english: 'How much do the apples cost?', example: 'Die Äpfel kosten drei Euro.', lessonId: 'numbers-prices' },
    market_apples: { german: 'die Äpfel', english: 'the apples', example: 'Ich möchte Äpfel, bitte.', lessonId: 'numbers-prices', topic: 'Auf dem Wochenmarkt' },
    market_tomatoes: { german: 'die Tomaten', english: 'the tomatoes', example: 'Ich möchte Tomaten, bitte.', lessonId: 'numbers-prices', topic: 'Auf dem Wochenmarkt' },
    market_flowers: { german: 'die Blumen', english: 'the flowers', example: 'Ich möchte Blumen, bitte.', lessonId: 'numbers-prices', topic: 'Auf dem Wochenmarkt' },
    market_price_question: { german: 'Wie viel kostet das?', english: 'How much does that cost?', example: 'Wie viel kostet das? — Drei Euro.', lessonId: 'numbers-prices', topic: 'Auf dem Wochenmarkt' },
    market_quantity: { german: 'Ich nehme zwei, bitte.', english: 'I’ll take two, please.', example: 'Die Äpfel kosten drei Euro. — Ich nehme zwei, bitte.', lessonId: 'numbers-prices', topic: 'Auf dem Wochenmarkt' },
    take_it: { german: 'Ich nehme das, bitte.', english: "I'll take that, please.", example: 'Die Äpfel kosten drei Euro. — Ich nehme das, bitte.', lessonId: 'numbers-prices' },
    order: { german: 'Ich hätte gern ein Brot, bitte.', english: 'I would like a loaf of bread, please.', example: 'Ich hätte gern ein Brot, bitte.', lessonId: 'bakery-order' },
    would_like: { german: 'Ich hätte gern ...', english: 'I would like ...', example: 'Ich hätte gern einen Kaffee.', lessonId: 'cafe-conversation' },
    bread: { german: 'das Brot', english: 'the bread / a loaf of bread', example: 'Ein Brot, bitte.', lessonId: 'bakery-order' },
    thanks: { german: 'Danke schön.', english: 'Thank you very much.', example: 'Danke schön, auf Wiedersehen!', lessonId: 'bakery-order' },
    buns: { german: 'zwei Brötchen', english: 'two bread rolls', example: 'Ich hätte gern zwei Brötchen.', lessonId: 'bakery-order' },
    roll: { german: 'ein Brötchen', english: 'a bread roll', example: 'Ich hätte gern ein Brötchen.', lessonId: 'bakery-order' },
    greeting: { german: 'Guten Tag!', english: 'Good day! / Hello!', example: 'Guten Tag, was darf es sein?', lessonId: 'bakery-order' },
    anything_else: { german: 'Möchten Sie noch etwas?', english: 'Would you like anything else?', example: 'Nein, danke.', lessonId: 'bakery-order' },
    bakery_price_question: { german: 'Wie viel kostet das?', english: 'How much does that cost?', example: 'Wie viel kostet das Brot?', lessonId: 'bakery-order' },
    bakery_price: { german: 'Das kostet ... Euro.', english: 'That costs ... euros.', example: 'Das kostet zwei Euro.', lessonId: 'bakery-order' },
    bakery_price_two: { german: 'Das kostet zwei Euro.', english: 'That costs two euros.', example: 'Das Brot kostet zwei Euro.', lessonId: 'bakery-order' },
    bank_account: { german: 'das Bankkonto', english: 'the bank account', example: 'Ich möchte ein Bankkonto eröffnen.', lessonId: 'bank-basics' },
    open_account: { german: 'ein Bankkonto eröffnen', english: 'to open a bank account', example: 'Ich möchte ein Bankkonto eröffnen.', lessonId: 'bank-basics' },
    bank_documents: { german: 'Welche Dokumente brauche ich?', english: 'Which documents do I need?', example: 'Welche Dokumente brauche ich für ein Bankkonto?', lessonId: 'bank-basics' },
    bank_greeting: { german: 'Guten Tag!', english: 'Good day!', example: 'Guten Tag! Willkommen bei der Stadtbank.', lessonId: 'bank-basics' },
    bank_help: { german: 'Wie kann ich Ihnen helfen?', english: 'How can I help you?', example: 'Guten Tag! Wie kann ich Ihnen helfen?', lessonId: 'bank-basics' },
    bank_atm_question: { german: 'Wo ist der Geldautomat?', english: 'Where is the ATM?', example: 'Entschuldigung, wo ist der Geldautomat?', lessonId: 'bank-basics' },
    bank_wait_here: { german: 'Ich warte hier.', english: 'I am waiting here.', example: 'Ich warte hier auf Hilfe.', lessonId: 'bank-basics' },
    bank_ask_help: { german: 'Können Sie mir helfen?', english: 'Can you help me?', example: 'Entschuldigung, können Sie mir helfen?', lessonId: 'bank-basics' },
    bank_thanks: { german: 'Vielen Dank.', english: 'Thank you very much.', example: 'Vielen Dank für Ihre Hilfe.', lessonId: 'bank-basics' },
    bank_goodbye: { german: 'Auf Wiedersehen.', english: 'Goodbye.', example: 'Auf Wiedersehen! Einen schönen Tag noch.', lessonId: 'bank-basics' },
    milk: { german: 'die Milch', english: 'the milk', example: 'Ich suche Milch.', lessonId: 'shopping-basics' },
    water_product: { german: 'das Wasser', english: 'the water', example: 'Ich suche Wasser.', lessonId: 'shopping-basics' },
    cheese: { german: 'der Käse', english: 'the cheese', example: 'Haben Sie Käse?', lessonId: 'shopping-basics' },
    suchen: { german: 'suchen', english: 'to look for', example: 'Ich suche Milch.', lessonId: 'shopping-basics' },
    find_bread: { german: 'Wo finde ich das Brot?', english: 'Where can I find the bread?', example: 'Wo finde ich das Brot? — Hinten links.', lessonId: 'shopping-basics' },
    have_apples: { german: 'Haben Sie Äpfel?', english: 'Do you have apples?', example: 'Haben Sie Äpfel? — Ja, hier.', lessonId: 'shopping-basics' },
    shopping_close: { german: 'Danke, das ist alles.', english: 'Thanks, that’s all.', example: 'Danke, das ist alles. Auf Wiedersehen!', lessonId: 'shopping-basics' },
    direction_left: { german: 'links', english: 'left', example: 'Dann links.', lessonId: 'directions-basics' },
    direction_right: { german: 'rechts', english: 'right', example: 'Dann rechts.', lessonId: 'directions-basics' },
    direction_straight: { german: 'geradeaus', english: 'straight ahead', example: 'Gehen Sie geradeaus bis zur Kreuzung.', lessonId: 'directions-basics' },
    street: { german: 'die Straße', english: 'the street', example: 'Gehen Sie die Straße entlang.', lessonId: 'directions-basics' },
    intersection: { german: 'die Kreuzung', english: 'the intersection', example: 'Gehen Sie geradeaus bis zur Kreuzung.', lessonId: 'directions-basics' },
    ask_town_hall: { german: 'Entschuldigung, wo ist das Rathaus?', english: 'Excuse me, where is the town hall?', example: 'Entschuldigung, wo ist das Rathaus?', lessonId: 'directions-basics' },
    is_it_far: { german: 'Ist es weit?', english: 'Is it far?', example: 'Ist es weit? — Nein, gleich hier.', lessonId: 'directions-basics' },
    found_town_hall: { german: 'Ich habe das Rathaus gefunden.', english: 'I found the town hall.', example: 'Ich habe das Rathaus gefunden!', lessonId: 'directions-basics' },
    town_hall: { german: 'das Rathaus', english: 'the town hall', example: 'Ich habe einen Termin im Rathaus.', lessonId: 'greetings-basics', topic: 'Rathaus' },
    appointment: { german: 'der Termin', english: 'the appointment', example: 'Ich habe einen Termin.', lessonId: 'greetings-basics', topic: 'Rathaus' },
    form: { german: 'das Formular', english: 'the form', example: 'Ich brauche ein Formular.', lessonId: 'greetings-basics', topic: 'Rathaus' },
    information: { german: 'die Auskunft', english: 'the information desk / information', example: 'Wo bekomme ich Informationen?', lessonId: 'greetings-basics', topic: 'Rathaus' },
    office: { german: 'das Büro', english: 'the office', example: 'Das Büro ist im ersten Stock.', lessonId: 'greetings-basics', topic: 'Rathaus' },
    warten: { german: 'warten', english: 'to wait', example: 'Muss ich hier warten?', lessonId: 'greetings-basics', topic: 'Rathaus' },
    brauchen: { german: 'brauchen', english: 'to need', example: 'Ich brauche ein Formular.', lessonId: 'greetings-basics', topic: 'Rathaus' },
    bag: { german: 'die Tasche', english: 'the bag', example: 'Wo ist meine Tasche?', lessonId: 'greetings-basics', topic: 'Wohnhaus' },
    key: { german: 'der Schlüssel', english: 'the key', example: 'Der Schlüssel ist im Schrank.', lessonId: 'greetings-basics', topic: 'Wohnhaus' },
    door: { german: 'die Tür', english: 'the door', example: 'Die Tür ist offen.', lessonId: 'greetings-basics', topic: 'Wohnhaus' },
    table: { german: 'der Tisch', english: 'the table', example: 'Die Tasche liegt auf dem Tisch.', lessonId: 'greetings-basics', topic: 'Wohnhaus' },
    cupboard: { german: 'der Schrank', english: 'the cupboard / wardrobe', example: 'Der Schlüssel ist im Schrank.', lessonId: 'greetings-basics', topic: 'Wohnhaus' },
    kitchen: { german: 'die Küche', english: 'the kitchen', example: 'Schau bitte in der Küche nach.', lessonId: 'greetings-basics', topic: 'Wohnhaus' },
    living_room: { german: 'das Wohnzimmer', english: 'the living room', example: 'Wir suchen im Wohnzimmer.', lessonId: 'greetings-basics', topic: 'Wohnhaus' },
    coffee: { german: 'Einen Kaffee, bitte.', english: 'A coffee, please.', example: 'Ich hätte gern einen Kaffee, bitte.', lessonId: 'cafe-conversation' },
    water: { german: 'Ein Wasser, bitte.', english: 'A water, please.', example: 'Ein Wasser, bitte. Danke schön.', lessonId: 'cafe-conversation' },
    loaf: { german: 'Ein Brot, bitte.', english: 'A loaf of bread, please.', example: 'Ich hätte gern ein Brot, bitte.', lessonId: 'cafe-conversation' },
    cake: { german: 'Ein Stück Kuchen, bitte.', english: 'A piece of cake, please.', example: 'Ich hätte gern ein Stück Kuchen.', lessonId: 'cafe-conversation' },
    bill: { german: 'Die Rechnung, bitte.', english: 'The bill, please.', example: 'Entschuldigung, die Rechnung, bitte.', lessonId: 'cafe-conversation' },
    yes_please: { german: 'Ja, bitte.', english: 'Yes, please.', example: 'Möchten Sie die Rechnung? — Ja, bitte.', lessonId: 'cafe-conversation' },
    bahnhof: { german: 'der Bahnhof', english: 'the train station', example: 'Wo ist der Bahnhof?', lessonId: 'train-station' },
    bahnsteig: { german: 'der Bahnsteig', english: 'the platform', example: 'Der Zug steht am Bahnsteig.', lessonId: 'train-station' },
    gleis: { german: 'das Gleis', english: 'the track / platform number', example: 'Der Zug fährt von Gleis eins.', lessonId: 'train-station' },
    zug: { german: 'der Zug', english: 'the train', example: 'Der Zug fährt nach Berlin.', lessonId: 'train-station' },
    fahrkarte: { german: 'die Fahrkarte', english: 'the ticket', example: 'Eine Fahrkarte nach Berlin, bitte.', lessonId: 'train-station' },
    fahrkartenschalter: { german: 'der Fahrkartenschalter', english: 'the ticket counter', example: 'Frau Krüger arbeitet am Fahrkartenschalter.', lessonId: 'train-station' },
    abfahrt: { german: 'die Abfahrt', english: 'the departure', example: 'Die Abfahrt ist um zehn Uhr fünfzehn.', lessonId: 'train-station' },
    ankunft: { german: 'die Ankunft', english: 'the arrival', example: 'Die Ankunft ist um elf Uhr.', lessonId: 'train-station' },
    einfach: { german: 'einfach', english: 'one-way', example: 'Eine einfache Fahrkarte, bitte.', lessonId: 'train-station' },
    hin_zurueck: { german: 'hin und zurück', english: 'there and back / return', example: 'Eine Fahrkarte hin und zurück, bitte.', lessonId: 'train-station' },
    wann_faehrt: { german: 'Wann fährt der Zug?', english: 'When does the train leave?', example: 'Wann fährt der Zug nach Berlin?', lessonId: 'train-station' },
    welches_gleis: { german: 'Von welchem Gleis fährt der Zug?', english: 'Which platform does the train leave from?', example: 'Von welchem Gleis fährt der Zug nach Berlin?', lessonId: 'train-station' },
    station_thanks: { german: 'Danke für Ihre Hilfe.', english: 'Thank you for your help.', example: 'Danke für Ihre Hilfe. Auf Wiedersehen!', lessonId: 'train-station' },
    hier_ist_meine_fahrkarte: { german: 'Hier ist meine Fahrkarte.', english: 'Here is my ticket.', example: 'Der Kontrolleur fragt nach der Fahrkarte. — Hier ist meine Fahrkarte.', lessonId: 'train-station' }
  },
  cafePreparation: [
    { german: 'Guten Tag.', english: 'Good day.', vocabularyId: 'greeting', breakdown: 'Guten = good · Tag = day', question: 'How do you say “Good day”?', feedback: 'Use this polite greeting when you arrive.' },
    { german: 'Ich hätte gern ...', english: 'I would like ...', vocabularyId: 'would_like', breakdown: 'Ich = I · hätte gern = would like', question: 'How do you politely begin “I would like …”?', feedback: 'This phrase is a polite way to make a request.' },
    { german: 'Einen Kaffee, bitte.', english: 'A coffee, please.', vocabularyId: 'coffee', breakdown: 'einen Kaffee = a coffee · bitte = please', question: 'Choose “A coffee, please.”', feedback: '“Einen Kaffee” means a coffee; “bitte” makes the request polite.' },
    { german: 'Ein Wasser, bitte.', english: 'A water, please.', vocabularyId: 'water', breakdown: 'ein Wasser = a water · bitte = please', question: 'Choose “A water, please.”', feedback: '“Ein Wasser” means a water; “bitte” means please.' },
    { german: 'Ein Brot, bitte.', english: 'A loaf of bread, please.', vocabularyId: 'loaf', breakdown: 'ein Brot = a loaf of bread · bitte = please', question: 'Choose “A loaf of bread, please.”', feedback: '“Ein Brot” is a simple bakery order.' },
    { german: 'Danke schön.', english: 'Thank you very much.', vocabularyId: 'thanks', breakdown: 'Danke = thanks · schön = kindly / very much', question: 'How do you say “Thank you very much”?', feedback: 'This is a warm, polite way to thank someone.' },
    { german: 'Ein Stück Kuchen, bitte.', english: 'A piece of cake, please.', vocabularyId: 'cake', breakdown: 'ein Stück = a piece · Kuchen = cake · bitte = please', question: 'Choose “A piece of cake, please.”', feedback: '“Kuchen” means cake. “Ein Stück” is one piece.' },
    { german: 'Die Rechnung, bitte.', english: 'The bill, please.', vocabularyId: 'bill', breakdown: 'die Rechnung = the bill · bitte = please', question: 'What can you say when you want the bill?', feedback: 'Use this polite phrase to ask the waiter for the bill.' },
    { german: 'Ja, bitte.', english: 'Yes, please.', vocabularyId: 'yes_please', breakdown: 'Ja = yes · bitte = please', question: 'How do you say “Yes, please”?', feedback: 'This is a short, polite yes.' }
  ],
  preparations: {
    bakery: {
      title: 'A little bakery practice', introduction: 'Learn these phrases before you order. Read the translation, listen if you like, and practise each one at your own pace.', conversationId: 'bakery-counter',
      phrases: [
        { german: 'Guten Tag!', english: 'Good day!', vocabularyId: 'greeting', breakdown: 'Guten = good · Tag = day', question: 'Which phrase means “Good day”?', feedback: 'Use this polite greeting when you enter a shop.' },
        { german: 'Ein Brot, bitte.', english: 'One loaf of bread, please.', vocabularyId: 'bread', breakdown: 'ein Brot = one loaf of bread · bitte = please', question: 'Which phrase asks for one loaf of bread?', feedback: '“Brot” is bread; “bitte” makes the request polite.' },
        { german: 'Ich hätte gern ein Brötchen.', english: 'I would like a bread roll.', vocabularyId: 'roll', breakdown: 'Ich = I · hätte gern = would like · ein Brötchen = a bread roll', question: 'Which phrase politely asks for a bread roll?', feedback: '“Ich hätte gern …” means “I would like …”.' },
        { german: 'Wie viel kostet das?', english: 'How much does that cost?', vocabularyId: 'bakery_price_question', breakdown: 'Wie viel = how much · kostet = costs · das = that', question: 'How do you ask for the price?', feedback: 'Use this question when you want to know the cost.' },
        { german: 'Das kostet zwei Euro.', english: 'That costs two euros.', vocabularyId: 'bakery_price_two', breakdown: 'Das = that · kostet = costs · zwei Euro = two euros', question: 'What does “Das kostet zwei Euro” mean?', feedback: 'This sentence tells you the price is two euros.' },
        { german: 'Danke schön.', english: 'Thank you very much.', vocabularyId: 'thanks', breakdown: 'Danke = thank you · schön = very much / kindly', question: 'How do you thank the baker?', feedback: 'A warm, polite way to say thank you.' }
      ]
    },
    bank: {
      title: 'A little bank practice', introduction: 'Learn a few short phrases before you speak with the bank employee. German pronunciation is optional; every phrase has an English meaning.', conversationId: 'bank-employee',
      phrases: [
        { german: 'Guten Tag!', english: 'Good day!', vocabularyId: 'bank_greeting', breakdown: 'Guten = good · Tag = day', question: 'Which phrase is a polite greeting?', feedback: 'Use this greeting when you arrive.' },
        { german: 'Wie kann ich Ihnen helfen?', english: 'How can I help you?', vocabularyId: 'bank_help', breakdown: 'Wie kann ich = how can I · Ihnen = you (formal) · helfen = help', question: 'What does the employee ask?', feedback: 'The employee is asking how they can help you.' },
        { german: 'Ich möchte ein Bankkonto eröffnen.', english: 'I would like to open a bank account.', vocabularyId: 'open_account', breakdown: 'Ich möchte = I would like · ein Bankkonto = a bank account · eröffnen = open', question: 'Which phrase asks to open an account?', feedback: '“Ich möchte …” means “I would like …”.' },
        { german: 'Welche Dokumente brauche ich?', english: 'Which documents do I need?', vocabularyId: 'bank_documents', breakdown: 'Welche = which · Dokumente = documents · brauche ich = do I need', question: 'How do you ask which documents you need?', feedback: 'Use this question to ask what paperwork is needed.' },
        { german: 'Vielen Dank.', english: 'Thank you very much.', vocabularyId: 'bank_thanks', breakdown: 'Vielen Dank = many thanks', question: 'How do you thank the employee politely?', feedback: 'This is a polite way to say thank you.' },
        { german: 'Auf Wiedersehen.', english: 'Goodbye.', vocabularyId: 'bank_goodbye', breakdown: 'Auf Wiedersehen = goodbye (polite)', question: 'Which phrase is a polite goodbye?', feedback: 'Use this phrase when you leave.' }
      ]
    }
  },
  lessons: {
    'greetings-basics': {
      id: 'greetings-basics', unitId: 'greetings', title: 'Your first conversations', subtitle: 'Say hello, introduce yourself, and be polite.', difficulty: 'A1 · Beginner', objectives: ['Greet someone', 'Say your name', 'Use please, thank you, and excuse me', 'Answer a simple question'], completionCriteria: 'Answer each question correctly; mistakes can be retried.', rewardXp: 30,
      introduction: 'You can use these short phrases right away. Read the German, English, and simple note before choosing an answer. Listen to each syllable; English spelling is only a rough pronunciation guide because some German sounds are different.',
      exercises: [
        { id: 'hello', type: 'multiple-choice', supportLevel: 'guided', example: '“Guten Tag” is a greeting. Match it to “Good day.”', hint: '“Tag” means day.', prompt: 'Someone greets you. What does “Guten Tag” mean?', instruction: 'Choose the English meaning.', teaching: { german: 'Guten Tag.', english: 'Good day.', explanation: 'A polite daytime greeting. “Guten” means good; “Tag” means day.' }, options: [{ id: 'good-day', text: 'Good day.' }, { id: 'good-night', text: 'Good night.' }, { id: 'thank-you', text: 'Thank you.' }], answer: 'good-day', feedbackCorrect: 'Richtig! You can use “Guten Tag” when you arrive.', feedbackIncorrect: '“Tag” means day. “Guten Tag” is a daytime greeting.', vocabularyIds: ['guten_tag'] },
        { id: 'name-question', type: 'de-en', supportLevel: 'guided', example: 'Example: “Hallo” means “Hello.”', hint: '“Wie heißt du?” asks for someone’s name.', prompt: 'Wie heißt du?', instruction: 'Type the English meaning. You are not being asked to type German yet.', teaching: { german: 'Wie heißt du?', english: 'What is your name?', explanation: '“Wie” means how/what here; “heißt” is called; “du” means you.' }, acceptedAnswers: ['What is your name?', 'What is your name'], feedbackCorrect: 'Good! You can answer with “Ich heiße …”.', feedbackIncorrect: 'This is a friendly way to ask someone’s name.', vocabularyIds: ['wie_heisst_du'] },
        { id: 'introduce-yourself', type: 'fill-blank', supportLevel: 'supported', example: 'Ich ___ Anna. → Ich heiße Anna.', hint: 'You need the word that means “am called.”', prompt: 'Ich ______ Sam. (My name is Sam.)', instruction: 'Choose the missing German word. “Ich” means I; “heiße” means am called.', teaching: { german: 'Ich heiße ...', english: 'My name is ...', explanation: 'Say “Ich heiße” and then your name. The ß is pronounced like “ss”.' }, options: [{ id: 'heiße', text: 'heiße', translation: 'am called' }, { id: 'danke', text: 'danke', translation: 'thank you' }, { id: 'Tag', text: 'Tag', translation: 'day' }], answer: 'heiße', feedbackCorrect: 'Sehr gut! “Ich heiße Sam” means “My name is Sam.”', feedbackIncorrect: 'Use “heiße” to say what your name is.', vocabularyIds: ['ich_heisse'] },
        { id: 'polite-words', type: 'multiple-choice', supportLevel: 'supported', hint: 'The longest phrase means “Excuse me.”', prompt: 'You want to say “Excuse me.” Which phrase should you use?', instruction: 'Choose the polite phrase.', teaching: { german: 'Bitte. · Danke. · Entschuldigung.', english: 'Please. · Thank you. · Excuse me.', explanation: '“Bitte” is please; “Danke” is thank you; “Entschuldigung” gets someone’s attention or says sorry.' }, options: [{ id: 'excuse', text: 'Entschuldigung.', translation: 'Excuse me.' }, { id: 'please', text: 'Bitte.', translation: 'Please. / You’re welcome.' }, { id: 'thanks', text: 'Danke.', translation: 'Thank you.' }], answer: 'excuse', feedbackCorrect: 'Richtig! “Entschuldigung” is a polite way to get attention.', feedbackIncorrect: 'Look for the longer word that means “Excuse me.”', vocabularyIds: ['bitte', 'danke', 'entschuldigung'] },
        { id: 'how-are-you', type: 'npc-choice', supportLevel: 'supported', example: '“Wie geht es dir?” asks “How are you?” A simple answer is “Gut, danke.”', hint: '“Gut” means good.', prompt: 'Mia asks: “Wie geht es dir?”', instruction: 'Choose a friendly answer. “Gut” means good.', teaching: { german: 'Wie geht es dir? — Gut, danke.', english: 'How are you? — Good, thank you.', explanation: 'A simple question and answer. “Dir” is an informal “you”; “danke” means thank you.' }, options: [{ id: 'good', text: 'Gut, danke.', translation: 'Good, thank you.' }, { id: 'name', text: 'Ich heiße ...', translation: 'My name is ...' }, { id: 'excuse', text: 'Entschuldigung.', translation: 'Excuse me.' }], answer: 'good', feedbackCorrect: 'Sehr gut! That is a natural, friendly reply.', feedbackIncorrect: 'Answer how you feel: “Gut” means good.', vocabularyIds: ['wie_gehts', 'gut_danke'] },
        { id: 'produce-excuse-me', type: 'en-de', supportLevel: 'independent', example: 'You learned this in the previous question: “Excuse me” → “Entschuldigung.”', hint: 'Use the polite word beginning Entschuld-.', prompt: 'How do you say “Excuse me” in German?', instruction: 'Type the German phrase. This is your first independent response; use the optional hint if needed.', teaching: { german: 'Entschuldigung.', english: 'Excuse me. / Sorry.', explanation: 'You already saw this phrase above. German spelling has a capital letter at the start of a sentence.' }, acceptedAnswers: ['Entschuldigung.', 'Entschuldigung'], feedbackCorrect: 'Richtig! You can now politely get someone’s attention.', feedbackIncorrect: 'Type “Entschuldigung.” It is okay to use the hint and try again.', vocabularyIds: ['entschuldigung'] }
      ]
    },
    'numbers-prices': {
      id: 'numbers-prices', unitId: 'numbers', title: 'Numbers and prices', subtitle: 'Count from zero to ten and ask what something costs.', difficulty: 'A1 · Beginner', objectives: ['Count from 0 to 10', 'Ask for a price', 'Understand a simple price'], completionCriteria: 'Count in order, identify the taught numbers, and answer a price question.', rewardXp: 30,
      introduction: 'Numbers from 0 to 10: null = zero, eins = one, zwei = two, drei = three, vier = four, fünf = five, sechs = six, sieben = seven, acht = eight, neun = nine, zehn = ten.',
      exercises: [
        { id: 'count-from-zero', type: 'sentence-build', supportLevel: 'guided', example: 'Example start: null, then eins, then zwei.', hint: 'The first three are null, eins, zwei.', prompt: 'Put the numbers in order from 0 to 10.', instruction: 'Tap each German number word in order. The list above shows the English meaning.', teaching: { german: 'null · eins · zwei · drei · vier · fünf · sechs · sieben · acht · neun · zehn', english: 'zero · one · two · three · four · five · six · seven · eight · nine · ten', explanation: 'These are the number words from 0 to 10. Say them slowly and notice that “eins” becomes “ein” before some nouns, as in “ein Euro”.' }, tokens: ['fünf', 'null', 'acht', 'eins', 'zehn', 'drei', 'sieben', 'zwei', 'neun', 'vier', 'sechs'], answer: 'null eins zwei drei vier fünf sechs sieben acht neun zehn', feedbackCorrect: 'Ausgezeichnet! You counted from zero to ten.', feedbackIncorrect: 'Start with null, then eins, zwei, drei. Follow the number list above.', vocabularyIds: ['number_0','number_1','number_2','number_3','number_4','number_5','number_6','number_7','number_8','number_9','number_10'] },
        { id: 'number-seven', type: 'multiple-choice', supportLevel: 'guided', prompt: 'Which German word means “seven (7)”?', instruction: 'Read the number list above, then choose.', teaching: { german: 'sieben', english: 'seven (7)', explanation: 'The German number words are written out; “sieben” is seven.' }, options: [{ id: 'sieben', text: 'sieben', translation: 'seven (7)' }, { id: 'neun', text: 'neun', translation: 'nine (9)' }, { id: 'drei', text: 'drei', translation: 'three (3)' }], answer: 'sieben', feedbackCorrect: 'Richtig! sieben = 7.', feedbackIncorrect: 'Check the list: sieben is seven.', vocabularyIds: ['number_7'] },
        { id: 'number-listening', type: 'listening', prompt: 'Listen and choose the number.', instruction: 'Replay the audio if you need to.', audioText: 'drei', teaching: { german: 'drei', english: 'three (3)', explanation: 'Listen for the German number “drei”.' }, options: [{ id: '3', text: '3 · three' }, { id: '8', text: '8 · eight' }, { id: '10', text: '10 · ten' }], answer: '3', feedbackCorrect: 'Genau! drei means three.', feedbackIncorrect: 'Listen again. “Drei” means three.', vocabularyIds: ['number_3'] },
        { id: 'count-to-ten', type: 'fill-blank', prompt: 'Fünf plus fünf sind ______. (Five plus five is ten.)', instruction: 'Choose the German word for ten.', teaching: { german: 'zehn', english: 'ten (10)', explanation: 'After neun (nine) comes zehn (ten).' }, options: [{ id: 'zehn', text: 'zehn' }, { id: 'zwei', text: 'zwei' }, { id: 'vier', text: 'vier' }], answer: 'zehn', feedbackCorrect: 'Richtig! fünf + fünf = zehn.', feedbackIncorrect: 'The number after neun is zehn.', vocabularyIds: ['number_5', 'number_10'] },
        { id: 'ask-price', type: 'en-de', prompt: 'How much does that cost?', instruction: 'Use the phrase shown in the lesson.', teaching: { german: 'Wie viel kostet das?', english: 'How much does that cost?', explanation: '“Wie viel” asks how much; “kostet” means costs; “das” means that.' }, acceptedAnswers: ['Wie viel kostet das?', 'Wie viel kostet das'], feedbackCorrect: 'Gut! This question works in a shop or café.', feedbackIncorrect: 'Start with “Wie viel” and finish with “kostet das?”.', vocabularyIds: ['price_question'] },
        { id: 'price-answer', type: 'multiple-choice', supportLevel: 'supported', prompt: 'A loaf costs five euros. What does the shopkeeper say?', instruction: 'Choose the matching German sentence.', teaching: { german: 'Es kostet fünf Euro.', english: 'It costs five euros.', explanation: '“Es kostet” means it costs; “fünf Euro” is five euros.' }, options: [{ id: 'five', text: 'Es kostet fünf Euro.', translation: 'It costs five euros.' }, { id: 'two', text: 'Es kostet zwei Euro.', translation: 'It costs two euros.' }, { id: 'ask', text: 'Wie viel kostet das?', translation: 'How much does that cost?' }], answer: 'five', feedbackCorrect: 'Richtig! fünf is five.', feedbackIncorrect: 'Match the number: fünf means five.', vocabularyIds: ['number_5', 'price_answer'] },
        { id: 'type-price', type: 'en-de', supportLevel: 'independent', prompt: 'Type: “It costs five euros.”', instruction: 'Write the German sentence you just learned. Use the optional hint if you need it.', teaching: { german: 'Es kostet fünf Euro.', english: 'It costs five euros.', explanation: '“Es kostet” means it costs. The number fünf means five.' }, example: 'You just matched “It costs five euros” to “Es kostet fünf Euro.”', hint: 'Begin with “Es kostet” and finish with “fünf Euro.”', acceptedAnswers: ['Es kostet fünf Euro.', 'Es kostet fünf Euro'], feedbackCorrect: 'Sehr gut! You produced a complete price sentence.', feedbackIncorrect: 'Write “Es kostet fünf Euro.” Use the phrase above and try again.', vocabularyIds: ['price_answer', 'number_5'] }
      ]
    },
    'bakery-order': {
      id: 'bakery-order', unitId: 'bakery', title: 'A morning at the bakery', subtitle: 'Order bread, ask the price, and pay politely.', difficulty: 'A1 · Beginner', objectives: ['Greet a baker', 'Order bread politely', 'Ask how much an item costs', 'Understand and pay a simple price', 'Thank the shopkeeper'], completionCriteria: 'Answer the bakery and price questions correctly; mistakes can be retried.', rewardXp: 50,
      exercises: [
        { id: 'order-choice', type: 'multiple-choice', supportLevel: 'guided', speaker: 'Emil, der Bäcker', prompt: 'Guten Morgen! Was darf es sein?', instruction: 'Choose a friendly way to order.', teaching: { german: 'Ich hätte gern ...', english: 'I would like ...', explanation: 'This polite phrase introduces a request. Add the item you want, then “bitte”.' }, hint: 'Look for “Ich hätte gern …, bitte.”', options: [
          { id: 'hello', text: 'Ich heiße Alex.', translation: 'My name is Alex.' },
          { id: 'order', text: 'Ich hätte gern ein Brot, bitte.', translation: 'I would like a loaf of bread, please.' },
          { id: 'directions', text: 'Wo ist der Bahnhof?', translation: 'Where is the train station?' }
        ], answer: 'order', feedbackCorrect: 'Sehr gut! That is a polite way to place your order.', feedbackIncorrect: 'Try the polite phrase for “I would like …, please.”', vocabularyIds: ['order'] },
        { id: 'bread-translation', type: 'de-en', prompt: 'Ein Brot, bitte.', instruction: 'What does this customer ask for?', teaching: { german: 'Ein Brot, bitte.', english: 'One loaf of bread, please.', explanation: '“Ein Brot” is one loaf. “Bitte” means please.' }, hint: 'Brot means bread.', acceptedAnswers: ['A loaf of bread, please.', 'One loaf of bread, please.', 'Bread, please.'], feedbackCorrect: 'Richtig! “Ein Brot” is an order for a loaf of bread.', feedbackIncorrect: '“Das Brot” means bread. “Ein Brot, bitte” is a polite order.', vocabularyIds: ['bread'] },
        { id: 'thanks-translation', type: 'en-de', prompt: 'Thank you very much.', instruction: 'Type the German phrase.', teaching: { german: 'Danke schön.', english: 'Thank you very much.', explanation: '“Danke” means thank you. “Schön” makes this a warm, polite expression.' }, hint: 'The first word is “Danke”.', acceptedAnswers: ['Danke schön.', 'Danke schoen.', 'Vielen Dank.'], feedbackCorrect: 'Danke schön! A warm way to say thank you.', feedbackIncorrect: 'A common phrase is “Danke schön.”', vocabularyIds: ['thanks'] },
        { id: 'build-order', type: 'sentence-build', prompt: 'Build the German sentence.', instruction: 'I would like two bread rolls, please.', teaching: { german: 'Ich hätte gern zwei Brötchen, bitte.', english: 'I would like two bread rolls, please.', explanation: 'Put the words in this order: Ich · hätte gern · zwei Brötchen · bitte.' }, hint: 'Begin with “Ich” and end with “bitte.”', tokens: ['Ich', 'hätte', 'gern', 'zwei', 'Brötchen,', 'bitte.'], answer: 'Ich hätte gern zwei Brötchen, bitte.', feedbackCorrect: 'Wunderbar! You built a complete bakery order.', feedbackIncorrect: 'Start with “Ich hätte gern …” and finish with “bitte.”', vocabularyIds: ['buns'] },
        { id: 'greeting-listen', type: 'listening', prompt: 'Listen to the greeting.', instruction: 'Play the German audio, then choose its meaning.', teaching: { german: 'Guten Tag!', english: 'Good day! / Hello!', explanation: 'This is a polite greeting. “Tag” means day.' }, hint: '“Tag” means day.', audioText: 'Guten Tag!', options: [
          { id: 'hello', text: 'Good day! / Hello!' }, { id: 'thanks', text: 'Thank you very much.' }, { id: 'goodbye', text: 'Goodbye!' }
        ], answer: 'hello', feedbackCorrect: 'Richtig! “Guten Tag” is a polite daytime greeting.', feedbackIncorrect: 'Listen again: “Guten Tag” is a polite daytime greeting.', vocabularyIds: ['greeting'] },
        { id: 'anything-else', type: 'npc-choice', speaker: 'Emil, der Bäcker', prompt: 'Möchten Sie noch etwas?', instruction: 'The baker asks, “Would you like anything else?” Choose a natural reply.', teaching: { german: 'Nein, danke.', english: 'No, thank you.', explanation: '“Nein” means no; “danke” means thank you.' }, hint: 'Choose a polite way to say no.', options: [
          { id: 'yes', text: 'Ja, bitte.', translation: 'Yes, please.' }, { id: 'no', text: 'Nein, danke.', translation: 'No, thank you.' }, { id: 'name', text: 'Ich heiße Alex.', translation: 'My name is Alex.' }
        ], answer: 'no', feedbackCorrect: 'Sehr höflich! You have everything you need.', feedbackIncorrect: 'Choose a polite way to say “No, thank you.”', vocabularyIds: ['anything_else'] },
        { id: 'bakery-price-question', type: 'multiple-choice', supportLevel: 'supported', prompt: 'You want to ask how much the loaf costs.', instruction: 'Choose the German question. You have just practised its meaning above.', teaching: { german: 'Wie viel kostet das?', english: 'How much does that cost?', explanation: '“Wie viel” means how much; “kostet” means costs; “das” means that.' }, hint: 'Start with “Wie viel …?”', options: [{ id: 'ask-price', text: 'Wie viel kostet das?', translation: 'How much does that cost?' }, { id: 'greet', text: 'Guten Tag!', translation: 'Good day!' }, { id: 'thank', text: 'Danke schön.', translation: 'Thank you very much.' }], answer: 'ask-price', feedbackCorrect: 'Richtig! This is the natural way to ask for an item’s price.', feedbackIncorrect: 'Use “Wie viel kostet das?” when you want to know the price.', vocabularyIds: ['bakery_price_question'] },
        { id: 'bakery-price-answer', type: 'listening', supportLevel: 'supported', prompt: 'Listen to the baker’s answer.', instruction: 'Play the German price, then choose its English meaning.', teaching: { german: 'Das kostet zwei Euro.', english: 'That costs two euros.', explanation: '“Das kostet” means that costs; “zwei Euro” is two euros.' }, audioText: 'Das kostet zwei Euro.', hint: 'Listen for “zwei” — the number two.', options: [{ id: 'two', text: 'That costs two euros.', translation: 'Two is zwei.' }, { id: 'one', text: 'That costs one euro.' }, { id: 'thanks', text: 'Thank you very much.' }], answer: 'two', feedbackCorrect: 'Sehr gut! You understood a simple price.', feedbackIncorrect: '“Zwei” means two. Listen again and choose the two-euro price.', vocabularyIds: ['bakery_price_two', 'number_2'] }
      ]
    },
    'bank-basics': {
      id: 'bank-basics', unitId: 'bank', title: 'Opening a bank account', subtitle: 'Understand one useful account-opening phrase.', difficulty: 'A1 · Beginner', objectives: ['Understand a polite bank account request'], completionCriteria: 'Choose the matching English meaning; mistakes can be retried.', rewardXp: 0,
      introduction: 'You heard this phrase in the conversation. Read the translation and vocabulary notes, then check what it means.',
      exercises: [
        { id: 'account-request-meaning', type: 'multiple-choice', supportLevel: 'guided', prompt: 'Ich möchte ein Bankkonto eröffnen.', instruction: 'What does this mean? Choose the English translation.', teaching: { german: 'Ich möchte ein Bankkonto eröffnen.', english: 'I would like to open a bank account.', explanation: '“Ich möchte” = I would like · “Bankkonto” = bank account · “eröffnen” = to open.' }, example: '“Ich möchte” means “I would like.” “Ein Bankkonto eröffnen” means “open a bank account.”', hint: 'Look for the option about opening an account.', vocabularyIds: ['bank_account', 'open_account'], options: [{ id: 'account', text: 'I would like to open a bank account.' }, { id: 'bread', text: 'I would like to buy bread.' }, { id: 'station', text: 'Where is the train station?' }], answer: 'account', feedbackCorrect: 'Richtig! “Bankkonto” means bank account and “eröffnen” means to open.', feedbackIncorrect: 'The phrase is a polite request to open a bank account. Review the three word meanings above and try again.' }
      ]
    },
    'shopping-basics': {
      id: 'shopping-basics', unitId: 'shopping', title: 'Shopping at the Supermarkt', subtitle: 'Ask for products and find them in a shop.', difficulty: 'A1 · Beginner', objectives: ['Ask for two products', 'Ask where bread is', 'Understand a simple location answer'], completionCriteria: 'Request milk and apples, ask where to find bread, and close politely with Herr Weber.', rewardXp: 35,
      introduction: 'Practise a few useful shop phrases with Herr Weber. Read each translation and word note before choosing a response.', exercises: []
    },
    'directions-basics': {
      id: 'directions-basics', unitId: 'directions', title: 'Finding the Rathaus', subtitle: 'Ask for directions and follow a short route.', difficulty: 'A1 · Beginner', objectives: ['Understand straight ahead, left, and right', 'Follow two town checkpoints', 'Reach the Rathaus'], completionCriteria: 'Choose the correct route directions and enter the Rathaus.', rewardXp: 30,
      introduction: 'Learn a few direction words with Theo, then follow the gold marker through the real town to the Rathaus.', exercises: []
    },
    'cafe-conversation': { id: 'cafe-conversation', unitId: 'cafe', title: 'A conversation at the café', subtitle: 'Order something, ask for the bill, and say thank you.', difficulty: 'A1 · Beginner', objectives: ['Greet the waiter', 'Order a drink or snack', 'Ask for the bill', 'Close politely'], completionCriteria: 'Complete a connected waiter conversation with an appropriate order and closing.', rewardXp: 40, exercises: [] },
    'train-station': { id: 'train-station', unitId: 'station', title: 'At the train station', subtitle: 'Buy a ticket and find your train.', difficulty: 'A1 · Beginner', objectives: ['Ask for a ticket politely', 'Choose one-way or return', 'Understand a departure time', 'Find the correct platform'], completionCriteria: 'Complete the ticket conversation and identify the Berlin departure at 10:15 from platform 1.', rewardXp: 45, introduction: 'Read the phrases and word notes in each step. Wrong answers can be retried; the lesson completes after the ticket and route questions.', exercises: [] }
  },
  conversations: {
    'directions-conversation': {
      id: 'directions-conversation', displayTitle: 'WO IST DAS RATHAUS?', displayName: 'Theo', lessonId: 'directions-basics', trackLessonCompletion: false, completionNodeId: 'route-arrival', startNode: 'welcome',
      nodes: {
        welcome: { speaker: 'Theo · Nachbar', german: 'Hallo, Alex! Entschuldigung, wo ist das Rathaus? Können Sie mir helfen?', english: 'Hello, Alex! Excuse me, where is the town hall? Can you help me?', vocabularyIds: ['ask_town_hall', 'town_hall'], wordHelp: ['geradeaus = straight ahead · die Kreuzung = the intersection · das Rathaus = the town hall'], choices: [
          { id: 'go-straight', text: 'Gehen Sie geradeaus bis zur Kreuzung.', translation: 'Go straight ahead to the intersection.', correct: true, feedback: 'Richtig! “geradeaus” means straight ahead. Follow the road north to the crossroads.', next: 'left-turn', vocabularyIds: ['direction_straight', 'intersection'] },
          { id: 'turn-right-first', text: 'Gehen Sie gleich nach rechts.', translation: 'Turn right immediately.', correct: false, feedback: 'Not yet. First go straight ahead to the Kreuzung (intersection).', vocabularyIds: ['direction_right'] },
          { id: 'turn-left-first', text: 'Gehen Sie gleich nach links.', translation: 'Turn left immediately.', correct: false, feedback: 'Not yet. First go straight ahead to the Kreuzung (intersection).', vocabularyIds: ['direction_left'] }
        ]},
        'left-turn': { speaker: 'Theo · Nachbar', german: 'Gut! Sie kommen an die Kreuzung. Was machen Sie dort?', english: 'Good! You are coming to the intersection. What do you do there?', vocabularyIds: ['intersection'], choices: [
          { id: 'turn-left', text: 'Dann links.', translation: 'Then left.', correct: true, feedback: 'Sehr gut! From the northbound road, links takes you west along the main street.', next: 'right-turn', vocabularyIds: ['direction_left', 'street'] },
          { id: 'turn-right', text: 'Dann rechts.', translation: 'Then right.', correct: false, feedback: 'Try again. The Rathausgasse is to the left when you reach the crossroads from the south.', vocabularyIds: ['direction_right'] }
        ]},
        'right-turn': { speaker: 'Theo · Nachbar', german: 'An der Rathausgasse gehen Sie nach rechts. Ist es weit?', english: 'At Rathaus Street, turn right. Is it far?', vocabularyIds: ['street', 'is_it_far'], wordHelp: ['Sie = formal you · rechts = right · Ist es weit? = Is it far?'], choices: [
          { id: 'turn-right-north', text: 'Dann rechts.', translation: 'Then right.', correct: true, feedback: 'Richtig! After walking west, turn right (north) onto the Rathausgasse.', next: 'route-ready', vocabularyIds: ['direction_right', 'street'] },
          { id: 'turn-left-north', text: 'Dann links.', translation: 'Then left.', correct: false, feedback: 'Not here. You are walking west, so right points north toward the Rathaus.', vocabularyIds: ['direction_left'] },
          { id: 'say-far', text: 'Ja, es ist sehr weit.', translation: 'Yes, it is very far.', correct: false, feedback: 'The Rathaus is nearby. Say “Nein, es ist nicht weit” (No, it is not far).', vocabularyIds: ['is_it_far'] }
        ]},
        'route-ready': { speaker: 'Theo · Nachbar', german: 'Nein, es ist nicht weit. Gehen Sie geradeaus bis zum Rathaus.', english: 'No, it is not far. Go straight ahead until the town hall.', wordHelp: ['die Straße = the street · Ich habe das Rathaus gefunden. = I found the town hall.'], navigationStart: true },
        'route-crossroads': { speaker: 'Theo · Nachbar', german: 'Gehen Sie geradeaus bis zur Kreuzung.', english: 'Go straight ahead to the intersection.', routeCheckpoint: true },
        'route-rathausgasse': { speaker: 'Theo · Nachbar', german: 'Dann links bis zur Rathausgasse. Dort rechts.', english: 'Then left to Rathaus Street. Turn right there.', routeCheckpoint: true },
        'route-door': { speaker: 'Theo · Nachbar', german: 'Gehen Sie die Straße geradeaus. Das Rathaus ist gleich vor Ihnen.', english: 'Go straight along the street. The town hall is just ahead.', routeCheckpoint: true },
        'route-arrival': { speaker: 'Alex', german: 'Ich habe das Rathaus gefunden.', english: 'I found the town hall.' }
      }
    },
    'anna-introduction': {
      id: 'anna-introduction', displayTitle: 'FIRST CONVERSATION', displayName: 'Anna', lessonId: 'greetings-basics', trackLessonCompletion: false, rewardId: 'anna-introduction', rewardXp: 15, startNode: 'welcome',
      nodes: {
        welcome: {
          speaker: 'Anna', german: 'Hallo! Ich heiße Anna. Wie heißt du?', english: 'Hello! My name is Anna. What is your name?',
          vocabularyIds: ['hallo', 'ich_heisse', 'wie_heisst_du'],
          wordHelp: ['Hallo = hello', 'Ich heiße Anna = My name is Anna', 'Wie heißt du? = What is your name?'],
          choices: [
            { id: 'introduce', text: 'Ich heiße {name}.', translation: 'My name is {name}.', correct: true, feedback: 'Anna asked your name. “Ich heiße” means “My name is,” so this is a direct, friendly answer.', next: 'nice-to-meet-you', vocabularyIds: ['ich_heisse'] },
            { id: 'morning', text: 'Guten Morgen!', translation: 'Good morning!', correct: false, feedback: 'That is a greeting, but Anna asked your name: “Wie heißt du?” means “What is your name?”', vocabularyIds: ['wie_heisst_du'] },
            { id: 'thanks', text: 'Danke schön.', translation: 'Thank you very much.', correct: false, feedback: 'That means “Thank you very much.” Anna asked your name. Try “Ich heiße …” (My name is …).', vocabularyIds: ['wie_heisst_du'] }
          ]
        },
        'nice-to-meet-you': {
          speaker: 'Anna', german: 'Freut mich, {name}! Willkommen in Deutschstadt.', english: 'Nice to meet you, {name}! Welcome to Deutschstadt.',
          choices: [
            { id: 'thank-you', text: 'Danke schön!', translation: 'Thank you very much!', correct: true, feedback: 'Sehr höflich! “Danke schön” is a warm way to say thank you.', next: 'farewell', vocabularyIds: ['danke'] },
            { id: 'goodbye', text: 'Auf Wiedersehen!', translation: 'Goodbye!', correct: true, feedback: 'That is a polite goodbye. You can also thank Anna and keep exploring.', next: 'farewell' }
          ]
        },
        farewell: { speaker: 'Anna', german: 'Gern geschehen. Bis bald!', english: 'You’re welcome. See you soon!', next: 'complete' }
      }
    },
    'bank-employee': {
      id: 'bank-employee', displayTitle: 'MEIN ERSTER BANKBESUCH', displayName: 'Frau Becker', lessonId: 'bank-basics', trackLessonCompletion: false, rewardXp: 0, startNode: 'welcome',
      nodes: {
        welcome: {
          speaker: 'Frau Becker', german: 'Guten Tag!', english: 'Good day!', vocabularyIds: ['bank_greeting'],
          wordHelp: ['Guten Tag = good day'],
          choices: [
            { id: 'greet', text: 'Guten Tag!', translation: 'Good day!', correct: true, feedback: 'Sehr gut! You greeted the employee politely.', next: 'account', vocabularyIds: ['bank_greeting'] },
            { id: 'goodbye', text: 'Auf Wiedersehen.', translation: 'Goodbye.', correct: false, feedback: 'That means goodbye. You have just arrived, so greet the employee first.' }
          ]
        },
        account: {
          speaker: 'Frau Becker', german: 'Wie kann ich Ihnen helfen?', english: 'How can I help you?', vocabularyIds: ['bank_help'],
          wordHelp: ['Ich möchte = I would like', 'ein Bankkonto = a bank account', 'eröffnen = to open'],
          choices: [
            { id: 'request-account', text: 'Ich möchte ein Bankkonto eröffnen.', translation: 'I would like to open a bank account.', correct: true, feedback: 'Richtig! You explained clearly that you would like to open an account.', next: 'documents', vocabularyIds: ['bank_account', 'open_account'] },
            { id: 'order-bread', text: 'Ein Brot, bitte.', translation: 'One loaf of bread, please.', correct: false, feedback: 'That is a bakery order. Choose the phrase for opening a bank account.' }
          ]
        },
        documents: {
          speaker: 'Frau Becker', german: 'Für ein Konto brauchen Sie einen Ausweis.', english: 'For an account, you need an identity document.', vocabularyIds: ['bank_documents'],
          wordHelp: ['Welche Dokumente brauche ich? = Which documents do I need?', 'Ausweis = identity document'],
          choices: [
            { id: 'ask-documents', text: 'Welche Dokumente brauche ich?', translation: 'Which documents do I need?', correct: true, feedback: 'Sehr gut! This is a clear question about the documents you need.', next: 'thanks', vocabularyIds: ['bank_documents'] },
            { id: 'say-thanks', text: 'Vielen Dank.', translation: 'Thank you very much.', correct: false, feedback: 'That is polite, but first ask which documents you need.' }
          ]
        },
        thanks: {
          speaker: 'Frau Becker', german: 'Ich helfe Ihnen gern.', english: 'I am happy to help you.',
          choices: [
            { id: 'thank', text: 'Vielen Dank.', translation: 'Thank you very much.', correct: true, feedback: 'Sehr höflich! You thanked the employee.', next: 'goodbye', vocabularyIds: ['bank_thanks'] },
            { id: 'ask-again', text: 'Welche Dokumente brauche ich?', translation: 'Which documents do I need?', correct: false, feedback: 'You have asked your question. Thank Frau Becker for the help.' }
          ]
        },
        goodbye: { speaker: 'Frau Becker', german: 'Auf Wiedersehen! Einen schönen Tag noch.', english: 'Goodbye! Have a nice day.', next: 'complete' }
      }
    },
    'bank-reception': {
      id: 'bank-reception', displayTitle: 'AM EMPFANG · AT RECEPTION', displayName: 'Mina Yilmaz', trackLessonCompletion: false, rewardXp: 0, startNode: 'welcome',
      nodes: {
        welcome: {
          speaker: 'Mina · Empfang', german: 'Guten Tag! Wie kann ich Ihnen helfen?', english: 'Good day! How can I help you?', vocabularyIds: ['bank_greeting', 'bank_help'],
          wordHelp: ['Guten Tag = good day', 'Wie kann ich Ihnen helfen? = How can I help you?'],
          choices: [
            { id: 'ask-atm', text: 'Wo ist der Geldautomat?', translation: 'Where is the ATM?', correct: true, feedback: 'Sehr gut! This is a polite way to ask where the cash machine is.', next: 'atm-directions', vocabularyIds: ['bank_atm_question'] },
            { id: 'open-account', text: 'Ich möchte ein Bankkonto eröffnen.', translation: 'I would like to open a bank account.', correct: true, feedback: 'Richtig! Mina will direct you to Frau Becker at the service counter.', next: 'counter-directions', vocabularyIds: ['open_account', 'bank_account'] },
            { id: 'order-bread', text: 'Ein Brot, bitte.', translation: 'A loaf of bread, please.', correct: false, feedback: 'That is a bakery order. Ask about the ATM or explain that you would like to open an account.' }
          ]
        },
        'atm-directions': { speaker: 'Mina · Empfang', german: 'Der Geldautomat ist links neben dem Eingang.', english: 'The ATM is to the left of the entrance.', wordHelp: ['links = to the left', 'neben = next to'], next: 'thanks' },
        'counter-directions': { speaker: 'Mina · Empfang', german: 'Frau Becker hilft Ihnen am Serviceschalter rechts.', english: 'Ms. Becker can help you at the service counter on the right.', wordHelp: ['der Serviceschalter = the service counter', 'rechts = to the right'], next: 'thanks' },
        thanks: {
          speaker: 'Mina · Empfang', german: 'Gern geschehen. Viel Erfolg!', english: 'You’re welcome. Good luck!',
          choices: [{ id: 'thank', text: 'Danke schön!', translation: 'Thank you very much!', correct: true, feedback: 'Sehr höflich! You thanked Mina politely.', next: 'farewell', vocabularyIds: ['bank_thanks'] }]
        },
        farewell: { speaker: 'Mina · Empfang', german: 'Bitte schön. Einen schönen Tag noch!', english: 'You’re welcome. Have a nice day!', next: 'complete' }
      }
    },
    'bank-customer': {
      id: 'bank-customer', displayTitle: 'IM WARTEBEREICH · IN THE WAITING AREA', displayName: 'Herr Schneider', trackLessonCompletion: false, rewardXp: 0, startNode: 'welcome',
      nodes: {
        welcome: {
          speaker: 'Herr Schneider', german: 'Warten Sie auch auf Hilfe?', english: 'Are you also waiting for help?',
          wordHelp: ['warten = to wait', 'Hilfe = help'],
          choices: [
            { id: 'waiting', text: 'Ja, ich warte hier.', translation: 'Yes, I am waiting here.', correct: true, feedback: 'Gut! “Ich warte hier” means “I am waiting here.”', next: 'waiting-response', vocabularyIds: ['bank_wait_here'] },
            { id: 'ask-help', text: 'Können Sie mir helfen?', translation: 'Can you help me?', correct: true, feedback: 'Sehr gut! This is a polite way to ask someone for help.', next: 'help-response', vocabularyIds: ['bank_ask_help'] },
            { id: 'order-bread', text: 'Ein Brot, bitte.', translation: 'A loaf of bread, please.', correct: false, feedback: 'That phrase is for ordering at a bakery. Try a phrase about waiting or asking for help.' }
          ]
        },
        'waiting-response': { speaker: 'Herr Schneider', german: 'Ich warte auch. Frau Becker ist am Serviceschalter.', english: 'I am waiting too. Ms. Becker is at the service counter.', next: 'thanks' },
        'help-response': { speaker: 'Herr Schneider', german: 'Natürlich. Frau Becker hilft Ihnen am Serviceschalter.', english: 'Of course. Ms. Becker can help you at the service counter.', next: 'thanks' },
        thanks: {
          speaker: 'Herr Schneider', german: 'Viel Erfolg bei Ihrem Besuch!', english: 'Good luck with your visit!',
          choices: [{ id: 'thank', text: 'Danke schön!', translation: 'Thank you very much!', correct: true, feedback: 'Sehr höflich! You thanked Herr Schneider.', next: 'farewell', vocabularyIds: ['bank_thanks'] }]
        },
        farewell: { speaker: 'Herr Schneider', german: 'Gern geschehen.', english: 'You’re welcome.', next: 'complete' }
      }
    },
    'bakery-counter': {
      id: 'bakery-counter', displayTitle: 'BAKERY MISSION', displayName: 'Emil', lessonId: 'bakery-order', rewardId: 'bakery-order', rewardXp: 50, startNode: 'welcome',
      orders: {
        bread: { price: 'zwei', priceEnglish: 'two euros', payment: 'zwei' },
        roll: { price: 'einen', priceEnglish: 'one euro', payment: 'einen' }
      },
      nodes: {
        welcome: {
          speaker: 'Emil, der Bäcker', german: 'Guten Tag! Was darf es sein?', english: 'Good day! What would you like?', vocabularyIds: ['greeting'],
          wordHelp: ['Guten Tag = good day', 'Was darf es sein? = What would you like?'],
          choices: [
            { id: 'order-bread', text: 'Ein Brot, bitte.', translation: 'One loaf of bread, please.', correct: true, feedback: 'Sehr gut! “Ein Brot, bitte” is a polite order for a loaf.', next: 'price-question', storeOrder: 'bread', vocabularyIds: ['bread', 'order'] },
            { id: 'order-roll', text: 'Ich hätte gern ein Brötchen.', translation: 'I would like a bread roll.', correct: true, feedback: 'Sehr gut! “Ich hätte gern …” politely introduces what you would like.', next: 'price-question', storeOrder: 'roll', vocabularyIds: ['roll', 'would_like'] },
            { id: 'order-coffee', text: 'Einen Kaffee, bitte.', translation: 'A coffee, please.', correct: false, feedback: 'That is a useful café order. Here, choose one of the baked goods shown on the price board.', vocabularyIds: ['coffee'] }
          ]
        },
        'price-question': {
          speaker: 'Emil, der Bäcker', german: 'Möchten Sie nach dem Preis fragen?', english: 'Would you like to ask about the price?', vocabularyIds: ['bakery_price_question'],
          wordHelp: ['Wie viel = how much', 'kostet = costs', 'das = that'],
          choices: [
            { id: 'ask-price', text: 'Wie viel kostet das?', translation: 'How much does that cost?', correct: true, feedback: 'Richtig! You used the phrase you just practised to ask the price.', next: 'price', vocabularyIds: ['bakery_price_question'] },
            { id: 'say-thanks', text: 'Danke schön!', translation: 'Thank you very much!', correct: false, feedback: 'That is polite, but you still need to ask how much the item costs.', vocabularyIds: ['thanks'] }
          ]
        },
        price: { speaker: 'Emil, der Bäcker', german: 'Das kostet {price} Euro.', english: 'That costs {priceEnglish}.', next: 'payment', vocabularyIds: ['bakery_price'] },
        payment: {
          speaker: 'Emil, der Bäcker', german: 'Möchten Sie bezahlen?', english: 'Would you like to pay?', vocabularyIds: ['bakery_price'],
          choices: [
            { id: 'pay-correct', text: 'Hier bitte: {payment} Euro.', translation: 'Here you are: {priceEnglish}.', correct: true, feedback: 'Danke! You matched the amount to the price.', next: 'thanks' },
            { id: 'pay-name', text: 'Ich heiße Alex.', translation: 'My name is Alex.', correct: false, feedback: 'That introduces your name. Use the amount you just heard to pay.', vocabularyIds: ['ich_heisse'] }
          ]
        },
        thanks: {
          speaker: 'Emil, der Bäcker', german: 'Vielen Dank für deinen Einkauf!', english: 'Thank you very much for your purchase!',
          choices: [
            { id: 'thank-emil', text: 'Danke schön!', translation: 'Thank you very much!', correct: true, feedback: 'Sehr höflich! You thanked Emil and completed your purchase.', next: 'farewell', vocabularyIds: ['thanks'] },
            { id: 'good-morning', text: 'Guten Morgen!', translation: 'Good morning!', correct: false, feedback: 'That is a greeting. Emil has served you, so thank him politely.', vocabularyIds: ['greeting'] }
          ]
        },
        farewell: { speaker: 'Emil, der Bäcker', german: 'Auf Wiedersehen! Bis bald.', english: 'Goodbye! See you soon.', next: 'complete' }
      }
    },
    'cafe-waiter': {
      id: 'cafe-waiter', displayTitle: 'CAFÉ CONVERSATION', displayName: 'Greta', lessonId: 'cafe-conversation', rewardId: 'cafe-conversation', rewardXp: 40, startNode: 'welcome',
      nodes: {
        welcome: {
          speaker: 'Greta, die Kellnerin', german: 'Guten Tag! Willkommen im Café am Platz.', english: 'Good day! Welcome to Café am Platz.',
          vocabularyIds: ['greeting'],
          choices: [
            { id: 'greet', text: 'Guten Tag!', translation: 'Good day!', correct: true, feedback: 'Genau! Returning the greeting politely fits this moment.', next: 'order', vocabularyIds: ['greeting'] },
            { id: 'bye', text: 'Auf Wiedersehen!', translation: 'Goodbye!', correct: false, feedback: 'That means goodbye. Greta has just welcomed you, so greet her back.' }
          ]
        },
        order: {
          speaker: 'Greta, die Kellnerin', german: 'Was möchten Sie gern?', english: 'What would you like?',
          vocabularyIds: ['would_like'],
          choices: [
            { id: 'coffee', text: 'Einen Kaffee, bitte.', translation: 'A coffee, please.', correct: true, feedback: 'Sehr gut! “Einen Kaffee” is the polite form for ordering a coffee.', next: 'coffee-response', storeOrder: 'coffee', vocabularyIds: ['coffee'] },
            { id: 'water', text: 'Ein Wasser, bitte.', translation: 'A water, please.', correct: true, feedback: 'Sehr gut! This is a clear, polite way to order water.', next: 'water-response', storeOrder: 'water', vocabularyIds: ['water'] },
            { id: 'bread', text: 'Ein Brot, bitte.', translation: 'A loaf of bread, please.', correct: true, feedback: 'Sehr gern! Greta will bring a fresh loaf of bread.', next: 'bread-response', storeOrder: 'bread', vocabularyIds: ['loaf'] },
            { id: 'cake', text: 'Ein Stück Kuchen, bitte.', translation: 'A piece of cake, please.', correct: true, feedback: 'Sehr gern! Greta will bring a piece of cake.', next: 'cake-response', storeOrder: 'cake', vocabularyIds: ['cake'] }
          ]
        },
        'coffee-response': { speaker: 'Greta, die Kellnerin', german: 'Sehr gern. Ein Kaffee kommt sofort.', english: 'Certainly. A coffee is coming right up.', next: 'bill-question' },
        'water-response': { speaker: 'Greta, die Kellnerin', german: 'Sehr gern. Ein Wasser kommt sofort.', english: 'Certainly. A water is coming right up.', next: 'bill-question' },
        'bread-response': { speaker: 'Greta, die Kellnerin', german: 'Natürlich. Ein frisches Brot für Sie.', english: 'Of course. A fresh loaf of bread for you.', next: 'bill-question' },
        'cake-response': { speaker: 'Greta, die Kellnerin', german: 'Sehr gern. Ein Stück Kuchen für Sie.', english: 'Certainly. A piece of cake for you.', next: 'bill-question' },
        'bill-question': {
          speaker: 'Greta, die Kellnerin', german: 'Möchten Sie die Rechnung?', english: 'Would you like the bill?', vocabularyIds: ['bill'],
          choices: [
            { id: 'bill-please', text: 'Ja, die Rechnung, bitte.', translation: 'Yes, the bill, please.', correct: true, feedback: 'Sehr gut! “Die Rechnung, bitte” is how you politely ask for the bill.', next: 'closing', vocabularyIds: ['yes_please', 'bill'] },
            { id: 'thanks-now', text: 'Danke schön.', translation: 'Thank you very much.', correct: false, feedback: 'That means thank you. Greta asked if you would like the bill; answer “Ja, die Rechnung, bitte.”' }
          ]
        },
        closing: { speaker: 'Greta, die Kellnerin', german: 'Hier ist die Rechnung.', english: 'Here is the bill.', choices: [
          { id: 'thank-waiter', text: 'Danke schön.', translation: 'Thank you very much.', correct: true, feedback: 'Sehr höflich! You thanked Greta for the bill.', next: 'farewell', vocabularyIds: ['thanks'] },
          { id: 'wrong-greeting', text: 'Guten Tag.', translation: 'Good day.', correct: false, feedback: 'That is a greeting. Here, thank Greta for bringing the bill.' }
        ] },
        farewell: { speaker: 'Greta, die Kellnerin', german: 'Gern geschehen. Einen schönen Tag noch!', english: 'You’re welcome. Have a lovely day!', next: 'complete' }
      }
    },
    'supermarket-shopping': {
      id: 'supermarket-shopping', displayTitle: 'EINKAUFEN IM SUPERMARKT', displayName: 'Herr Weber',
      lessonId: 'numbers-prices', rewardId: 'numbers-prices', rewardXp: 30, startNode: 'welcome',
      nodes: {
        welcome: {
          speaker: 'Herr Weber, der Verkäufer', german: 'Guten Tag! Kann ich Ihnen helfen?', english: 'Good day! Can I help you?',
          vocabularyIds: ['greeting'],
          choices: [
            { id: 'ask-price', text: 'Wie viel kosten die Äpfel?', translation: 'How much do the apples cost?', correct: true, feedback: 'Richtig! You asked about the price of the apples. “Wie viel kosten …?” is used with plural items.', next: 'price', vocabularyIds: ['apple_price_question', 'apples'] },
            { id: 'ask-directions', text: 'Wo ist der Bahnhof?', translation: 'Where is the train station?', correct: false, feedback: 'That is a useful directions question. Herr Weber asked how he can help; ask about the apples here.' },
            { id: 'goodbye', text: 'Auf Wiedersehen!', translation: 'Goodbye!', correct: false, feedback: 'That means goodbye. You have just arrived; ask Herr Weber about the apples first.' }
          ]
        },
        price: {
          speaker: 'Herr Weber, der Verkäufer', german: 'Die Äpfel kosten drei Euro. Wie viel kosten die Äpfel?',
          english: 'The apples cost three euros. How much do the apples cost?', vocabularyIds: ['apples', 'number_3'],
          wordHelp: ['die Äpfel = the apples', 'drei = three', 'kosten = cost (plural)'],
          choices: [
            { id: 'two-euros', text: 'Zwei Euro.', translation: 'Two euros.', correct: false, feedback: 'Listen for “drei” in Herr Weber’s sentence. Drei means three.', vocabularyIds: ['number_3'] },
            { id: 'three-euros', text: 'Drei Euro.', translation: 'Three euros.', correct: true, feedback: 'Sehr gut! “Drei” means three, so the apples cost three euros.', next: 'order', vocabularyIds: ['number_3', 'apple_price_question'] },
            { id: 'five-euros', text: 'Fünf Euro.', translation: 'Five euros.', correct: false, feedback: 'The price in the sentence is “drei Euro.” Drei means three.', vocabularyIds: ['number_3'] }
          ]
        },
        order: {
          speaker: 'Herr Weber, der Verkäufer', german: 'Möchten Sie die Äpfel nehmen?', english: 'Would you like to take the apples?',
          vocabularyIds: ['take_it'],
          choices: [
            { id: 'take-apples', text: 'Ich nehme das, bitte.', translation: "I'll take that, please.", correct: true, feedback: 'Sehr gut! You politely said you will take the apples.', next: 'goodbye', vocabularyIds: ['take_it'] },
            { id: 'ask-again', text: 'Wie viel kosten die Äpfel?', translation: 'How much do the apples cost?', correct: false, feedback: 'You already asked and learned the price. Now say that you will take the apples.', vocabularyIds: ['apple_price_question'] },
            { id: 'leave', text: 'Auf Wiedersehen!', translation: 'Goodbye!', correct: false, feedback: 'You can say goodbye after deciding. First answer Herr Weber’s question.' }
          ]
        },
        goodbye: { speaker: 'Herr Weber, der Verkäufer', german: 'Gern. Das macht drei Euro. Danke schön!', english: 'Certainly. That will be three euros. Thank you very much.', next: 'complete' }
      }
    },
    'shopping-conversation': {
      id: 'shopping-conversation', displayTitle: 'EINKAUFEN IM SUPERMARKT', displayName: 'Herr Weber',
      lessonId: 'shopping-basics', rewardId: 'shopping-basics', rewardXp: 35, startNode: 'welcome',
      nodes: {
        welcome: { speaker: 'Herr Weber, der Verkäufer', german: 'Guten Tag! Was suchen Sie?', english: 'Good day! What are you looking for?', vocabularyIds: ['suchen', 'milk', 'water_product', 'cheese'], wordHelp: ['suchen = to look for · die Milch = milk · das Wasser = water · der Käse = cheese'], choices: [
          { id: 'look-for-milk', text: 'Ich suche Milch.', translation: 'I’m looking for milk.', correct: true, feedback: 'Richtig! “Ich suche …” means “I’m looking for …”. You have asked for your first product.', next: 'milk-location', vocabularyIds: ['suchen', 'milk'] },
          { id: 'look-for-water', text: 'Ich suche Wasser.', translation: 'I’m looking for water.', correct: true, feedback: 'Sehr gut! “Ich suche …” means “I’m looking for …”. You have asked for your first product.', next: 'water-location', vocabularyIds: ['suchen', 'water_product'] },
          { id: 'ask-bank', text: 'Wo ist die Bank?', translation: 'Where is the bank?', correct: false, feedback: 'That asks for the bank. Herr Weber asked what you are looking for; name a product.' },
          { id: 'say-goodbye', text: 'Auf Wiedersehen!', translation: 'Goodbye!', correct: false, feedback: 'That means goodbye. Start by telling Herr Weber what you need.' }
        ]},
        'milk-location': { speaker: 'Herr Weber, der Verkäufer', german: 'Die Milch finden Sie im Kühlregal.', english: 'You can find the milk in the refrigerated section.', vocabularyIds: ['milk'], wordHelp: ['das Kühlregal = the refrigerated section'], next: 'bread-question' },
        'water-location': { speaker: 'Herr Weber, der Verkäufer', german: 'Das Wasser finden Sie im Getränkeregal.', english: 'You can find the water in the drinks aisle.', vocabularyIds: ['water_product'], wordHelp: ['das Getränkeregal = the drinks aisle'], next: 'bread-question' },
        'bread-question': { speaker: 'Herr Weber, der Verkäufer', german: 'Suchen Sie noch etwas?', english: 'Are you looking for anything else?', choices: [
          { id: 'ask-bread-location', text: 'Wo finde ich das Brot?', translation: 'Where can I find the bread?', correct: true, feedback: 'Sehr gut! You asked where to find another product. Herr Weber will give you directions.', next: 'bread-location', vocabularyIds: ['find_bread', 'bread'] },
          { id: 'ask-for-apples-early', text: 'Haben Sie Äpfel?', translation: 'Do you have apples?', correct: false, feedback: 'That is a useful product question. First ask where you can find the bread.', vocabularyIds: ['have_apples', 'apples'] },
          { id: 'ask-price', text: 'Wie viel kostet das?', translation: 'How much does that cost?', correct: false, feedback: 'That asks for a price. Here, ask where the bread is.', vocabularyIds: ['price_question'] }
        ]},
        'bread-location': { speaker: 'Herr Weber, der Verkäufer', german: 'Das Brot finden Sie hinten links. Möchten Sie noch etwas?', english: 'You can find the bread at the back on the left. Would you like anything else?', vocabularyIds: ['bread'], wordHelp: ['hinten = at the back · links = on the left'], choices: [
          { id: 'ask-for-apples', text: 'Haben Sie Äpfel?', translation: 'Do you have apples?', correct: true, feedback: 'Richtig! You have asked for a second product. Herr Weber will show you the apples.', next: 'apples-response', vocabularyIds: ['have_apples', 'apples'] },
          { id: 'done-now', text: 'Danke, das ist alles.', translation: 'Thanks, that’s all.', correct: false, feedback: 'You have found the bread, but the task asks you to request one more product first.', vocabularyIds: ['shopping_close'] },
          { id: 'ask-again', text: 'Wo finde ich das Brot?', translation: 'Where can I find the bread?', correct: false, feedback: 'Herr Weber has already told you: it is at the back on the left.', vocabularyIds: ['find_bread'] }
        ]},
        'apples-response': { speaker: 'Herr Weber, der Verkäufer', german: 'Ja, die Äpfel sind beim Obstregal. Möchten Sie noch etwas?', english: 'Yes, the apples are by the fruit display. Would you like anything else?', vocabularyIds: ['apples'], wordHelp: ['die Äpfel = the apples · das Obstregal = the fruit display'], choices: [
          { id: 'polite-close', text: 'Danke, das ist alles.', translation: 'Thanks, that’s all.', correct: true, feedback: 'Sehr gut! You politely finished after asking for milk or water and apples and finding the bread.', next: 'closing', vocabularyIds: ['shopping_close'] },
          { id: 'request-cheese', text: 'Haben Sie Käse?', translation: 'Do you have cheese?', correct: false, feedback: 'That asks for yet another product. For this practice, close politely with “Danke, das ist alles.”', vocabularyIds: ['cheese'] },
          { id: 'repeat', text: 'Wo finde ich das Brot?', translation: 'Where can I find the bread?', correct: false, feedback: 'You already know where the bread is. Finish the shopping conversation politely.', vocabularyIds: ['find_bread'] }
        ]},
        closing: { speaker: 'Herr Weber, der Verkäufer', german: 'Gern geschehen. Auf Wiedersehen!', english: 'You’re welcome. Goodbye!', next: 'complete' }
      }
    },
    'rathaus-help': {
      id: 'rathaus-help', displayTitle: 'EIN KLEINES PROBLEM IM RATHAUS', displayName: 'Mia und Frau Neumann', sideMissionId: 'rathaus', trackLessonCompletion: false, startNode: 'welcome',
      nodes: {
        welcome: { speaker: 'Frau Neumann · Rathausmitarbeiterin', german: 'Guten Tag! Willkommen im Rathaus. Wie kann ich Ihnen helfen?', english: 'Good day! Welcome to the town hall. How can I help you?', vocabularyIds: ['town_hall','appointment','form','information','office','warten','brauchen'], wordHelp: ['das Rathaus = the town hall · der Termin = appointment', 'Use Sie when speaking politely to a staff member.'], choices: [
          { id: 'appointment', text: 'Ich habe einen Termin.', translation: 'I have an appointment.', correct: true, feedback: 'Richtig! This clearly tells Frau Neumann why you are here.', next: 'appointment-help', vocabularyIds: ['appointment'] },
          { id: 'form', text: 'Ich brauche ein Formular.', translation: 'I need a form.', correct: true, feedback: 'Sehr gut! “brauchen” means “to need”; this is a polite, useful request.', next: 'form-help', vocabularyIds: ['form','brauchen'] },
          { id: 'goodbye', text: 'Auf Wiedersehen!', translation: 'Goodbye!', correct: false, feedback: 'That is a goodbye. You have just arrived; explain what you need first.' }
        ]},
        'appointment-help': { speaker: 'Frau Neumann · Rathausmitarbeiterin', german: 'Dann können Sie direkt zu Büro 2 gehen. Möchten Sie noch etwas fragen?', english: 'Then you can go straight to Office 2. Would you like to ask anything else?', wordHelp: ['das Büro = the office · direkt = straight / directly'], choices: [
          { id: 'ask-info', text: 'Wo bekomme ich Informationen?', translation: 'Where can I get information?', correct: true, feedback: 'Sehr gut! This is a clear question for the information desk.', next: 'visitor', vocabularyIds: ['information','office'] },
          { id: 'wait', text: 'Muss ich hier warten?', translation: 'Do I have to wait here?', correct: true, feedback: 'Richtig! “warten” means “to wait”; this is a natural question.', next: 'visitor', vocabularyIds: ['warten'] },
          { id: 'random', text: 'Ich möchte einen Kaffee.', translation: 'I would like a coffee.', correct: false, feedback: 'That phrase is for a café. Here, ask about information or waiting.' }
        ]},
        'form-help': { speaker: 'Frau Neumann · Rathausmitarbeiterin', german: 'Das Formular liegt bei der Auskunft. Kann ich Ihnen noch etwas erklären?', english: 'The form is at the information desk. Is there anything else I can explain?', vocabularyIds: ['form','information'], wordHelp: ['die Auskunft = information / information desk', 'Können Sie …? is a polite formal request.'], choices: [
          { id: 'explain', text: 'Können Sie mir das bitte erklären?', translation: 'Could you please explain that to me?', correct: true, feedback: 'Sehr höflich! You used Sie for a formal, polite request.', next: 'visitor', vocabularyIds: ['information'] },
          { id: 'wait-form', text: 'Muss ich hier warten?', translation: 'Do I have to wait here?', correct: true, feedback: 'Correct. This is another useful question while looking for the information desk.', next: 'visitor', vocabularyIds: ['warten'] },
          { id: 'wrong-form', text: 'Ich nehme zwei, bitte.', translation: 'I’ll take two, please.', correct: false, feedback: 'That is for buying things. Ask about the information desk or waiting.' }
        ]},
        visitor: { speaker: 'Mia · Besucherin', german: 'Entschuldigung, ich habe einen Termin. Muss ich hier warten?', english: 'Excuse me, I have an appointment. Do I have to wait here?', vocabularyIds: ['appointment','warten'], wordHelp: ['Mia is also a visitor. Help her find the correct office.'], choices: [
          { id: 'guide', text: 'Büro 2 ist dort. Ich zeige es Ihnen.', translation: 'Office 2 is over there. I’ll show you.', correct: true, feedback: 'Sehr gut! You understood her appointment and gave a clear direction.', next: 'sign-task', vocabularyIds: ['office'] },
          { id: 'confuse', text: 'Die Küche ist dort.', translation: 'The kitchen is over there.', correct: false, feedback: 'This is a town hall. Use the office information Frau Neumann gave you.' }
        ]},
        'sign-task': { speaker: 'Frau Neumann · Rathausmitarbeiterin', german: 'Danke für Ihre Hilfe. Lesen Sie bitte das Schild bei der Tür.', english: 'Thank you for your help. Please read the sign by the door.', vocabularyIds: ['office'], next: 'complete' }
      }
    },
    'home-lukas': {
      id: 'home-lukas', displayTitle: 'WO IST MEINE TASCHE?', displayName: 'Lukas', sideMissionId: 'wohnhaus', trackLessonCompletion: false, startNode: 'welcome',
      nodes: {
        welcome: { speaker: 'Lukas · Bewohner', german: 'Hallo! Wo ist meine Tasche? Ich möchte gleich gehen.', english: 'Hello! Where is my bag? I want to leave soon.', vocabularyIds: ['bag','door'], wordHelp: ['die Tasche = the bag · die Tür = the door'], choices: [
          { id: 'help', text: 'Ich helfe dir. Wo hast du sie zuletzt gesehen?', translation: 'I’ll help you. Where did you last see it?', correct: true, feedback: 'Sehr nett! You offered help and asked a useful question.', next: 'clue', vocabularyIds: ['bag'] },
          { id: 'ignore', text: 'Auf Wiedersehen!', translation: 'Goodbye!', correct: false, feedback: 'Lukas needs help finding his bag. Offer to help first.' }
        ]},
        clue: { speaker: 'Lukas · Bewohner', german: 'Vielleicht im Wohnzimmer. Die Tasche liegt oft auf dem Tisch. Schau bitte nach!', english: 'Maybe in the living room. The bag is often on the table. Please take a look!', vocabularyIds: ['living_room','bag','table'], wordHelp: ['das Wohnzimmer = living room · der Tisch = table', 'First inspect the table for a clue.'], choices: [
          { id: 'search', text: 'Ich suche im Wohnzimmer.', translation: 'I’ll search in the living room.', correct: true, feedback: 'Richtig! You understood the room and can investigate.', next: 'key-clue', vocabularyIds: ['living_room'] },
          { id: 'cafe', text: 'Ich möchte einen Kaffee.', translation: 'I would like a coffee.', correct: false, feedback: 'That is a café phrase. Lukas asked you to search at home.' }
        ]},
        'key-clue': { speaker: 'Lukas · Bewohner', german: 'Der Schlüssel ist im Schrank. Mit ihm kann ich die Küchentür öffnen.', english: 'The key is in the cupboard. With it I can open the kitchen door.', vocabularyIds: ['key','cupboard','door','kitchen'], wordHelp: ['der Schlüssel = key · der Schrank = cupboard · die Küche = kitchen'], choices: [
          { id: 'understand-key', text: 'Ich suche den Schlüssel im Schrank.', translation: 'I’ll look for the key in the cupboard.', correct: true, feedback: 'Sehr gut! You recognised where the key is.', next: 'kitchen-clue', vocabularyIds: ['key','cupboard'] },
          { id: 'wrong-key', text: 'Die Tasche ist im Rathaus.', translation: 'The bag is in the town hall.', correct: false, feedback: 'Lukas said the key is at home in the cupboard. Follow that clue.' }
        ]},
        'kitchen-clue': { speaker: 'Lukas · Bewohner', german: 'Danke! Bitte schau in der Küche nach. Vielleicht steht die Tasche neben der Tür.', english: 'Thanks! Please look in the kitchen. Maybe the bag is beside the door.', vocabularyIds: ['kitchen','bag','door'], next: 'complete' }
      }
    },
    'weekly-market': {
      id: 'weekly-market', displayTitle: 'AUF DEM WOCHENMARKT', displayName: 'Frau Adler',
      sideMissionId: 'weekly-market', rewardId: 'weekly-market', rewardXp: 35, startNode: 'welcome',
      orders: {
        apples: { item: 'Äpfel', itemEnglish: 'apples', price: 'drei', priceEnglish: 'three' },
        tomatoes: { item: 'Tomaten', itemEnglish: 'tomatoes', price: 'zwei', priceEnglish: 'two' },
        flowers: { item: 'Blumen', itemEnglish: 'flowers', price: 'vier', priceEnglish: 'four' }
      },
      nodes: {
        welcome: {
          speaker: 'Frau Adler, die Marktfrau', german: 'Guten Tag! Willkommen auf dem Wochenmarkt. Was darf es sein?',
          english: 'Good day! Welcome to the weekly market. What can I get for you?', vocabularyIds: ['guten_tag'],
          wordHelp: ['Guten Tag = good day / a polite greeting', 'der Wochenmarkt = weekly market'],
          choices: [
            { id: 'greet', text: 'Guten Tag!', translation: 'Good day!', correct: true, feedback: 'Sehr gut! “Guten Tag” is a polite greeting.', next: 'order', vocabularyIds: ['guten_tag'] },
            { id: 'goodbye', text: 'Auf Wiedersehen!', translation: 'Goodbye!', correct: false, feedback: 'That is a polite goodbye. You have just arrived; greet Frau Adler first.' }
          ]
        },
        order: {
          speaker: 'Frau Adler, die Marktfrau', german: 'Was möchten Sie kaufen?', english: 'What would you like to buy?',
          wordHelp: ['die Äpfel = the apples', 'die Tomaten = the tomatoes', 'die Blumen = the flowers', 'Ich möchte …, bitte = I would like …, please'],
          choices: [
            { id: 'apples', text: 'Ich möchte Äpfel, bitte.', translation: 'I would like apples, please.', correct: true, feedback: 'Richtig! “Ich möchte …, bitte” is a polite way to ask for something.', next: 'price-question', storeOrder: 'apples', vocabularyIds: ['market_apples'] },
            { id: 'tomatoes', text: 'Ich möchte Tomaten, bitte.', translation: 'I would like tomatoes, please.', correct: true, feedback: 'Sehr gut! You politely asked for tomatoes.', next: 'price-question', storeOrder: 'tomatoes', vocabularyIds: ['market_tomatoes'] },
            { id: 'flowers', text: 'Ich möchte Blumen, bitte.', translation: 'I would like flowers, please.', correct: true, feedback: 'Sehr gut! You politely asked for flowers.', next: 'price-question', storeOrder: 'flowers', vocabularyIds: ['market_flowers'] }
          ]
        },
        'price-question': {
          speaker: 'Frau Adler, die Marktfrau', german: 'Gern. Möchten Sie den Preis wissen?', english: 'Of course. Would you like to know the price?',
          wordHelp: ['Wie viel = how much', 'kostet = costs', 'das = that'],
          choices: [
            { id: 'ask-price', text: 'Wie viel kostet das?', translation: 'How much does that cost?', correct: true, feedback: 'Richtig! Use this question to ask the price of something.', next: 'price-answer', vocabularyIds: ['market_price_question'] },
            { id: 'say-thanks', text: 'Danke schön!', translation: 'Thank you very much!', correct: false, feedback: 'That is polite, but first ask the price with “Wie viel kostet das?”' }
          ]
        },
        'price-answer': {
          speaker: 'Frau Adler, die Marktfrau', german: 'Die {item} kosten {price} Euro.',
          english: 'The {itemEnglish} cost {priceEnglish} euros.', vocabularyIds: ['number_2', 'number_3', 'number_4'],
          wordHelp: ['kosten = cost (used here with plural items)', 'Euro = euros'], next: 'quantity'
        },
        quantity: {
          speaker: 'Frau Adler, die Marktfrau', german: 'Wie viele möchten Sie?', english: 'How many would you like?',
          wordHelp: ['zwei = two', 'Ich nehme … = I’ll take …'],
          choices: [
            { id: 'take-two', text: 'Ich nehme zwei, bitte.', translation: 'I’ll take two, please.', correct: true, feedback: 'Sehr gut! “Ich nehme zwei, bitte” is a polite way to say you will take two.', next: 'thanks', vocabularyIds: ['market_quantity', 'number_2'] },
            { id: 'ask-price-again', text: 'Wie viel kostet das?', translation: 'How much does that cost?', correct: false, feedback: 'You already know the price. Now tell Frau Adler how many you would like.' }
          ]
        },
        thanks: {
          speaker: 'Frau Adler, die Marktfrau', german: 'Hier sind Ihre {item}. Möchten Sie noch etwas?',
          english: 'Here are your {itemEnglish}. Would you like anything else?',
          choices: [
            { id: 'thank-vendor', text: 'Danke schön!', translation: 'Thank you very much!', correct: true, feedback: 'Sehr höflich! You thanked Frau Adler politely.', next: 'farewell', vocabularyIds: ['thanks'] },
            { id: 'greet-again', text: 'Guten Tag!', translation: 'Good day!', correct: false, feedback: 'You have already greeted her. Thank Frau Adler for the items.' }
          ]
        },
        farewell: { speaker: 'Frau Adler, die Marktfrau', german: 'Gern geschehen. Auf Wiedersehen!', english: 'You’re welcome. Goodbye!', next: 'complete' }
      }
    },
    'station-ticket-clerk': {
      id: 'station-ticket-clerk', displayTitle: 'EINE FAHRKARTE, BITTE', displayName: 'Frau Krüger', lessonId: 'train-station', rewardId: 'train-station', rewardXp: 45, startNode: 'welcome',
      nodes: {
        welcome: { speaker: 'Frau Krüger · Fahrkartenschalter', german: 'Guten Tag! Wohin möchten Sie fahren?', english: 'Good day! Where would you like to travel?', vocabularyIds: ['guten_tag', 'bahnhof', 'zug', 'fahrkartenschalter'], wordHelp: ['der Bahnhof = train station · der Zug = train · der Fahrkartenschalter = ticket counter · Wohin? = Where to?'], choices: [
          { id: 'ask-berlin-ticket', text: 'Eine Fahrkarte nach Berlin, bitte.', translation: 'A ticket to Berlin, please.', correct: true, feedback: 'Richtig! “Eine Fahrkarte nach Berlin” politely tells the clerk your destination.', next: 'ticket-type', vocabularyIds: ['fahrkarte', 'zug', 'fahrkartenschalter'] },
          { id: 'ask-for-cafe', text: 'Einen Kaffee, bitte.', translation: 'A coffee, please.', correct: false, feedback: 'That is a café order. At the station, ask for a Fahrkarte (ticket).' }
        ]},
        'ticket-type': { speaker: 'Frau Krüger · Fahrkartenschalter', german: 'Möchten Sie eine einfache Fahrt oder hin und zurück?', english: 'Would you like a one-way trip or a return ticket?', vocabularyIds: ['einfach', 'hin_zurueck'], wordHelp: ['einfach = one-way · hin und zurück = there and back'], choices: [
          { id: 'one-way', text: 'Einfach, bitte.', translation: 'One-way, please.', correct: true, feedback: 'Gut! “Einfach” means a one-way ticket.', next: 'departure-question', vocabularyIds: ['einfach'] },
          { id: 'return', text: 'Hin und zurück, bitte.', translation: 'There and back, please.', correct: true, feedback: 'Gut! “Hin und zurück” means a return journey.', next: 'departure-question', vocabularyIds: ['hin_zurueck'] }
        ]},
        'departure-question': { speaker: 'Frau Krüger · Fahrkartenschalter', german: 'Der Zug nach Berlin fährt heute um 10:15 Uhr. Wann fährt der Zug?', english: 'The train to Berlin leaves today at 10:15. When does the train leave?', vocabularyIds: ['abfahrt', 'wann_faehrt'], wordHelp: ['die Abfahrt = departure · “um 10:15 Uhr” = at 10:15'], choices: [
          { id: 'time-1015', text: 'Um 10:15 Uhr.', translation: 'At 10:15.', correct: true, feedback: 'Richtig! The board shows Berlin at 10:15.', next: 'platform-question', vocabularyIds: ['abfahrt'] },
          { id: 'time-1030', text: 'Um 10:30 Uhr.', translation: 'At 10:30.', correct: false, feedback: 'Check the board again: 10:30 is the train to Potsdam. Berlin leaves at 10:15.' }
        ]},
        'platform-question': { speaker: 'Frau Krüger · Fahrkartenschalter', german: 'Von welchem Gleis fährt der Zug?', english: 'Which platform does the train leave from?', vocabularyIds: ['gleis', 'bahnsteig', 'welches_gleis'], wordHelp: ['das Gleis = track/platform · Berlin is listed at Gleis 1'], choices: [
          { id: 'platform-one', text: 'Von Gleis 1.', translation: 'From platform 1.', correct: true, feedback: 'Sehr gut! Berlin is listed on Gleis 1.', next: 'closing', vocabularyIds: ['gleis', 'bahnsteig', 'welches_gleis'] },
          { id: 'platform-two', text: 'Von Gleis 2.', translation: 'From platform 2.', correct: false, feedback: 'Gleis 2 is for Potsdam. Find Berlin on the departure board.' }
        ]},
        closing: { speaker: 'Frau Krüger · Fahrkartenschalter', german: 'Hier ist Ihre Fahrkarte. Die Ankunft in Berlin ist um 11:00 Uhr. Gute Reise!', english: 'Here is your ticket. The arrival in Berlin is at 11:00. Have a good trip!', vocabularyIds: ['fahrkarte', 'ankunft'], choices: [
          { id: 'thank-clerk', text: 'Danke für Ihre Hilfe. Auf Wiedersehen!', translation: 'Thank you for your help. Goodbye!', correct: true, feedback: 'Sehr höflich! You thanked Frau Krüger politely.', next: 'farewell', vocabularyIds: ['station_thanks', 'ankunft'] },
          { id: 'repeat-greeting', text: 'Guten Tag!', translation: 'Good day!', correct: false, feedback: 'You have already greeted Frau Krüger. Thank her for helping you.' }
        ]},
        farewell: { speaker: 'Frau Krüger · Fahrkartenschalter', german: 'Gern geschehen. Auf Wiedersehen!', english: 'You’re welcome. Goodbye!', next: 'complete' }
      }
    },
    'station-ticket-inspector': {
      id: 'station-ticket-inspector', displayTitle: 'DIE FAHRKARTE, BITTE', displayName: 'Herr Braun', lessonId: 'train-station', trackLessonCompletion: false, startNode: 'welcome',
      nodes: {
        welcome: { speaker: 'Herr Braun · Zugbegleiter', german: 'Guten Tag. Ihre Fahrkarte, bitte.', english: 'Good day. Your ticket, please.', vocabularyIds: ['fahrkarte'], wordHelp: ['Ihre = your (formal) · Hier ist … = Here is …'], choices: [
          { id: 'show-ticket', text: 'Hier ist meine Fahrkarte.', translation: 'Here is my ticket.', correct: true, feedback: 'Richtig! You politely show your ticket.', next: 'farewell', vocabularyIds: ['hier_ist_meine_fahrkarte', 'fahrkarte'] },
          { id: 'buy-ticket', text: 'Eine Fahrkarte nach Berlin, bitte.', translation: 'A ticket to Berlin, please.', correct: false, feedback: 'That phrase is for buying a ticket at the counter. The inspector asked to see the ticket you already have.' }
        ]},
        farewell: { speaker: 'Herr Braun · Zugbegleiter', german: 'Danke. Gute Reise!', english: 'Thank you. Have a good trip!', next: 'complete' }
      }
    }
  }
};
