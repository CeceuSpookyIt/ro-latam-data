import { test } from 'node:test';
import assert from 'node:assert/strict';
import { keepPrevious } from './keep-previous.mjs';

test('override novo vence o anterior', () => {
  const { result } = keepPrevious({ 1: { name: 'Novo', type: 0, slots: 0 } }, { 1: { name: 'Velho', type: 0, slots: 0 } }, new Set([1]));
  assert.equal(result[1].name, 'Novo');
});
test('fora do override novo, mantem o nome anterior', () => {
  const { result, kept } = keepPrevious({ 2: { name: 'coreano', type: 0, slots: 0 } }, { 2: { name: 'Visual', type: 0, slots: 1 } }, new Set());
  assert.deepEqual(result[2], { name: 'Visual', type: 0, slots: 1 });
  assert.equal(kept, 1);
});
test('item que sumiu do cliente continua', () => {
  const { result } = keepPrevious({}, { 3: { name: 'Antigo', type: 6, slots: 0 } }, new Set());
  assert.equal(result[3].name, 'Antigo');
});
test('item novo sem anterior fica como veio', () => {
  const { result, kept } = keepPrevious({ 4: { name: 'X', type: 0, slots: 0 } }, {}, new Set());
  assert.equal(result[4].name, 'X');
  assert.equal(kept, 0);
});
