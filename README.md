# art-lastejobb

Produserer datafil med "all" kunnskap om arter.

## Komponenter og dataflyt

### Dataflyt

[![Dataflyt](./doc/dataflyt.png)](https://artsdatabanken.github.io/art-lastejobb/)

### Tegnforklaring

| Symbol                                                                                                   | Forklaring               |
| -------------------------------------------------------------------------------------------------------- | ------------------------ |
| ![Dataflyt](https://github.com/Artsdatabanken/nin-arkitektur-dokumentasjon/raw/master/image/api_24.png)  | API (HTTP REST)          |
| ![Dataflyt](https://github.com/Artsdatabanken/nin-arkitektur-dokumentasjon/raw/master/image/data_24.png) | Åpne data                |
| ![Dataflyt](https://github.com/Artsdatabanken/nin-arkitektur-dokumentasjon/raw/master/image/kart_24.png) | Kart                     |
| ![Dataflyt](https://github.com/Artsdatabanken/nin-arkitektur-dokumentasjon/raw/master/image/last_24.png) | Lastejobb / Konvertering |
| ![Dataflyt](https://github.com/Artsdatabanken/nin-arkitektur-dokumentasjon/raw/master/image/lib_24.png)  | Bibliotek                |
| ![Dataflyt](https://github.com/Artsdatabanken/nin-arkitektur-dokumentasjon/raw/master/image/tool_24.png) | Verktøy                  |
| ![Dataflyt](https://github.com/Artsdatabanken/nin-arkitektur-dokumentasjon/raw/master/image/www_24.png)  | Web-side/applikasjon     |

## Kataloger

- `stages/download`: Script for å laste ned eksterne datafiler til `data/`
- `stages/transform`: Script som produserer resultatet og legger det i `build/`
- `build`: Filene som kommer ut av lastejobben
- `data`: Temporær lagring av nedlastede data og mellomformater

## Bruk

### Installere

```bash
npm run install
```

Laster ned avhengige biblioteker til `node_modules`.

### Download

```bash
npm run download
```

Laster ned eksterne avhengigheter som lastejobben er avhengig av for å produsere sitt resultat i "transform". Denne kjører stegene som ligger i `stages/download`. Nedlastede data lagres som en konvensjon i katalog `data`.

### Transform

```bash
npm run transform
```

Bruker allerede nedlastede data til å produsere sitt resultat. Denne brukes gjerne mens man utvikler så man slipper å laste ned data hver gang, og kan også brukes uten at man har tilgang til nett sålenge man har gjort `download` først. Denne kjører stegene som ligger i `stages/transform`

Sluttproduktet av transform skrives som en konvensjon til katalogen `build`.

### Build

```bash
npm run build
```

Kjører hele lastejobben, først `download`, så `transform`.

### Deploy

```bash
npm run deploy
```

Tar filene fra `build`-katalogen som er produsert i `build` eller `transform` og publiserer disse offentlig slik at andre lastejobber eller konsumenter kan nå dem uten å kjøre lastejobben.
