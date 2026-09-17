---
layout: default
title: "Ejemplos"
lang: es
section: examples
---

## Importar un ejemplo

Descarga un JSON y usa **Menú Node-RED → Importar → seleccionar archivo**. Lee el nodo Comment, selecciona tu bridge/controlador y dispositivo, configura el gateway KNX si corresponde y pulsa Deploy. Los ejemplos no incluyen credenciales ni Inject automáticos. Pulsa Inject manualmente después de configurar.

## Luz: comandos Node-RED

Enciende y regula una luz real con mensajes Node-RED. Observa sus topics de estado en Debug.

<a class="download" download href="{{ "/examples/Hue%20Light%20-%20Topic%20Commands.json" | relative_url }}">Descargar JSON</a> [JSON]({{ "/examples/Hue%20Light%20-%20Topic%20Commands.json" | relative_url }})

`examples/Hue Light - Topic Commands.json`

## Movimiento: eventos en el flow

Recibe cambios booleanos de presencia desde un sensor Hue.

<a class="download" download href="{{ "/examples/Hue%20Motion%20-%20Topic%20Events.json" | relative_url }}">Descargar JSON</a> [JSON]({{ "/examples/Hue%20Motion%20-%20Topic%20Events.json" | relative_url }})

`examples/Hue Motion - Topic Events.json`

## Luz: KNX nativo

Conecta una luz real directamente a las direcciones KNX de comando y estado. Selecciona tu gateway existente.

<a class="download" download href="{{ "/examples/Hue%20Light%20-%20Native%20KNX.json" | relative_url }}">Descargar JSON</a> [JSON]({{ "/examples/Hue%20Light%20-%20Native%20KNX.json" | relative_url }})

`examples/Hue Light - Native KNX.json`

## Más ejemplos

La carpeta examples también contiene flows por dispositivo. Lee sus nodos Comment antes de Deploy.

[Hue Button - Short and Dim Commands.json]({{ "/examples/Hue%20Button%20-%20Short%20and%20Dim%20Commands.json" | relative_url }})
