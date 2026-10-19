import { CARDS_DATABASE, HEROES, getCardById, createStarterDeck, HERO_CLASSES } from '../src/engine/cards.js';

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

console.log('--- Testing Cards Database ---');

assert(CARDS_DATABASE.length >= 25, `CARDS_DATABASE should contain at least 25 cards (found ${CARDS_DATABASE.length})`);

const elvenArcher = getCardById('n_elven_archer');
assert(elvenArcher !== null, 'getCardById should return Elven Archer');
assert(elvenArcher.cost === 1, 'Elven Archer cost should be 1');
assert(elvenArcher.attack === 1, 'Elven Archer attack should be 1');

const mageStarter = createStarterDeck(HERO_CLASSES.MAGE);
assert(mageStarter.length === 20, `Starter deck should have 20 cards (got ${mageStarter.length})`);

assert(HEROES.MAGE.health === 30, 'Mage hero health should be 30');
assert(HEROES.WARRIOR.heroPower.cost === 2, 'Warrior hero power cost should be 2');

console.log(`\nCards Test Summary: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
