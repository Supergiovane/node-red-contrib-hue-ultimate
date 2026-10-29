'use strict'

const { HueHealthMonitor, DEFAULT_BATTERY_THRESHOLD } = require('./utils/hueHealthMonitor')

// Monitor category -> msg.warning
const WARNING_TYPES = Object.freeze({
  battery: 'battery',
  connectivity: 'zigbee_connectivity',
  softwareUpdate: 'software_update'
})

module.exports = function (RED) {
  // Watches every device of one Hue Bridge and sends one message per device warning:
  // low battery, lost Zigbee connectivity or a pending software update.
  function hueUltimateHealth (config) {
    RED.nodes.createNode(this, config)
    const node = this
    node.serverHue = RED.nodes.getNode(config.serverHue) || undefined
    node.name = config.name || ''
    node.topic = config.name || 'hue-health'
    node.monitor = new HueHealthMonitor({
      batteryThreshold: config.batteryThreshold === undefined || config.batteryThreshold === '' ? DEFAULT_BATTERY_THRESHOLD : config.batteryThreshold,
      battery: config.monitorBattery !== false,
      connectivity: config.monitorConnectivity !== false,
      softwareUpdate: config.monitorSoftwareUpdate !== false
    })
    let hasSentStartup = false

    const formatTs = (date) => `${date.getDate()}, ${date.toLocaleTimeString()}`

    const updateStatusFromReport = (report) => {
      if (report.ok) {
        node.status({ fill: 'green', shape: 'dot', text: `OK (${formatTs(new Date())})` })
        return
      }
      const parts = []
      if (report.battery.length > 0) parts.push(`battery ${report.battery.length}`)
      if (report.connectivity.length > 0) parts.push(`zigbee ${report.connectivity.length}`)
      if (report.softwareUpdate.length > 0) parts.push(`update ${report.softwareUpdate.length}`)
      const fill = report.battery.length > 0 || report.connectivity.length > 0 ? 'red' : 'yellow'
      node.status({ fill, shape: 'dot', text: `${parts.join(', ')} (${formatTs(new Date())})` })
    }

    // One message per device and warning. Solved warnings (active: false) send nothing.
    const sendWarnings = (entries, send = (out) => node.send(out)) => {
      entries.filter((entry) => entry.active).forEach((entry) => {
        const type = WARNING_TYPES[entry.category]
        // "name, room, warning[, level%]": empty fields (device without room) are left out
        const deviceFields = [entry.name, entry.room, type]
        if (entry.category === 'battery' && typeof entry.batteryLevel === 'number') deviceFields.push(`${entry.batteryLevel}%`)
        const lastUpdate = new Date().toISOString() // This message is the device's latest payload
        send({
          topic: node.topic,
          payload: deviceFields.filter((field) => field !== '' && field !== undefined).join(', '),
          warning: type,
          deviceName: entry.name,
          deviceRoom: entry.room,
          lastUpdate
        })
      })
      updateStatusFromReport(node.monitor.report())
    }

    const currentWarnings = () => {
      const report = node.monitor.report()
      return ['battery', 'connectivity', 'softwareUpdate'].flatMap((category) => report[category].map((entry) => ({ ...entry, category, active: true })))
    }

    // Called by hue-ultimate-config with the full /resource list, at startup and after every reconnection.
    node.handleHueResourcesLoaded = (resources) => {
      const changes = node.monitor.load(resources)
      if (!hasSentStartup) {
        hasSentStartup = true
        sendWarnings(currentWarnings())
      } else {
        sendWarnings(changes)
      }
    }

    // Called by hue-ultimate-config for every event stream item.
    node.handleSendHUE = (_event) => {
      try {
        const changes = node.monitor.update(_event)
        if (changes.length > 0) sendWarnings(changes)
      } catch (error) {
        node.status({ fill: 'red', shape: 'dot', text: `HUE error ${error.message} (${formatTs(new Date())})` })
      }
    }

    // Used by hue-ultimate-config to show the bridge connection state.
    node.setNodeStatusHue = ({ fill, shape, text, payload }) => {
      try {
        if (payload === undefined) payload = ''
        payload = typeof payload === 'object' ? JSON.stringify(payload) : payload.toString()
        node.status({ fill, shape, text: `HUE: ${text} ${payload} (${formatTs(new Date())})` })
      } catch (error) { }
    }

    node.on('input', (msg, send, done) => {
      if (!node.monitor.loaded) {
        node.status({ fill: 'grey', shape: 'ring', text: `Waiting for the Hue Bridge (${formatTs(new Date())})` })
        if (done) done()
        return
      }
      sendWarnings(currentWarnings(), send || ((out) => node.send(out)))
      if (done) done()
    })

    if (node.serverHue) {
      node.serverHue.removeClient(node)
      node.serverHue.addClient(node)
    } else {
      node.status({ fill: 'red', shape: 'ring', text: 'Select a Hue Bridge' })
    }

    node.on('close', (done) => {
      if (node.serverHue) node.serverHue.removeClient(node)
      done()
    })
  }
  RED.nodes.registerType('hueUltimateHealth', hueUltimateHealth)
}
