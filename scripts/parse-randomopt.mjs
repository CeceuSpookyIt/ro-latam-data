import { decodeLuaEscapes } from './lua-decode.mjs';

// VAR_NAME = {ordinal, x}  ->  Map(VAR_NAME -> ordinal)
export function parseEnumVar(lua) {
  const out = new Map();
  const re = /([A-Z][A-Z0-9_]*)\s*=\s*\{\s*(\d+)\s*,\s*-?\d+\s*\}/g;
  let m;
  while ((m = re.exec(lua)) !== null) out.set(m[1], parseInt(m[2], 10));
  return out;
}

// [EnumVAR.VAR_NAME[1]] = "template"  ->  Map(VAR_NAME -> template decodificado)
export function parseNameTable(lua) {
  const out = new Map();
  const re = /\[EnumVAR\.([A-Z][A-Z0-9_]*)\[1\]\]\s*=\s*"((?:[^"\\]|\\.)*)"/g;
  let m;
  while ((m = re.exec(lua)) !== null) out.set(m[1], decodeLuaEscapes(m[2], 'latin1'));
  return out;
}

export function joinRandomOpt(enumMap, nameMap) {
  const out = {};
  for (const [varName, template] of nameMap) {
    const ordinal = enumMap.get(varName);
    if (ordinal !== undefined) out[String(ordinal)] = template;
  }
  return out;
}
