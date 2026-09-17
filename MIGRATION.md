# Moving existing flows to HUE Ultimate

1. Leave **KNX Ultimate 7** installed and install this package alongside it. Restart Node-RED and reload the editor.
2. The editor detects legacy nodes, including configuration nodes and nodes inside subflow templates, and offers conversion.
3. Choose **Later** to leave everything unchanged, or **Back up and convert**. A flow JSON download is initiated before any change. Allow downloads and retain the file.
4. Review the converted flow. IDs, wiring, layout, settings, gateway selections and shared configuration references are preserved. Use Undo to revert the whole conversion before deployment if needed.
5. Press **Deploy** yourself when ready. Conversion never deploys automatically. Test the converted devices before upgrading KNX Ultimate to 8.

The backup follows Node-RED export rules and excludes protected credentials. It does not replace a backup of the Node-RED user directory. During in-place conversion, configuration IDs and credential schemas are kept, so the runtime retains existing credentials. Importing the JSON into a different installation can require credentials to be entered again.

Locked flows or unavailable target types block conversion before changes. The migration can also be reopened through the Node-RED action `hueUltimate:migrate-legacy-nodes` (action list / command palette). It is offered again after an editor reload while legacy nodes remain.

All fifteen dedicated HUE node types become the multimode HUE Controller with the corresponding profile and pin layout. Existing unified HUE Controllers and shared bridge configurations are also converted. HUE bridge IDs and credential field names remain unchanged.

The same conversion is available from the migration button in HUE Controller. It includes all flows and subflow templates, even if the only remaining legacy items are an old multimode Controller or a bridge configuration. Existing Controllers keep their selected function; dedicated nodes become the corresponding light, plug, button, sensor or scene function. Group addresses, DPTs and input/output connections are retained.

The standalone package installs only HUE Controller and its bridge configuration. Legacy node implementations stay in KNX Ultimate 7; HUE Ultimate uses its own internal Controller profiles and does not need the old implementations after conversion.

## Type mapping

| Legacy type | Standalone type |
| --- | --- |
| `hue-config` | `hue-ultimate-config` |
| `knxUltimateHueController` | `hueUltimateController` |
| `knxUltimateHueLight` | `hueUltimateController` |
| `knxUltimateHuePlug` | `hueUltimateController` |
| `knxUltimateHueButton` | `hueUltimateController` |
| `knxUltimateHueTapDial` | `hueUltimateController` |
| `knxUltimateHueMotion` | `hueUltimateController` |
| `knxUltimateHueAreaMotion` | `hueUltimateController` |
| `knxUltimateHueCameraMotion` | `hueUltimateController` |
| `knxUltimateHueContactSensor` | `hueUltimateController` |
| `knxUltimateHueLightSensor` | `hueUltimateController` |
| `knxUltimateHueTemperatureSensor` | `hueUltimateController` |
| `knxUltimateHueHumiditySensor` | `hueUltimateController` |
| `knxUltimateHueScene` | `hueUltimateController` |
| `knxUltimateHueBattery` | `hueUltimateController` |
| `knxUltimateHueZigbeeConnectivity` | `hueUltimateController` |
| `knxUltimateHuedevice_software_update` | `hueUltimateController` |
