import { execFileSync } from 'child_process';
import { writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { extractFromGrf } from './extract-grf.mjs';
import { parseEnumVar, parseNameTable, joinRandomOpt } from './parse-randomopt.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const UNLUAC = resolve(ROOT, 'tools/unluac.jar');
const TMP = resolve(ROOT, 'tmp/grf');
const OUT = resolve(ROOT, 'data/randomopt.json');

function decompile(lubPath) {
  return execFileSync('java', ['-jar', UNLUAC, lubPath], { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
}

console.log('Extraindo lubs do GRF...');
const written = extractFromGrf(['enumvar', 'addrandomoptionnametable_ptbr'], TMP);
const enumPath = written.find((p) => /enumvar/i.test(p));
const namePath = written.find((p) => /ptbr/i.test(p));
if (!enumPath || !namePath) throw new Error(`lubs faltando: ${written.join(', ')}`);

console.log('Decompilando...');
const enumMap = parseEnumVar(decompile(enumPath));
const nameMap = parseNameTable(decompile(namePath));
const result = joinRandomOpt(enumMap, nameMap);

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(result, null, 0) + '\n', 'utf-8');
console.log(`Escrito ${OUT}: ${Object.keys(result).length} options`);
