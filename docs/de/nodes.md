---
layout: default
title: "Nodes"
lang: de
section: nodes
---

Die Namen im Editor können je nach Sprache abweichen. Hier wird die Aufgabe jedes Nodes beschrieben.

## Hue-Bridge-Konfiguration

Erstelle die Konfiguration im Hue-Bridge-Auswahlfeld des Controllers. Suche die Bridge oder gib ihre IP ein, klicke **CONNECT** und drücke die Taste auf der Bridge. Speichere und führe Deploy aus. Vorhandene Zugangsdaten können wiederverwendet werden. Mehrere Controller können dieselbe Bridge nutzen.

## HUE Controller

Wähle die Hue Bridge und die Ressource, aktiviere die Ports und trage Topics in die Befehls- und Statusfelder ein. Es werden nur die von der Ressource unterstützten Funktionen angezeigt.

Beispiel: Ordne dem Helligkeitsbefehl `living-room/brightness` zu. Sende `msg.topic = "living-room/brightness"` und `msg.payload = 60`. Nutze für den Helligkeitsstatus ein eigenes Topic. Ein Sensor braucht nur das Status-Topic und den Ausgang.

Jede Instanz steht für eine ausgewählte Ressource. Nutze einen weiteren Controller für ein anderes Gerät oder um eine Instanz mit Node-RED-Nachrichten und eine andere im KNX-Modus zu betreiben.

## Nachrichten und Werte

Ein/Aus verwendet `true` / `false`, Helligkeit eine Zahl von 0 bis 100 und Farbtemperatur Kelvin. Statusmeldungen enthalten das konfigurierte Topic und den Wert in `msg.payload`. Es können zusätzlich RAW-Ereignisse erscheinen; filtere nach `msg.topic`, wenn du nur zugeordnete Statusmeldungen brauchst.

## KNX-Modus

**Du kannst das Paket auch mit KNX Ultimate verwenden.** Die Integration ist nativ: Installiere `node-red-contrib-knx-ultimate` und wähle dessen Gateway, um den **KNX-Modus** zu aktivieren. Dieselben Zuordnungsfelder verwenden dann Gruppenadressen und DPTs mit Vorschlägen aus dem importierten ETS-Projekt. Befehle und Status werden direkt über den Bus übertragen; dafür sind keine zusätzlichen Function-Nodes nötig.

[Beispiele]({{ "/de/examples.html" | relative_url }})
