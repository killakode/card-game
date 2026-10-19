import { GameEngine } from '../src/engine/gameEngine.js';

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

console.log('--- Testing GameEngine State & Turn Management ---');

const game = new GameEngine('MAGE', 'WARRIOR');

assert(game.player.hand.length === 4, `Player hand size should be 4 on Turn 1 (got ${game.player.hand.length})`);
assert(game.opponent.hand.length === 4, `Opponent hand size should be 4 (got ${game.opponent.hand.length})`);

assert(game.player.mana === 1, 'Player should start with 1 mana on turn 1');
assert(game.player.maxMana === 1, 'Player max mana should be 1 on turn 1');

// End turn to test transition to Opponent
game.endTurn();
assert(game.activePlayer === 'OPPONENT', 'Active player should switch to OPPONENT');
assert(game.opponent.mana === 1, 'Opponent should have 1 mana');

// End turn to test transition back to Player
game.endTurn();
assert(game.activePlayer === 'PLAYER', 'Active player should switch back to PLAYER');
assert(game.turn === 2, 'Turn count should be 2');
assert(game.player.mana === 2, 'Player should have 2 mana on turn 2');

// Test damage and health reduction
game.damageCharacter(game.opponent, 5);
assert(game.opponent.health === 25, 'Opponent health should decrease to 25');

// Test fatigue when deck is empty
game.player.deck = [];
game.drawCard('PLAYER'); // Fatigue 1
assert(game.player.health === 29, `Player health should be 29 after fatigue 1 (got ${game.player.health})`);

console.log(`\nGameEngine Test Summary: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
