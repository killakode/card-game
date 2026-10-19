import { readdirSync } from 'fs';
import { join } from 'path';

console.log('=== RUNNING ALL UNIT & INTEGRATION TESTS ===\n');

const testDir = './tests';
const files = readdirSync(testDir).filter(f => f.endsWith('.test.js'));

let allPassed = true;

for (const file of files) {
  console.log(`Running ${file}...`);
  try {
    await import(`./${file}`);
  } catch (e) {
    console.error(`Failed executing ${file}:`, e);
    allPassed = false;
  }
}

if (!allPassed) {
  process.exit(1);
}
