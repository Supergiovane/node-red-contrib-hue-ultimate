---
layout: default
title: "Beispiele"
lang: de
section: examples
---

## Beispiel importieren

Lade eine JSON-Datei herunter und wähle **Node-RED-Menü → Importieren → Datei auswählen**. Lies den Comment-Node, wähle deine Bridge bzw. deinen Controller und das Gerät, konfiguriere bei Bedarf das KNX-Gateway und führe Deploy aus. Die Beispiele enthalten keine Zugangsdaten und keine automatischen Injects. Löse Inject erst nach der Einrichtung manuell aus.

## Leuchte: Node-RED-Befehle

Schalte und dimme eine reale Leuchte mit Node-RED-Nachrichten. Prüfe ihre Status-Topics im Debug-Fenster.

<a class="download" download href="{{ "/examples/Hue%20Light%20-%20Topic%20Commands.json" | relative_url }}">JSON herunterladen</a> [JSON]({{ "/examples/Hue%20Light%20-%20Topic%20Commands.json" | relative_url }})

`examples/Hue Light - Topic Commands.json`

## Bewegung: Ereignisse im Flow

Empfange boolesche Präsenzmeldungen eines Hue-Bewegungssensors.

<a class="download" download href="{{ "/examples/Hue%20Motion%20-%20Topic%20Events.json" | relative_url }}">JSON herunterladen</a> [JSON]({{ "/examples/Hue%20Motion%20-%20Topic%20Events.json" | relative_url }})

`examples/Hue Motion - Topic Events.json`

## Leuchte: natives KNX

Verbinde eine reale Leuchte direkt mit KNX-Befehls- und Statusadressen. Wähle dein bestehendes Gateway.

<a class="download" download href="{{ "/examples/Hue%20Light%20-%20Native%20KNX.json" | relative_url }}">JSON herunterladen</a> [JSON]({{ "/examples/Hue%20Light%20-%20Native%20KNX.json" | relative_url }})

`examples/Hue Light - Native KNX.json`

## Weitere Beispiele

Der examples-Ordner enthält weitere gerätespezifische Flows. Lies die Comment-Nodes vor dem Deploy.

[Hue Button - Short and Dim Commands.json]({{ "/examples/Hue%20Button%20-%20Short%20and%20Dim%20Commands.json" | relative_url }})
