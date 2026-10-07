import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { execFileSync } from 'child_process';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { parseBracket, parseQuoted } from './parse-iteminfo.mjs';
import { deriveType } from './item-type.mjs';
import { keepPrevious } from './keep-previous.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CLIENT = process.env.RO_CLIENT_DIR || 'D:/Gravity/Ragnarok';
const ITEMINFO = resolve(CLIENT, 'System/itemInfo.lua');
const ITEMINFO_NEW_LUB = resolve(CLIENT, 'System/iteminfo_new.lub');
const UNLUAC = resolve(ROOT, 'tools/unluac.jar');
const OUT = resolve(ROOT, 'data/item.json');

console.log(`Lendo ${ITEMINFO} (latin1)...`);
const base = parseBracket(readFileSync(ITEMINFO, 'latin1'));
console.log(`  ${base.size} itens`);

const merged = new Map(base);
const overrideIds = new Set();
// Overrides pt-BR: o iteminfo_new.lub do cliente, descompilado aqui mesmo (unluac), para
// cada patch novo entrar so com `npm run build`. RO_ITEMINFO_NEW aponta para um .lua ja
// descompilado, se preciso. Sem nenhum dos dois, para: gerar so do itemInfo.lua de 2022
// daria coreano em boa parte dos itens.
let overridesText;
if (process.env.RO_ITEMINFO_NEW) {
  console.log(`Lendo ${process.env.RO_ITEMINFO_NEW} (utf-8, overrides)...`);
  overridesText = readFileSync(process.env.RO_ITEMINFO_NEW, 'utf-8');
} else if (existsSync(ITEMINFO_NEW_LUB)) {
  console.log(`Descompilando ${ITEMINFO_NEW_LUB} (overrides)...`);
  overridesText = execFileSync('java', ['-jar', UNLUAC, ITEMINFO_NEW_LUB], { encoding: 'utf8', maxBuffer: 128 * 1024 * 1024 });
} else {
  console.error(`ERRO: ${ITEMINFO_NEW_LUB} nao existe e RO_ITEMINFO_NEW nao foi definido.`);
  process.exit(1);
}
const ov = parseQuoted(overridesText);
for (const [id, v] of ov) { merged.set(id, v); overrideIds.add(id); } // override vence
console.log(`  ${ov.size} overrides`);

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
