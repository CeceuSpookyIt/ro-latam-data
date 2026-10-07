import { execFileSync } from 'child_process';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const HERE = dirname(fileURLToPath(import.meta.url));
const run = (script) => {
  console.log(`\n=== ${script} ===`);
  execFileSync('node', [resolve(HERE, script)], { stdio: 'inherit' });
};
run('build-items.mjs');
run('build-randomopt.mjs');
run('build-monster-names.mjs');
run('build-monster-keys.mjs');
console.log('\nBuild completo. Verifique data/item.json, data/randomopt.json, data/monster-names.json e data/monster-keys.json.');
