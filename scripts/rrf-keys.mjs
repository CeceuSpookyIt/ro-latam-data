// Leitor MÍNIMO de .rrf (Ragnarok Replay File v5) só para tirar os pares (monster_id,
// chave de tradução) dos pacotes de ator. Porte enxuto de instance-tracker
// src/lib/replay/contexto.ts (lerPrefixo/decriptar) + stream.ts (percorrerStream) +
// pacotes/actor.ts (offsets); a paridade é a fixture test/fixtures/chaves-mini.rrf, que o
// site também confere (src/lib/monstros/__tests__/chaves-paridade.test.ts).
const BANNER = '<< Ragnarok Replay File Version';
const TABELA = 112;
const CONTAINERS = 24;
const DESCRITOR = 10;
const TIPO_PACKET_STREAM = 1;
const QUADRO = 10; // id i32 | time i32 | length u16, em claro
const JOB_EM = 23; // u16 LE no pacote completo (payload[19] + 4 de cabeçalho/tamanho)
const NOME_EM = new Map([[0x09ff, 84], [0x09fe, 83], [0x09fd, 90]]);
const CHAVE = /^\x1c([A-Za-z0-9+/=]{2,16})\x1c$/;

// word[c] ^= (k1 + c + 1) * k2, i32 com estouro, in place (decriptar do site).
function decriptar(d, k1, k2) {
  const dv = new DataView(d.buffer, d.byteOffset, d.byteLength);
  for (let c = 0; c < Math.floor(d.length / 4); c++) dv.setInt32(c * 4, dv.getInt32(c * 4, true) ^ Math.imul((k1 + c + 1) | 0, k2), true);
}

function chaves(b) {
  const dv = new DataView(b.buffer, b.byteOffset, b.byteLength);
  const ano = dv.getInt16(104, true);
  const k1 = new DataView(new Uint8Array([ano & 0xff, (ano >> 8) & 0xff, b[106], b[107]]).buffer).getInt32(0, true) >> 5;
  const k2 = new DataView(new Uint8Array([0, b[109], b[110], b[111]]).buffer).getInt32(0, true) >> 3;
  return { k1, k2 };
}

function offsetDoStream(b) {
  const dv = new DataView(b.buffer, b.byteOffset, b.byteLength);
  for (let i = 0; i < CONTAINERS; i++) {
    const d = TABELA + i * DESCRITOR;
    if (dv.getUint16(d, true) !== TIPO_PACKET_STREAM) continue;
    const off = dv.getInt32(d + 6, true);
    return off > 0 && off <= b.length ? off : null;
  }
  return null;
}

export function keysFromRrf(b) {
  if (b.length < TABELA + CONTAINERS * DESCRITOR) return [];
  for (let i = 0; i < BANNER.length; i++) if (b[i] !== BANNER.charCodeAt(i)) return [];
  if (b[100] !== 5) return [];
  const base = offsetDoStream(b);
  if (base === null) return [];
  const { k1, k2 } = chaves(b);
  const dv = new DataView(b.buffer, b.byteOffset, b.byteLength);
  const pares = [];
  let p = base;
  while (p + QUADRO <= b.length) {
    const tam = dv.getUint16(p + 8, true);
    const fim = p + QUADRO + tam;
    if (fim > b.length) break; // chunk truncado: para em silêncio, como o site
    if (tam >= 2) {
      const pk = b.slice(p + QUADRO, fim);
      decriptar(pk, k1, k2);
      const cab = pk[0] | (pk[1] << 8);
      const nomeEm = NOME_EM.get(cab);
      if (nomeEm !== undefined && pk.length > nomeEm) {
        const job = pk[JOB_EM] | (pk[JOB_EM + 1] << 8);
        if (job >= 1000) {
          let e = nomeEm;
          while (e < pk.length && pk[e] !== 0) e++;
          const m = CHAVE.exec(Buffer.from(pk.subarray(nomeEm, e)).toString('latin1'));
          if (m) pares.push({ monster_id: job, key: m[1] });
        }
      }
    }
    p = fim;
  }
  return pares;
}

// Um id entra na semente só se TODAS as suas aparições com chave CONHECIDA (presente em
// monster-names.json) tiverem a mesma chave. Chave de fora da tabela (mob de script, ex.
// 52Z2Bw) não conta nem contra nem a favor.
export function buildSeed(pares, names) {
  const porId = new Map();
  for (const { monster_id, key } of pares) {
    if (!names[key]) continue;
    if (!porId.has(monster_id)) porId.set(monster_id, new Set());
    porId.get(monster_id).add(key);
  }
  const seed = {};
  const ambiguous = [];
  for (const id of [...porId.keys()].sort((a, b) => a - b)) {
    const ks = [...porId.get(id)].sort();
    if (ks.length === 1) seed[id] = ks[0];
    else ambiguous.push({ monster_id: id, keys: ks });
  }
  return { seed, ambiguous };
}
