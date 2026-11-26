---
layout: default
title: "Un Controller para cada dispositivo Hue"
lang: es
section: index
---

Controla luces, grupos, enchufes y escenas, o recibe eventos de botones y sensores de movimiento, contacto y ambiente. Selecciona un recurso Hue para ver sus funciones.

Los nodos funcionan directamente con mensajes Node-RED: `msg.topic` identifica la función y `msg.payload` contiene su valor. KNX Ultimate no es necesario.

## Instalación

Instala el paquete desde **Gestionar paleta → Instalar** y reinicia Node-RED. También puedes ejecutar el siguiente comando en la carpeta de usuario de Node-RED (normalmente `~/.node-red`). Requiere Node.js 20.18.1 o posterior y Node-RED 3.1.1 o posterior. Instala `node-red-contrib-knx-ultimate` solo si necesitas la integración KNX.

```sh
npm install node-red-contrib-hue-ultimate
```

## Uso con mensajes Node-RED

Activa los pines de entrada/salida e introduce nombres de topics en los campos de comando y estado. Deja vacío el gateway KNX; los campos DPT se ocultan porque no son necesarios. Usa topics distintos para comandos y estados. La coincidencia debe ser exacta; no se admiten comodines.

## Integración KNX opcional

> **También puedes usar este paquete con KNX Ultimate.** Instala `node-red-contrib-knx-ultimate` y selecciona su gateway solo cuando quieras el mapeo nativo de direcciones de grupo. Los mismos campos usan entonces direcciones de grupo y DPT, con sugerencias del proyecto ETS importado. Comandos y estados pasan directamente por el bus; no hacen falta nodos Function intermedios.

| Ajuste | Mensajes Node-RED | Integración KNX opcional |
| --- | --- | --- |
| Gateway KNX | Déjalo vacío | Selecciona el gateway existente |
| Campos de asignación | Topics exactos, p. ej. `living-room/on` | Direcciones de grupo, p. ej. `1/1/1` |
| DPT | Ocultos; no se utilizan | Selecciona el tipo de dato correcto |
| Comandos y estados | Mediante `msg.topic` y `msg.payload` | Por el bus KNX |

Al seleccionar un gateway, sustituye los topics guardados por direcciones de grupo reales y elige los DPT correctos. Si el gateway seleccionado está desconectado, la integración opcional permanece activa. Para volver a los mensajes Node-RED, quita la selección del gateway y configura de nuevo los topics.

## Migrar flows existentes

Haz una copia de toda la carpeta de usuario de Node-RED. Mantén **KNX Ultimate 7**, añade el paquete nuevo y reinicia. Elige **Back up and convert**, revisa el flow y pulsa **Deploy** antes de actualizar KNX Ultimate a la versión 8. Se conservan identificadores, conexiones y referencias de configuración. El JSON descargado no contiene credenciales protegidas.

Se convierten tanto los antiguos nodos Hue individuales como el Controller multimodal. Se conserva la función correspondiente y se convierte la configuración compartida Hue Bridge.

## Cerebrum Ultimate

Si **Cerebrum Ultimate** está instalado en el mismo Node-RED, cada configuración de Hue Bridge se le publica automáticamente, en solo lectura: luces y grupos de luces de cada habitación y zona (encendido/apagado, brillo), sensores de movimiento, temperatura, iluminancia, humedad y contacto, niveles de batería, conectividad Zigbee y pulsaciones de botones, con su habitación. Cerebrum puede usarlos en el chat, en su historial y como disparadores de rutinas JavaScript, y los clientes MCP como Claude pueden leerlos a través del servidor MCP de Cerebrum. No hay nada que configurar y, a través de esta conexión, Cerebrum no puede accionar ni cambiar nada. Sin Cerebrum no cambia nada. Consulte la [documentación de Cerebrum Ultimate](https://www.maxsupervibe.com/docs/cerebrum-ultimate/).
