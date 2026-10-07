import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { parseBracket, parseQuoted } from './parse-iteminfo.mjs';
import { deriveType } from './item-type.mjs';
import { keepPrevious } from './keep-previous.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CLIENT = process.env.RO_CLIENT_DIR || 'D:/Gravity/Ragnarok';
const ITEMINFO = resolve(CLIENT, 'System/itemInfo.lua');
const OVERRIDES = process.env.RO_ITEMINFO_NEW || 'C:/Users/Marcel/rag/iteminfo_new_decompiled.lua';
const OUT = resolve(ROOT, 'data/item.json');

console.log(`Lendo ${ITEMINFO} (latin1)...`);
const base = parseBracket(readFileSync(ITEMINFO, 'latin1'));
console.log(`  ${base.size} itens`);

const merged = new Map(base);
const overrideIds = new Set();
if (existsSync(OVERRIDES)) {
  console.log(`Lendo ${OVERRIDES} (utf-8, overrides)...`);
  const ov = parseQuoted(readFileSync(OVERRIDES, 'utf-8'));
  for (const [id, v] of ov) { merged.set(id, v); overrideIds.add(id); } // override vence
  console.log(`  ${ov.size} overrides`);
}

let result = {};
let cards = 0;
for (const [id, v] of merged) {
  const type = deriveType(v.descLines);
  if (type === 6) cards++;
  result[String(id)] = { name: v.name, type, slots: v.slots };
}

if (existsSync(OUT)) {
  const prev = keepPrevious(result, JSON.parse(readFileSync(OUT, 'utf-8')), overrideIds);
  result = prev.result;
  console.log(`  ${prev.kept} itens mantidos do item.json anterior (sem nome no override novo)`);
}

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(result, null, 0) + '\n', 'utf-8');
const bytes = Buffer.byteLength(JSON.stringify(result));
console.log(`Escrito ${OUT}: ${Object.keys(result).length} itens (${cards} cartas), ${(bytes/1024).toFixed(0)}KB`);
