---
layout: default
title: "Exemples"
lang: fr
section: examples
---

## Importer un exemple

Téléchargez un JSON ci-dessous, puis utilisez **Menu Node-RED → Importer → sélectionner un fichier**. Lisez le nœud Comment, sélectionnez votre bridge/contrôleur et votre appareil, configurez la passerelle KNX si nécessaire, puis faites Deploy. Les exemples ne contiennent ni identifiants ni Inject automatique. Déclenchez les Inject manuellement après la configuration.

## Lumière : commandes Node-RED

Allumez et réglez une lumière avec les messages Node-RED. Observez ses topics d’état dans Debug.

<a class="download" download href="{{ "/examples/Hue%20Light%20-%20Topic%20Commands.json" | relative_url }}">Télécharger le JSON</a> [JSON]({{ "/examples/Hue%20Light%20-%20Topic%20Commands.json" | relative_url }})

`examples/Hue Light - Topic Commands.json`

## Mouvement : événements dans le flow

Recevez les changements de présence booléens d’un capteur Hue.

<a class="download" download href="{{ "/examples/Hue%20Motion%20-%20Topic%20Events.json" | relative_url }}">Télécharger le JSON</a> [JSON]({{ "/examples/Hue%20Motion%20-%20Topic%20Events.json" | relative_url }})

`examples/Hue Motion - Topic Events.json`

## Lumière : KNX natif

Reliez une lumière réelle aux adresses KNX de commande et retour. Choisissez votre passerelle existante.

<a class="download" download href="{{ "/examples/Hue%20Light%20-%20Native%20KNX.json" | relative_url }}">Télécharger le JSON</a> [JSON]({{ "/examples/Hue%20Light%20-%20Native%20KNX.json" | relative_url }})

`examples/Hue Light - Native KNX.json`

## Autres exemples

Le dossier examples contient aussi des flows par appareil. Lisez leurs nœuds Comment avant le Deploy.

[Hue Button - Short and Dim Commands.json]({{ "/examples/Hue%20Button%20-%20Short%20and%20Dim%20Commands.json" | relative_url }})
