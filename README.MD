# Importa Disciplinas - UNIVEM

Cadastra disciplinas e grade currícular de um arquivo **.xlsx**.

## Arquivos

Os arquivos devem estar na pasta **public/files** para serem importados.

## Importar disciplinas para uma grade existente

```sh
yarn grade:import file.xlsx
```

Parâmetro **--ead** opcional (insere as disciplinas na grade como EAD).

```sh
yarn grade:import file.xlsx --ead
```

## Cria grade e importa as disciplinas

```sh
yarn grade:create-import file.xlsx
```

Parâmetro **--ead** opcional (insere as disciplinas na grade como EAD).

```sh
yarn grade:create-import file.xlsx --ead
```

## Formato do arquivo

Exemplo do formato do arquivo disponível na pasta **public/files**.
