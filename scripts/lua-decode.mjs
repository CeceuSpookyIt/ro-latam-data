// Resolve escapes de string Lua e reencoda os bytes na codificacao dada.
// latin1 = escapes \ddd de byte unico (lubs ptbr decompilados).
// utf-8  = escapes \ddd multibyte (iteminfo_new_decompiled.lua).
export function decodeLuaEscapes(s, enc) {
  const bytes = [];
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '\\' && i + 1 < s.length) {
      const next = s[i + 1];
      if (next >= '0' && next <= '9') {
        let numStr = next;
        if (i + 2 < s.length && s[i + 2] >= '0' && s[i + 2] <= '9') {
          numStr += s[i + 2];
          if (i + 3 < s.length && s[i + 3] >= '0' && s[i + 3] <= '9') {
            numStr += s[i + 3];
          }
        }
        bytes.push(parseInt(numStr, 10) & 0xff);
        i += numStr.length;
      } else if (next === 'n') { bytes.push(10); i++; }
      else if (next === 't') { bytes.push(9); i++; }
      else if (next === 'r') { bytes.push(13); i++; }
      else if (next === '\\') { bytes.push(92); i++; }
      else if (next === '"') { bytes.push(34); i++; }
      else { bytes.push(s.charCodeAt(i)); }
    } else {
      // char comum: pode ser latin1 ja decodificado (>127) — emite o byte cru
      const c = s.charCodeAt(i);
      if (c <= 0xff) bytes.push(c);
      else { // char multibyte ja em JS string — reencoda em utf-8
        for (const b of Buffer.from(s[i], 'utf-8')) bytes.push(b);
      }
    }
  }
  return Buffer.from(bytes).toString(enc);
}
