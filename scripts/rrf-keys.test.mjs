import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'fs';
import { keysFromRrf, buildSeed } from './rrf-keys.mjs';

// Mesmos bytes e mesma lista do site (src/lib/monstros/__fixtures__): paridade.
const FIX = new URL('../test/fixtures/', import.meta.url);
const rrf = new Uint8Array(readFileSync(new URL('chaves-mini.rrf', FIX)));
const esperado = JSON.parse(readFileSync(new URL('chaves-mini.expected.json', FIX), 'utf8'));

test('keysFromRrf extrai os mesmos pares que o leitor do site', () => {
  assert.deepEqual(keysFromRrf(rrf), esperado);
});
test('keysFromRrf: chunk truncado no fim para sem erro (só o Poporing sem chave some)', () => {
  assert.deepEqual(keysFromRrf(rrf.subarray(0, rrf.length - 3)), esperado);
});
test('keysFromRrf: arquivo que não é .rrf devolve []', () => {
  assert.deepEqual(keysFromRrf(new Uint8Array(400)), []);
});
test('buildSeed: só chave conhecida conta; id com duas chaves conhecidas é ambíguo', () => {
  const names = { oYYB: { pt: 'Poring', en: 'Poring' }, VpIB: { pt: '[Eco] Golem de Lava', en: 'Lava Golem of Fire' },
    FIkB: { pt: 'A', en: 'A' }, DIkB: { pt: 'B', en: 'B' } };
  const { seed, ambiguous } = buildSeed(esperado, names);
  assert.deepEqual(seed, { 1002: 'oYYB', 21559: 'VpIB' });
  assert.deepEqual(ambiguous, [{ monster_id: 6051, keys: ['DIkB', 'FIkB'] }]);
});
