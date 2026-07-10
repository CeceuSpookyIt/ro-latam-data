import { test } from 'node:test';
import assert from 'node:assert/strict';
import { decodeLuaEscapes } from './lua-decode.mjs';

test('latin1: byte unico \\225 vira a-acento', () => {
  assert.equal(decodeLuaEscapes('HP m\\225x. +%d', 'latin1'), 'HP máx. +%d');
});

test('latin1: preserva %d e %%', () => {
  assert.equal(decodeLuaEscapes('+%d%%', 'latin1'), '+%d%%');
});

test('utf-8: escapes multibyte \\195\\161 viram a-acento', () => {
  assert.equal(decodeLuaEscapes('m\\195\\161x', 'utf-8'), 'máx');
});

test('escapes simples \\n \\\\ \\"', () => {
  assert.equal(decodeLuaEscapes('a\\nb\\\\c\\"d', 'latin1'), 'a\nb\\c"d');
});
