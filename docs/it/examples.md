---
layout: default
title: "Esempi"
lang: it
section: examples
---

## Importare un esempio

Scarica un JSON qui sotto, poi usa **Menu Node-RED → Importa → seleziona un file**. Leggi il nodo Comment, seleziona il tuo bridge/controller e il dispositivo, imposta il gateway KNX quando richiesto e fai Deploy. Gli esempi non contengono credenziali né Inject automatici. Premi Inject manualmente solo dopo la configurazione.

## Luce: comandi Node-RED

Accendi e regola una luce reale con i messaggi Node-RED. Guarda in Debug i topic di stato configurati.

<a class="download" download href="{{ "/examples/Hue%20Light%20-%20Topic%20Commands.json" | relative_url }}">Scarica JSON</a> [JSON]({{ "/examples/Hue%20Light%20-%20Topic%20Commands.json" | relative_url }})

`examples/Hue Light - Topic Commands.json`

## Movimento: eventi nel flow

Ricevi i cambiamenti di presenza booleani da un sensore di movimento Hue.

<a class="download" download href="{{ "/examples/Hue%20Motion%20-%20Topic%20Events.json" | relative_url }}">Scarica JSON</a> [JSON]({{ "/examples/Hue%20Motion%20-%20Topic%20Events.json" | relative_url }})

`examples/Hue Motion - Topic Events.json`

## Luce: KNX nativo

Collega una luce reale direttamente agli indirizzi KNX di comando e feedback. Seleziona il gateway esistente.

<a class="download" download href="{{ "/examples/Hue%20Light%20-%20Native%20KNX.json" | relative_url }}">Scarica JSON</a> [JSON]({{ "/examples/Hue%20Light%20-%20Native%20KNX.json" | relative_url }})

`examples/Hue Light - Native KNX.json`

## Altri esempi

La cartella examples contiene anche flow specifici per dispositivo. Leggi i nodi Comment prima del Deploy.

[Hue Button - Short and Dim Commands.json]({{ "/examples/Hue%20Button%20-%20Short%20and%20Dim%20Commands.json" | relative_url }})
