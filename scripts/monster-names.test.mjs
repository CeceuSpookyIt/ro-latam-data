import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseNamesCsv, pickMonsterTable, namesToJson } from './monster-names.mjs';

const b = (s) => Buffer.from(s, 'utf8').toString('base64');
const linha = (k, en, pt) => [k, '', b(en), '', '', '', '', b(pt), '', b(en)].join(',');
const ATUAL = [linha('oYYB', 'Poring', 'Poring'), linha('DIcB', 'Drops', 'Drops'),
  linha('VpIB', 'Lava Golem of Fire', '[Eco] Golem de Lava'), linha('WZEB', 'Wooden Warrior', 'Bárbaro')].join('\r\n');
const ANTIGA = [linha('oYYB', 'Poring', 'Poring'), linha('DIcB', 'Drops', 'Drops')].join('\n');
const OUTRA = [linha('xxAB', 'Sword', 'Espada')].join('\n');

test('parseNamesCsv decodifica base64 UTF-8 (acento) e usa en=col 2, pt=col 7', () => {
  const t = parseNamesCsv(ATUAL);
  assert.deepEqual(t.get('WZEB'), { pt: 'Bárbaro', en: 'Wooden Warrior' });
  assert.equal(t.size, 4);
});
test('parseNamesCsv: campo vazio vira null; linha vazia é pulada', () => {
  const t = parseNamesCsv(['k1AB,,,,,,,' + b('Só pt') + ',,', '', 'k2AB,,' + b('Only en') + ',,,,,,,'].join('\n'));
  assert.deepEqual(t.get('k1AB'), { pt: 'Só pt', en: null });
  assert.deepEqual(t.get('k2AB'), { pt: null, en: 'Only en' });
});
test('pickMonsterTable: uma candidata', () => {
  assert.equal(pickMonsterTable([{ name: 'a.csv', text: ATUAL }, { name: 'o.csv', text: OUTRA }]).name, 'a.csv');
});
test('pickMonsterTable: duas candidatas, a maior contém a outra -> a maior', () => {
  const r = pickMonsterTable([{ name: 'velha.csv', text: ANTIGA }, { name: 'atual.csv', text: ATUAL }]);
  assert.equal(r.name, 'atual.csv');
  assert.equal(r.table.size, 4);
});
test('pickMonsterTable: nenhuma candidata -> lança', () => {
  assert.throws(() => pickMonsterTable([{ name: 'o.csv', text: OUTRA }]), /nenhum CSV/);
});
test('pickMonsterTable: a maior não contém a outra -> lança', () => {
  const divergente = [ANTIGA, linha('zzZB', 'Nova', 'Nova')].join('\n');
  assert.throws(() => pickMonsterTable([{ name: 'a.csv', text: ATUAL }, { name: 'd.csv', text: divergente }]), /não contém/);
});
test('namesToJson: ordenado por chave, sem entrada sem nome', () => {
  const t = new Map([['b', { pt: 'B', en: null }], ['a', { pt: null, en: 'A' }], ['c', { pt: null, en: null }]]);
  assert.deepEqual(Object.keys(namesToJson(t)), ['a', 'b']);
});
