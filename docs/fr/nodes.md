---
layout: default
title: "Nœuds"
lang: fr
section: nodes
---

Les noms dans l’éditeur peuvent varier selon la langue. Voici le rôle de chaque nœud.

## Configuration Hue Bridge

Créez la configuration depuis le sélecteur Hue Bridge du Controller. Recherchez le bridge ou saisissez son IP, cliquez sur **CONNECT**, puis appuyez sur le bouton physique du bridge. Enregistrez et faites Deploy. Vous pouvez réutiliser les identifiants existants. Plusieurs Controllers peuvent partager le même bridge.

## HUE Controller

Sélectionnez le Hue Bridge et la ressource, activez les ports et saisissez les topics dans les champs de commande et d’état. Seules les fonctions prises en charge par la ressource sont proposées.

Exemple : associez `living-room/brightness` à la commande de luminosité. Envoyez `msg.topic = "living-room/brightness"` et `msg.payload = 60`. Utilisez un autre topic pour le retour de luminosité. Un capteur utilise simplement son topic d’état et son port de sortie.

Chaque instance représente une ressource sélectionnée. Ajoutez un autre Controller pour un autre appareil ou pour utiliser une instance avec les messages Node-RED et une autre en Mode KNX.

## Messages et valeurs

On/Off utilise `true` / `false`, la luminosité un nombre de 0 à 100 et la température de couleur des Kelvin. Les états utilisent le topic configuré et `msg.payload`. Des événements RAW peuvent aussi apparaître : filtrez sur `msg.topic` pour ne garder que les états mappés.

## Mode KNX

**Vous pouvez aussi utiliser ce package avec KNX Ultimate.** L’intégration est native : installez `node-red-contrib-knx-ultimate` et sélectionnez sa passerelle pour activer le **Mode KNX**. Les mêmes champs utilisent alors des adresses de groupe et des DPT, avec des suggestions du projet ETS importé. Commandes et états passent directement par le bus ; aucun nœud Function intermédiaire n’est nécessaire pour ces correspondances.

[Exemples]({{ "/fr/examples.html" | relative_url }})
