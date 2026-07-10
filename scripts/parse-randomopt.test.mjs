import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseEnumVar, parseNameTable, joinRandomOpt } from './parse-randomopt.mjs';

const ENUM = `
EnumVAR = {
  VAR_MAXHPAMOUNT = {1, 109},
  RANGE_ATTACK_DAMAGE_TARGET = {166, 1},
  HEAL_VALUE = {168, 0},
}`;

const NAMES = `
NameTable_VAR = {
  [EnumVAR.VAR_MAXHPAMOUNT[1]] = "HP m\\225x. +%d",
  [EnumVAR.RANGE_ATTACK_DAMAGE_TARGET[1]] = "Dano f\\237sico \\224 dist\\226ncia +%d%%",
}`;

test('parseEnumVar mapeia VAR -> ordinal', () => {
  const m = parseEnumVar(ENUM);
  assert.equal(m.get('VAR_MAXHPAMOUNT'), 1);
  assert.equal(m.get('RANGE_ATTACK_DAMAGE_TARGET'), 166);
});

test('parseNameTable decodifica templates latin1', () => {
  const m = parseNameTable(NAMES);
  assert.equal(m.get('VAR_MAXHPAMOUNT'), 'HP máx. +%d');
  assert.equal(m.get('RANGE_ATTACK_DAMAGE_TARGET'), 'Dano físico à distância +%d%%');
});

test('joinRandomOpt keia pelo ordinal', () => {
  const out = joinRandomOpt(parseEnumVar(ENUM), parseNameTable(NAMES));
  assert.equal(out['1'], 'HP máx. +%d');
  assert.equal(out['166'], 'Dano físico à distância +%d%%');
  assert.equal(out['168'], undefined); // sem template
});
