---
layout: default
title: "Un Controller per ogni dispositivo Hue"
lang: it
section: index
---

Controlla luci, gruppi, prese e scene, oppure ricevi eventi da pulsanti, sensori di movimento/contatto e sensori ambientali. Scegli una risorsa Hue: il Controller mostra le funzioni disponibili.

I nodi lavorano direttamente con i messaggi Node-RED: `msg.topic` identifica la funzione e `msg.payload` contiene il valore. KNX Ultimate non è necessario.

## Installazione

Questa beta è pubblica e installabile da tutti. Installa il package da **Gestisci palette → Installa**, poi riavvia Node-RED. In alternativa, esegui il comando seguente nella cartella utente di Node-RED (di solito `~/.node-red`). Servono Node.js 20.18.1 o successivo e Node-RED 3.1.1 o successivo. Installa `node-red-contrib-knx-ultimate` solo se vuoi l’integrazione KNX.

```sh
npm install node-red-contrib-hue-ultimate
```

## Uso con i messaggi Node-RED

Abilita i pin di ingresso/uscita e inserisci i nomi dei topic nei campi di comando e stato. Lascia vuoto il gateway KNX; i campi DPT sono nascosti perché non servono. Usa topic distinti per comandi e stati. Il topic deve corrispondere esattamente: non sono supportati caratteri jolly.

## Modalità KNX

> **Puoi usare il package anche con KNX Ultimate.** L’integrazione è nativa: installa `node-red-contrib-knx-ultimate` e seleziona il suo gateway per attivare la **Modalità KNX**. Gli stessi campi di mappatura usano quindi indirizzi di gruppo e DPT, con suggerimenti dal progetto ETS importato. Comandi e stati passano direttamente sul bus; per queste mappature non servono nodi Function intermedi.

| Impostazione | Messaggi Node-RED | Modalità KNX |
| --- | --- | --- |
| Gateway KNX | Lascia vuoto | Seleziona il gateway esistente |
| Campi di mappatura | Topic esatti, es. `living-room/on` | Indirizzi di gruppo, es. `1/1/1` |
| DPT | Nascosti; non utilizzati | Seleziona il datapoint corretto |
| Comandi e stati | Tramite `msg.topic` e `msg.payload` | Attraverso il bus KNX |

Quando selezioni un gateway, sostituisci i topic salvati con indirizzi di gruppo reali e scegli i DPT corretti. Un gateway selezionato ma offline mantiene il nodo in Modalità KNX. Per tornare ai messaggi Node-RED, svuota il gateway e configura nuovamente i topic.

## Migrare i flow esistenti

Fai un backup dell’intera cartella utente di Node-RED. Mantieni **KNX Ultimate 7** installato, aggiungi il nuovo package e riavvia. Scegli **Backup e conversione**, controlla il flow e fai **Deploy** prima di aggiornare KNX Ultimate alla 8. ID, collegamenti e riferimenti alle configurazioni vengono conservati. Il JSON scaricato non contiene le credenziali protette.

Vengono convertiti sia i vecchi nodi Hue singoli sia il vecchio Controller multimodale. La funzione corretta viene conservata; viene convertita anche la configurazione Hue Bridge condivisa.
