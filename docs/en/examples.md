---
layout: default
title: "Examples"
lang: en
section: examples
---

## Import an example

Download a JSON file below, then use **Node-RED menu → Import → select a file**. Read the Comment node, select your own bridge/controller and device, configure the KNX gateway when required, then Deploy. Examples contain no credentials and no automatic Injects. Click Inject manually only after setup.

## Light: Node-RED commands

Switch and dim a real light with Node-RED messages. Inspect the configured state topics in Debug.

<a class="download" download href="{{ "/examples/Hue%20Light%20-%20Topic%20Commands.json" | relative_url }}">Download JSON</a> [JSON]({{ "/examples/Hue%20Light%20-%20Topic%20Commands.json" | relative_url }})

`examples/Hue Light - Topic Commands.json`

## Motion: events in the flow

Receive boolean presence changes from a Hue motion sensor.

<a class="download" download href="{{ "/examples/Hue%20Motion%20-%20Topic%20Events.json" | relative_url }}">Download JSON</a> [JSON]({{ "/examples/Hue%20Motion%20-%20Topic%20Events.json" | relative_url }})

`examples/Hue Motion - Topic Events.json`

## Light: native KNX

Connect a real light directly to KNX command and feedback addresses. Select your existing gateway.

<a class="download" download href="{{ "/examples/Hue%20Light%20-%20Native%20KNX.json" | relative_url }}">Download JSON</a> [JSON]({{ "/examples/Hue%20Light%20-%20Native%20KNX.json" | relative_url }})

`examples/Hue Light - Native KNX.json`

## More examples

The examples folder also contains device-specific flows. Open their Comment nodes before deploying.

[Hue Button - Short and Dim Commands.json]({{ "/examples/Hue%20Button%20-%20Short%20and%20Dim%20Commands.json" | relative_url }})
