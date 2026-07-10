import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseBracket, parseQuoted } from './parse-iteminfo.mjs';

const BRACKET = `
[4001] = {
  unidentifiedDisplayName = [[Card]],
  identifiedDisplayName = [[Carta Poring]],
  identifiedDescriptionName = {
    [[SOR +2.]],
    [[Tipo: Carta]],
  },
  slotCount = 0,
  ClassNum = 0
},
[1101] = {
  identifiedDisplayName = [[Espada]],
  slotCount = 4,
}
`;

test('parseBracket extrai nome, slots e descricao', () => {
  const m = parseBracket(BRACKET);
  assert.equal(m.get(4001).name, 'Carta Poring');
  assert.equal(m.get(4001).slots, 0);
  assert.deepEqual(m.get(4001).descLines, ['SOR +2.', 'Tipo: Carta']);
  assert.equal(m.get(1101).name, 'Espada');
  assert.equal(m.get(1101).slots, 4);
});

const BRACKET_EMPTY = `
[9990] = {
  identifiedDisplayName = [[]],
  slotCount = 0
},
[9991] = {
  identifiedDisplayName = [[Item Valido]],
  slotCount = 0
}
`;

test('parseBracket pula itens com nome vazio (placeholders)', () => {
  const m = parseBracket(BRACKET_EMPTY);
  assert.equal(m.has(9990), false);
  assert.equal(m.get(9991).name, 'Item Valido');
});

const QUOTED = `
  [12345] = {
    identifiedDisplayName = "Item Novo",
    identifiedDescriptionName = { "Linha 1", "Tipo: Carta" },
    slotCount = 1
  }
`;

test('parseQuoted extrai nome, slots e descricao', () => {
  const m = parseQuoted(QUOTED);
  assert.equal(m.get(12345).name, 'Item Novo');
  assert.equal(m.get(12345).slots, 1);
  assert.deepEqual(m.get(12345).descLines, ['Linha 1', 'Tipo: Carta']);
});
