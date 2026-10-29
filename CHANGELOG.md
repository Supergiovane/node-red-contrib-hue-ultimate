# Changelog

## 1.0.4

- Fixed lights briefly flashing at their previous brightness (e.g. 100%) before reaching the requested one: a switch-on and the brightness/color sent right after it now reach the bridge as a single Hue API v2 request. Pending commands for the same resource are merged, and a switch-on without brightness waits up to 300 ms for one to follow.

## 1.0.3

- Fixed the HUE light editor capabilities request after the package split by serving and using the standalone namespaced admin endpoint.
- Prevented incomplete or migrated nodes without both a Hue bridge and a resource from issuing a failing capabilities request or showing a fixed `Not Found` popup.
- Reworked the Controller, Hue Bridge help and public documentation in all six languages to present Node-RED topic/payload mappings as the default and KNX as an optional integration.
- Replaced inherited KNX-specific property descriptions with neutral command, state and mapping labels while preserving legacy flow field names for compatibility.
- Ensured editor notifications always expose an explicit localized close action, including migration and validation errors.
- Documented native Philips Hue API v2 input commands placed directly on `msg`, with localized examples and generated help checks.

## 1.0.2

- Fixed HUE Controller change detection so selecting a device or editing a dynamically loaded profile enables Deploy.
- Kept Cancel, Undo history and Hue/KNX configuration-node associations aligned with Node-RED's native editor lifecycle.
- Added coverage for every persisted control across all fifteen HUE Controller profiles.

## 1.0.0-beta.1

- First public beta. One HUE Controller for lights, scenes, buttons and sensors.
- Works with Node-RED messages and offers native integration with KNX Ultimate.
- Guided migration from the old KNX Ultimate nodes, plus documentation and examples in six languages.
