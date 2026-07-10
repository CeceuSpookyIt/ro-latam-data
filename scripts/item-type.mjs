const stripColors = (s) => s.replace(/\^[0-9a-fA-F]{6}/g, '');

// v1: so distingue carta (type 6). Demais -> 0.
export function deriveType(descLines) {
  for (const raw of descLines) {
    const line = stripColors(raw).trim();
    const m = line.match(/^Tipo:\s*(.+)$/i);
    if (m && m[1].trim().toLowerCase() === 'carta') return 6;
  }
  return 0;
}
