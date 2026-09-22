# Changelog

## 1.0.3

- Fixed the HUE light editor capabilities request after the package split by serving and using the standalone namespaced admin endpoint.
- Prevented incomplete or migrated nodes without both a Hue bridge and a resource from issuing a failing capabilities request or showing a fixed `Not Found` popup.

## 1.0.2

- Fixed HUE Controller change detection so selecting a device or editing a dynamically loaded profile enables Deploy.
- Kept Cancel, Undo history and Hue/KNX configuration-node associations aligned with Node-RED's native editor lifecycle.
- Added coverage for every persisted control across all fifteen HUE Controller profiles.

## 1.0.0-beta.1

- First public beta. One HUE Controller for lights, scenes, buttons and sensors.
- Works with Node-RED messages and offers native integration with KNX Ultimate.
- Guided migration from the old KNX Ultimate nodes, plus documentation and examples in six languages.
