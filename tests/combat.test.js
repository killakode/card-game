import { GameEngine } from '../src/engine/gameEngine.js';
import { CombatController } from '../src/engine/combat.js';
import { KEYWORDS } from '../src/engine/cards.js';

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

console.log('--- Testing Combat Rules & Spell Mechanics ---');

const game = new GameEngine('MAGE', 'WARRIOR');
const combat = new CombatController(game);

// Give player plenty of mana for test
game.player.mana = 10;
game.player.maxMana = 10;

// Test playing a minion card from hand
const minionCardIndex = game.player.hand.findIndex(c => c.type === 'MINION');
if (minionCardIndex >= 0) {
  const cardName = game.player.hand[minionCardIndex].name;
  const success = combat.playCard('PLAYER', minionCardIndex);
  assert(success, `Successfully played minion ${cardName}`);
  assert(game.player.board.length === 1, 'Board should have 1 minion');
}

// Setup Taunt test
game.opponent.board.push({
  instanceId: 'opp_taunt_1',
  name: 'Пехотинец Златоземья',
  attack: 1,
  health: 2,
  maxHealth: 2,
  keywords: [KEYWORDS.TAUNT],
  canAttack: false
});

game.opponent.board.push({
  instanceId: 'opp_normal_1',
  name: 'Речной ящур',
  attack: 3,
  health: 2,
  maxHealth: 2,
  keywords: [],
  canAttack: false
});

// Create attacker minion with Charge
game.player.board.push({
  instanceId: 'player_attacker_1',
  name: 'Вепрь-одноклык',
  attack: 1,
  health: 1,
  maxHealth: 1,
  keywords: [KEYWORDS.CHARGE],
  canAttack: true,
  attacksThisTurn: 0
});

// Try attacking non-taunt minion when taunt exists (should fail)
const invalidAttack = combat.attack('PLAYER', 'player_attacker_1', 'opp_normal_1');
assert(!invalidAttack, 'Attacking non-taunt minion when Taunt exists should fail');

// Try attacking opponent hero when taunt exists (should fail)
const invalidHeroAttack = combat.attack('PLAYER', 'player_attacker_1', 'OPPONENT');
assert(!invalidHeroAttack, 'Attacking hero when Taunt exists should fail');

// Attack taunt minion (should succeed)
const validAttack = combat.attack('PLAYER', 'player_attacker_1', 'opp_taunt_1');
assert(validAttack, 'Attacking Taunt minion should succeed');
assert(game.opponent.board.find(m => m.instanceId === 'opp_taunt_1').health === 1, 'Taunt minion health should decrease by 1');

// Test Hero Power (Mage targeted damage)
const hpSuccess = combat.useHeroPower('PLAYER', 'opp_taunt_1');
assert(hpSuccess, 'Mage hero power should hit taunt minion');
assert(game.opponent.board.find(m => m.instanceId === 'opp_taunt_1') === undefined, 'Taunt minion should die and be cleaned up');

console.log(`\nCombat Test Summary: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
