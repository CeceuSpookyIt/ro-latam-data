// O cliente novo as vezes esvazia o nome de itens antigos (visuais aposentados, por
// exemplo). Sem o nome do override, o item cairia no itemInfo.lua de 2022 (coreano ou
// ausente). Para nao perder o nome pt-BR que ja tinhamos, quem nao veio do override
// novo mantem a entrada do item.json anterior.
export function keepPrevious(built, previous, overrideIds) {
  const out = { ...built };
  let kept = 0;
  for (const [id, entry] of Object.entries(previous)) {
    if (overrideIds.has(Number(id))) continue;
    if (out[id]?.name === entry.name) continue;
    out[id] = entry;
    kept++;
  }
  return { result: out, kept };
}
