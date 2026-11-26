---
layout: default
title: "Ein Controller für jedes Hue-Gerät"
lang: de
section: index
---

Steuere Leuchten, Gruppen, Steckdosen und Szenen oder empfange Ereignisse von Tastern, Bewegungs-/Kontaktsensoren und Umweltsensoren. Wähle eine Hue-Ressource: Der Controller zeigt die verfügbaren Funktionen.

Die Nodes arbeiten direkt mit Node-RED-Nachrichten: `msg.topic` bezeichnet die Funktion, `msg.payload` enthält den Wert. KNX Ultimate wird dafür nicht benötigt.

## Installation

Installiere das Paket über **Palette verwalten → Installieren** und starte Node-RED neu. Alternativ kannst du den folgenden Befehl im Node-RED-Benutzerverzeichnis ausführen (normalerweise `~/.node-red`). Erforderlich sind Node.js ab 20.18.1 und Node-RED ab 3.1.1. Installiere `node-red-contrib-knx-ultimate` nur für die KNX-Integration.

```sh
npm install node-red-contrib-hue-ultimate
```

## Node-RED-Nachrichten verwenden

Aktiviere die Ein-/Ausgänge und trage Topic-Namen in die Befehls- und Statusfelder ein. Lass das KNX-Gateway leer; DPT-Felder bleiben ausgeblendet, da sie nicht benötigt werden. Verwende unterschiedliche Topics für Befehle und Status. Die Namen müssen exakt übereinstimmen; Platzhalter werden nicht unterstützt.

## Optionale KNX-Integration

> **Du kannst das Paket auch mit KNX Ultimate verwenden.** Installiere `node-red-contrib-knx-ultimate` und wähle dessen Gateway nur für eine native Gruppenadress-Zuordnung. Dieselben Felder verwenden dann Gruppenadressen und DPTs mit Vorschlägen aus dem importierten ETS-Projekt. Befehle und Status werden direkt über den Bus übertragen; zusätzliche Function-Nodes sind nicht nötig.

| Einstellung | Node-RED-Nachrichten | Optionale KNX-Integration |
| --- | --- | --- |
| KNX-Gateway | Leer lassen | Vorhandenes Gateway auswählen |
| Zuordnungsfelder | Exakte Topics, z. B. `living-room/on` | Gruppenadressen, z. B. `1/1/1` |
| DPT | Ausgeblendet; nicht verwendet | Passenden Datenpunkttyp auswählen |
| Befehle und Status | Über `msg.topic` und `msg.payload` | Über den KNX-Bus |

Ersetze beim Auswählen eines Gateways die gespeicherten Topics durch echte Gruppenadressen und wähle die passenden DPTs. Ist das ausgewählte Gateway offline, bleibt die optionale Integration aktiv. Entferne die Gateway-Auswahl und konfiguriere die Topics erneut, um wieder Node-RED-Nachrichten zu verwenden.

## Vorhandene Flows migrieren

Sichere das vollständige Node-RED-Benutzerverzeichnis. Lass **KNX Ultimate 7** installiert, füge das neue Paket hinzu und starte neu. Wähle **Back up and convert**, prüfe den Flow und führe **Deploy** aus, bevor du KNX Ultimate auf Version 8 aktualisierst. IDs, Verbindungen und Konfigurationsverweise bleiben erhalten. Der JSON-Export enthält keine geschützten Zugangsdaten.

Sowohl alte einzelne Hue-Nodes als auch der alte Multimode-Controller werden konvertiert. Die passende Funktion und die gemeinsam genutzte Bridge-Konfiguration bleiben erhalten.

## Cerebrum Ultimate

Ist **Cerebrum Ultimate** im selben Node-RED installiert, wird jede Hue-Bridge-Konfiguration automatisch und schreibgeschützt veröffentlicht: Leuchten und Leuchtengruppen jedes Raums und jeder Zone (ein/aus, Helligkeit), Bewegungs-, Temperatur-, Helligkeits-, Feuchte- und Kontaktsensoren, Batteriestände, Zigbee-Verbindung und Tastendrücke, jeweils mit Raum. Cerebrum kann sie im Chat, im Verlauf und als Auslöser von JavaScript-Routinen nutzen, und MCP-Clients wie Claude können sie über den MCP-Server von Cerebrum lesen. Es ist nichts zu konfigurieren, und über diese Verbindung kann Cerebrum nichts schalten oder ändern. Ohne Cerebrum ändert sich nichts. Siehe die [Dokumentation von Cerebrum Ultimate](https://www.maxsupervibe.com/docs/cerebrum-ultimate/).
