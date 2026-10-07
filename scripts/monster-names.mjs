// Tabela de nomes de monstro do cliente LATAM: um dos ~1.200 CSVs com nome em hash do
// data.grf. Sem cabeçalho, 10 colunas; a 0 é a chave crua (a mesma que o servidor manda no
// nome do ator como \x1c<chave>\x1c) e as demais vêm em base64 UTF-8: 2 = en, 7 = pt-BR, 9 = es.
// O nome do arquivo muda com o patch, então a tabela é achada pelo CONTEÚDO (âncoras).
// O GRF de 2026-10 traz DUAS tabelas com as âncoras (a atual, 3.015 linhas, e uma antiga
// de 2.579 cujas chaves estão todas na atual): vence a maior, desde que contenha as outras.
const ANCORAS = [['oYYB', 'Poring'], ['DIcB', 'Drops']];
const b64 = (s) => (s ? Buffer.from(s, 'base64').toString('utf8').trim() : '');

export function parseNamesCsv(text) {
  const table = new Map();
  for (const l of text.split(/\r?\n/)) {
    if (!l) continue;
    const c = l.split(',');
    if (!c[0]) continue;
    table.set(c[0], { pt: b64(c[7]) || null, en: b64(c[2]) || null });
  }
  return table;
}

export function pickMonsterTable(csvs) {
  const candidatas = csvs
    .map(({ name, text }) => ({ name, table: parseNamesCsv(text) }))
    .filter(({ table }) => ANCORAS.every(([k, en]) => table.get(k)?.en === en))
    .sort((a, b) => b.table.size - a.table.size);
  if (candidatas.length === 0) throw new Error('nenhum CSV com as âncoras oYYB→Poring e DIcB→Drops');
  const [maior, ...outras] = candidatas;
  for (const o of outras) {
    const fora = [...o.table.keys()].filter((k) => !maior.table.has(k));
    if (fora.length) throw new Error(`${maior.name} não contém ${fora.length} chaves de ${o.name} (ex.: ${fora.slice(0, 3).join(', ')})`);
  }
  return maior;
}

export function namesToJson(table) {
  const out = {};
  for (const k of [...table.keys()].sort()) {
    const e = table.get(k);
    if (e.pt || e.en) out[k] = { pt: e.pt, en: e.en };
  }
  return out;
}
