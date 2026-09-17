---
layout: default
title: "Nodes"
lang: en
section: nodes
---

Node names in the editor may depend on your language. The names below identify their role.

## Hue Bridge configuration

Create the configuration from the Controller’s Hue Bridge selector. Discover the bridge or enter its IP, click **CONNECT**, then press the physical button on the bridge. Save and Deploy. You can reuse existing bridge credentials instead of pairing again. Several Controllers can share the same bridge.

## HUE Controller

Select the Hue Bridge and resource, enable the pins and enter topics in the command/state fields. Only functions supported by the selected resource are available.

For example: map brightness command to `living-room/brightness`. Send `msg.topic = "living-room/brightness"` and `msg.payload = 60`. Map brightness state to a separate topic to receive feedback. A sensor only needs its state topic and output pin.

One node instance represents one selected resource. Add another Controller for another device or to use one instance with Node-RED messages and another in KNX mode.

## Messages and values

On/off uses boolean `true` / `false`; brightness uses a number from 0 to 100. Color temperature uses Kelvin. State mappings publish the configured topic with the value in `msg.payload`. RAW events may also appear: filter by `msg.topic` when you only want mapped states.

## KNX mode

**You can also use this package with KNX Ultimate.** The integration is native: install `node-red-contrib-knx-ultimate` and select its gateway to enable **KNX mode**. The same mapping fields then use group addresses and DPTs, with suggestions from the imported ETS project. Commands and feedback pass directly over the bus; no intermediate Function node is needed for these mappings.

[Examples]({{ "/en/examples.html" | relative_url }})
