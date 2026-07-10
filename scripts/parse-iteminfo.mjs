import { decodeLuaEscapes } from './lua-decode.mjs';

// Divide o texto em blocos [id] = { ... } e retorna os limites.
function blockBounds(text) {
  const re = /\[(\d+)\]\s*=\s*\{/g;
  const starts = [];
  let m;
  while ((m = re.exec(text)) !== null) starts.push({ id: parseInt(m[1], 10), index: m.index });
  return starts;
}

// itemInfo.lua: strings em long-bracket [[...]] ou [=[...]=]. Texto lido como latin1.
export function parseBracket(text) {
  const out = new Map();
  const starts = blockBounds(text);
  for (let i = 0; i < starts.length; i++) {
    const { id, index } = starts[i];
    const end = i + 1 < starts.length ? starts[i + 1].index : index + 8000;
    const block = text.substring(index, end);

    const nameMatch = block.match(/(?<![un])identifiedDisplayName\s*=\s*\[=*\[([\s\S]*?)\]=*\]/);
    if (!nameMatch) continue;
    const name = nameMatch[1].trim();

    const slotMatch = block.match(/slotCount\s*=\s*(\d+)/);
    const slots = slotMatch ? parseInt(slotMatch[1], 10) : 0;

    const descLines = [];
    const descMatch = block.match(/(?<![un])identifiedDescriptionName\s*=\s*\{([\s\S]*?)\}/);
    if (descMatch) {
      const lineRe = /\[=*\[([\s\S]*?)\]=*\]/g;
      let lm;
      while ((lm = lineRe.exec(descMatch[1])) !== null) descLines.push(lm[1]);
    }
    out.set(id, { name, slots, descLines });
  }
  return out;
}

// iteminfo_new_decompiled.lua: strings "..." com escapes. Texto lido como utf-8.
export function parseQuoted(text) {
  const out = new Map();
  const starts = blockBounds(text);
  for (let i = 0; i < starts.length; i++) {
    const { id, index } = starts[i];
    const end = i + 1 < starts.length ? starts[i + 1].index : index + 8000;
    const block = text.substring(index, end);

    const nameMatch = block.match(/(?<![un])identifiedDisplayName\s*=\s*"((?:[^"\\]|\\.)*)"/);
    if (!nameMatch) continue;
    const name = decodeLuaEscapes(nameMatch[1], 'utf-8').trim();

    const slotMatch = block.match(/slotCount\s*=\s*(\d+)/);
    const slots = slotMatch ? parseInt(slotMatch[1], 10) : 0;

    const descLines = [];
    const descMatch = block.match(/(?<![un])identifiedDescriptionName\s*=\s*\{([\s\S]*?)\}/);
    if (descMatch) {
      const lineRe = /"((?:[^"\\]|\\.)*)"/g;
      let lm;
      while ((lm = lineRe.exec(descMatch[1])) !== null) descLines.push(decodeLuaEscapes(lm[1], 'utf-8'));
    }
    out.set(id, { name, slots, descLines });
  }
  return out;
}
