import { openSync, readSync, closeSync, writeFileSync, mkdirSync } from 'fs';
import { inflateSync } from 'zlib';
import { join } from 'path';

const HEADER_SIZE = 46;
const GRF_PATH = process.env.RO_GRF || `${process.env.RO_CLIENT_DIR || 'D:/Gravity/Ragnarok'}/data.grf`;

function readBytes(fd, offset, length) {
  const buf = Buffer.alloc(length);
  readSync(fd, buf, 0, length, offset);
  return buf;
}
function parseHeader(fd) {
  const buf = readBytes(fd, 0, HEADER_SIZE);
  return {
    ftAbsOffset: buf.readUInt32LE(30) + HEADER_SIZE,
    fileCount: buf.readUInt32LE(38) - buf.readUInt32LE(34) - 7,
  };
}
function parseFileTable(fd, header) {
  const ftHeader = readBytes(fd, header.ftAbsOffset, 12);
  const compressedSize = ftHeader.readUInt32LE(8);
  const compressed = readBytes(fd, header.ftAbsOffset + 12, compressedSize);
  const d = inflateSync(compressed);
  const entries = [];
  let pos = 0;
  for (let i = 0; i < header.fileCount; i++) {
    const nameEnd = d.indexOf(0, pos);
    if (nameEnd < 0) break;
    const filename = d.toString('latin1', pos, nameEnd);
    pos = nameEnd + 1;
    entries.push({
      filename,
      compSizePadded: d.readUInt32LE(pos + 4),
      flags: d.readUInt8(pos + 12),
      dataOffset: d.readUInt32LE(pos + 13),
    });
    pos += 17;
  }
  return entries;
}
export function extractFromGrf(patterns, outDir) {
  const fd = openSync(GRF_PATH, 'r');
  try {
    const header = parseHeader(fd);
    const entries = parseFileTable(fd, header);
    const lower = patterns.map((p) => p.toLowerCase());
    const matches = entries.filter((e) => lower.some((p) => e.filename.toLowerCase().includes(p)));
    mkdirSync(outDir, { recursive: true });
    const written = [];
    for (const e of matches) {
      if (!(e.flags & 0x01) || (e.flags & 0x06)) continue; // dir ou encriptado
      const raw = readBytes(fd, e.dataOffset + HEADER_SIZE, e.compSizePadded);
      let data;
      try { data = inflateSync(raw); } catch { data = raw; }
      const out = join(outDir, e.filename.replace(/\\/g, '/').split('/').pop());
      writeFileSync(out, data);
      written.push(out);
    }
    return written;
  } finally {
    closeSync(fd);
  }
}

if (import.meta.url === `file://${process.argv[1]}`.replace(/\\/g, '/')) {
  const written = extractFromGrf(process.argv.slice(3), process.argv[2] || 'tmp/grf');
  console.log(written.join('\n'));
}
