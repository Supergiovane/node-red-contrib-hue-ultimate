---
layout: default
title: "Nodos"
lang: es
section: nodes
---

Los nombres del editor pueden variar según el idioma. Aquí se explica la función de cada nodo.

## Configuración Hue Bridge

Crea la configuración desde el selector Hue Bridge del Controller. Busca el bridge o introduce su IP, pulsa **CONNECT** y después el botón físico del bridge. Guarda y pulsa Deploy. Puedes reutilizar las credenciales existentes. Varios Controllers pueden compartir el mismo bridge.

## HUE Controller

Selecciona el Hue Bridge y el recurso, activa los pines e introduce topics en los campos de comando y estado. Solo se muestran las funciones compatibles con el recurso.

Ejemplo: asigna `living-room/brightness` al comando de brillo. Envía `msg.topic = "living-room/brightness"` y `msg.payload = 60`. Usa otro topic para el estado de brillo. Un sensor solo necesita su topic de estado y el pin de salida.

Cada instancia representa un recurso seleccionado. Añade otro Controller para otro dispositivo o para usar una instancia con mensajes Node-RED y otra en Modo KNX.

## Mensajes y valores

On/Off usa `true` / `false`, el brillo un número de 0 a 100 y la temperatura de color Kelvin. Los estados usan el topic configurado y `msg.payload`. También pueden aparecer eventos RAW: filtra por `msg.topic` para recibir solo los estados asignados.

## Modo KNX

**También puedes usar este paquete con KNX Ultimate.** La integración es nativa: instala `node-red-contrib-knx-ultimate` y selecciona su gateway para activar el **Modo KNX**. Los mismos campos usan entonces direcciones de grupo y DPT, con sugerencias del proyecto ETS importado. Comandos y estados pasan directamente por el bus; no hacen falta nodos Function intermedios para estas asignaciones.

[Ejemplos]({{ "/es/examples.html" | relative_url }})
