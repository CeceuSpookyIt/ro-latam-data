import { test } from 'node:test';
import assert from 'node:assert/strict';
import { deriveType } from './item-type.mjs';

test('Tipo: Carta -> 6 (com codigo de cor)', () => {
  assert.equal(deriveType(['SOR +2.', 'Tipo: ^777777Carta^000000', 'Peso: 1']), 6);
});
test('Tipo: Arma -> 0', () => {
  assert.equal(deriveType(['Tipo: Espada', 'ATQ: 100']), 0);
});
test('sem linha Tipo -> 0', () => {
  assert.equal(deriveType(['Maca azeda.']), 0);
});
