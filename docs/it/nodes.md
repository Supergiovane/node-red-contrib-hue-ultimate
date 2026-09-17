---
layout: default
title: "Nodi"
lang: it
section: nodes
---

I nomi nell’editor possono cambiare secondo la lingua. Qui descriviamo il ruolo di ciascun nodo.

## Configurazione Hue Bridge

Crea la configurazione dal selettore Hue Bridge del Controller. Cerca il bridge o inserisci il suo IP, premi **CONNECT**, poi il pulsante fisico sul bridge. Salva e fai Deploy. Puoi riutilizzare credenziali esistenti invece di ripetere l’abbinamento. Più Controller possono condividere lo stesso bridge.

## HUE Controller

Seleziona il bridge Hue e la risorsa, abilita i pin e inserisci i topic nei campi di comando e stato. Sono disponibili solo le funzioni supportate dalla risorsa scelta.

Per esempio: assegna `living-room/brightness` al comando luminosità. Invia `msg.topic = "living-room/brightness"` e `msg.payload = 60`. Assegna un topic distinto allo stato luminosità per ricevere il feedback. Un sensore richiede soltanto il topic di stato e il pin di uscita.

Ogni istanza rappresenta una risorsa selezionata. Aggiungi un altro Controller per un altro dispositivo o per usare un’istanza con i messaggi Node-RED e un’altra in Modalità KNX.

## Messaggi e valori

Per On/Off usa i booleani `true` / `false`; per la luminosità un numero da 0 a 100. La temperatura colore usa Kelvin. Le mappature di stato pubblicano il topic configurato e il valore in `msg.payload`. Possono comparire anche eventi RAW: filtra per `msg.topic` per ricevere soltanto gli stati mappati.

## Modalità KNX

**Puoi usare il package anche con KNX Ultimate.** L’integrazione è nativa: installa `node-red-contrib-knx-ultimate` e seleziona il suo gateway per attivare la **Modalità KNX**. Gli stessi campi di mappatura usano quindi indirizzi di gruppo e DPT, con suggerimenti dal progetto ETS importato. Comandi e stati passano direttamente sul bus; per queste mappature non servono nodi Function intermedi.

[Esempi]({{ "/it/examples.html" | relative_url }})
