# ro-latam-data

Fonte unica de nomes pt-BR do cliente RO LATAM, consumida pela calculadora
(`rolatam-calc`) e pelo instanceiro (`instance-tracker`) via git submodule.

## Artefatos (`data/`)

- `item.json`, `{ "<nameid>": { "name", "type", "slots" } }`. `type` = `6` marca
  **carta**; `0` = qualquer outra coisa (arma, armadura, consumivel, enchant, ...).
  NAO assuma `0 == enchant`. Para distinguir carta de enchant num slot de carta,
  teste `type === 6` (carta) vs qualquer outro valor (enchant). Cobertura total dos
  itens nomeados (placeholders sem nome sao omitidos).
- `randomopt.json`, `{ "<optionId>": "<template com %d>" }`. `optionId` = ordinal
  do `enumvar` = `id` da option no pacote `0x0B39`. Frontend faz
  `template.replaceAll('%d', value).replaceAll('%%','%')`.

## Regenerar (local, precisa do cliente + Java)

Pre-requisitos: cliente RO LATAM instalado, `java` no PATH.

```bash
# opcional: se o cliente nao estiver em D:/Gravity/Ragnarok
export RO_CLIENT_DIR="/caminho/para/Ragnarok"
# opcional: usar um iteminfo_new ja descompilado em vez do System/iteminfo_new.lub
export RO_ITEMINFO_NEW="/caminho/para/iteminfo_new_decompiled.lua"

npm test          # roda os testes hermeticos dos parsers
npm run build     # gera data/item.json + data/randomopt.json
git add data && git commit -m "data: regen <data>"
git push
```

Fontes: `System/itemInfo.lua` (latin1) + overrides do `System/iteminfo_new.lub`
(descompilado pelo proprio build via `tools/unluac.jar`; sem ele o build para); item que o override novo nao
nomeia mantem a entrada do `data/item.json` anterior (o cliente as vezes esvazia o
nome de itens antigos, e o `itemInfo.lua` de 2022 traria coreano); `data.grf` para
`enumvar.lub` + `addrandomoptionnametable_ptbr.lub` (decompilados via
`tools/unluac.jar`).

## Consumidores

Ambos apontam pra este repo como submodule em `vendor/ro-latam-data`.
Atualizar: `git submodule update --remote vendor/ro-latam-data` no consumidor.

Extensivel: `data/` pode receber `monster.json` / `job-names.json` no futuro
(mesma extracao de GRF).
