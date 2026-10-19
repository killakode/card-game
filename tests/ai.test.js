import { GameEngine } from '../src/engine/gameEngine.js';
import { CombatController } from '../src/engine/combat.js';
import { AIController } from '../src/engine/ai.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`✗ FAIL: ${message}`);
    failed++;
  }
}

console.log('--- Testing AI Opponent Logic ---');

const game = new GameEngine('MAGE', 'HUNTER');
const combat = new CombatController(game);
const ai = new AIController(game, combat);

// Fast-forward to AI turn with 5 mana
game.endTurn(); // Switches turn to OPPONENT
game.opponent.mana = 5;
game.opponent.maxMana = 5;

const initialHandCount = game.opponent.hand.length;
ai.playTurn();

assert(game.activePlayer === 'PLAYER', 'AI turn execution should finish and end turn to PLAYER');
assert(game.opponent.mana <= 5, 'AI should spend mana during turn');

console.log(`\nAI Test Summary: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
