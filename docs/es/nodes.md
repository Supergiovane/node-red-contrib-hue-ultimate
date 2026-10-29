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

Cada instancia representa un recurso seleccionado. Añade otro Controller para otro dispositivo o para usar una instancia con mensajes Node-RED y otra con la integración KNX opcional.

## HUE Health

Vigila todos los dispositivos del Hue Bridge seleccionado y envía un mensaje por cada aviso de dispositivo: batería baja, problema de conectividad Zigbee o actualización de software. `msg.payload` es un texto con el nombre, la habitación y el aviso del dispositivo separados por comas (más el nivel de batería en % para batería baja); `msg.warning` es el tipo de aviso; también se establecen `msg.deviceName`, `msg.deviceRoom` y `msg.lastUpdate`. Envía al iniciar, cuando un aviso aparece o empeora, y a petición a través de su entrada.

## Mensajes y valores

On/Off usa `true` / `false`, el brillo un número de 0 a 100 y la temperatura de color Kelvin. Los estados usan el topic configurado y `msg.payload`. También pueden aparecer eventos RAW: filtra por `msg.topic` para recibir solo los estados asignados.

## Integración KNX opcional

**También puedes usar este paquete con KNX Ultimate.** Instala `node-red-contrib-knx-ultimate` y selecciona su gateway solo cuando quieras el mapeo nativo de direcciones de grupo. Los mismos campos usan entonces direcciones de grupo y DPT, con sugerencias del proyecto ETS importado. Comandos y estados pasan directamente por el bus; no hacen falta nodos Function intermedios.

[Ejemplos]({{ "/es/examples.html" | relative_url }})
