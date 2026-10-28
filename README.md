# Deutschstadt

A small, offline-friendly German-learning town RPG made with vanilla JavaScript and HTML Canvas. No install, build step, images, fonts, or network connection are required.

## Run locally

For offline single-player, open `index.html` in a modern browser; the game does not need a server or internet access. Progress is stored in the browser's localStorage for this origin.

## Optional LAN multiplayer

Install the small WebSocket dependency once, then start the local static and WebSocket server:

```sh
npm install
npm start
```

Open the printed `http://localhost:8080` address in two browser windows on the host computer. For LAN play, open the printed `http://<host-lan-ip>:8080` address on both computers. The WebSocket connection uses the same host automatically. Allow port 8080 on the host's private-network firewall if prompted. Multiplayer only works while the host server is running; solo play remains available without it. No internet multiplayer is provided.

## Run state tests

Use Node.js's built-in test runner; no package installation is required:

```sh
node --test tests
```

## Play

- Choose **Start learning** and enter a name. A short, English-supported tutorial starts automatically, so no German knowledge is needed. **Continue journey** resumes a saved game; **Practise German** opens the learning journal.
- Move with **WASD** or the **arrow keys**.
- Walk near Marta, Jonas, or Lena and press **E** to see their German greeting and English translation.
- Meet Emil the baker and choose **Practise bakery phrases** before the transaction conversation. The bakery exercise lesson can also be resumed from the learning journal after a refresh.
- Enter the bakery through its street-facing doorway. Walk around its shelves and counter, read the price board, practise the phrases, and complete Emil's branching order and payment conversation. Bread costs two euros and a bread roll costs one euro; the conversation shares the bakery lesson's one-time XP reward.
- Open the learning journal from the pencil button to replay **Greetings & introductions**, unlock **Numbers & prices** after finishing it, play the bakery lesson, inspect saved vocabulary, and review learned words with mistakes first. The numbers lesson teaches and practises 0–10 and asking prices. Shopping, directions, the station, daily life, and neighbours remain locked until their lessons are built.
- The on-screen mission tracker and the journal's **Continue learning** action use the same saved lesson, conversation, and bank-objective progress. Follow the gold **NEXT** marker to the right NPC, entrance, or object; minimise the tracker with its button. The journal lists completed lessons separately for optional replay and explains locked prerequisites.
- Walk to the café entrance in the northeast part of town and press **E**. Inside, read the menu or inspect the pastry display and coffee machine; talk with Greta, Otto, or Lina. Greta's preparation lesson teaches useful phrases with optional pronunciation and practice questions. Order coffee, water, bread, or cake, ask for the bill, and close politely. Press **E** by the café exit to return to the MarktPlatz.
- Enter the **BANK · STADTBANK** building on the eastern side of town. Practise phrases with Frau Becker before the account conversation, use the fictional Geldautomat menu, read the information board, and complete the one-question account vocabulary exercise. The mission objectives and one-time 50 XP reward are saved locally.
- Press **E** or **Escape** to close a conversation.
- Press **Escape** or the pause button for Resume and Return to Main Menu.
- Open **Settings** from the main menu to adjust German text-to-speech speed. Pronunciation is optional; the game does not use speech recognition or assess spoken answers.
- Completing the greetings lesson awards 30 XP once; numbers award 30 XP and the bakery awards 50 XP once each. Replaying lessons and reviewing words updates answer history without repeating rewards.

## Files

- `index.html` — menu, HUD, dialogue, and pause/settings/help containers.
- `style.css` — responsive town-game interface and original CSS title illustration.
- `game.js` — world data, canvas rendering, collision/movement, input, dialogue, and local save handling.
- `world-data.js` — registered town, café, and bakery scene dimensions, doors, interior fixtures, interactables, and interior NPCs.
- `lessons.js` — unit outline, bakery lesson, exercises, and vocabulary content.
- `learning.js` — reusable exercise evaluation, lesson checkpoints, one-time reward claims, and spaced-review records.
- `server.js` — local static game server and `ws`-based roomless player-state relay.
- `multiplayer-client.js` — optional reconnecting browser client and remote-player rendering data.
- `multiplayer-protocol.js` — strict client-message validation and scene coordinate bounds.
- `tests/learning.test.js` — focused progression, checkpoint, vocabulary, and reward tests (`node --test tests/learning.test.js`).

The reusable lesson engine supports multiple choice, German-to-English and English-to-German translation, fill-in-the-blank, sentence building, listening comprehension, and NPC conversation choices. Wrong answers include explanations and allow another attempt. Vocabulary stores its topic, example, answer history, and review date. Wrong answers are scheduled sooner; review order is deterministic and prioritizes missed words. One correct answer does not mark a word mastered.

Save data uses the compatible key `deutschstadt.save.v1` with schema version 5. Older saves are normalized to include the new scenes, bank mission objectives, conversations, lessons, vocabulary, and tutorial state while retaining player name, XP, scene, bakery progress, café conversation, and claimed rewards. In-progress lessons and conversations resume from their saved checkpoints; malformed data safely disables Continue and leaves a new journey available.
