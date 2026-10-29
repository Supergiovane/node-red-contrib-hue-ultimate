const { expect } = require('chai')
const { HueHealthMonitor } = require('../nodes/utils/hueHealthMonitor')

const resources = () => ([
  { id: 'dev-sensor', type: 'device', metadata: { name: 'Hallway sensor' } },
  { id: 'dev-lamp', type: 'device', metadata: { name: 'Desk lamp' } },
  { id: 'room-hall', type: 'room', metadata: { name: 'Hallway' }, children: [{ rid: 'dev-sensor', rtype: 'device' }] },
  { id: 'pow-sensor', type: 'device_power', owner: { rid: 'dev-sensor', rtype: 'device' }, power_state: { battery_state: 'normal', battery_level: 80 } },
  { id: 'zb-sensor', type: 'zigbee_connectivity', owner: { rid: 'dev-sensor', rtype: 'device' }, status: 'connected' },
  { id: 'zb-lamp', type: 'zigbee_connectivity', owner: { rid: 'dev-lamp', rtype: 'device' }, status: 'connected' },
  { id: 'sw-lamp', type: 'device_software_update', owner: { rid: 'dev-lamp', rtype: 'device' }, state: 'no_update' }
])

describe('HueHealthMonitor', () => {
  it('reports no issues for a healthy bridge', () => {
    const monitor = new HueHealthMonitor()
    expect(monitor.load(resources())).to.deep.equal([])
    expect(monitor.report()).to.deep.equal({ ok: true, issues: 0, battery: [], connectivity: [], softwareUpdate: [] })
  })

  it('reports the problems found at load, with device name and room', () => {
    const list = resources()
    list[3].power_state = { battery_state: 'low', battery_level: 9 }
    list[5].status = 'connectivity_issue'
    list[6].state = 'ready_to_install'
    const monitor = new HueHealthMonitor()

    const changes = monitor.load(list)
    expect(changes.map((c) => [c.category, c.active])).to.have.deep.members([['battery', true], ['connectivity', true], ['softwareUpdate', true]])
    const report = monitor.report()
    expect(report.ok).to.equal(false)
    expect(report.issues).to.equal(3)
    expect(report.battery).to.deep.equal([{ deviceId: 'dev-sensor', name: 'Hallway sensor', room: 'Hallway', resourceId: 'pow-sensor', batteryLevel: 9, batteryState: 'low' }])
    expect(report.connectivity).to.deep.equal([{ deviceId: 'dev-lamp', name: 'Desk lamp', room: '', resourceId: 'zb-lamp', status: 'connectivity_issue' }])
    expect(report.softwareUpdate).to.deep.equal([{ deviceId: 'dev-lamp', name: 'Desk lamp', room: '', resourceId: 'sw-lamp', state: 'ready_to_install' }])
  })

  it('treats a level at or below the threshold as low, even if the bridge says normal', () => {
    const monitor = new HueHealthMonitor({ batteryThreshold: 25 })
    monitor.load(resources())
    const changes = monitor.update({ id: 'pow-sensor', type: 'device_power', power_state: { battery_level: 25 } })
    expect(changes).to.have.lengthOf(1)
    expect(changes[0]).to.include({ category: 'battery', active: true, batteryLevel: 25, batteryState: 'low' })
  })

  it('reports entering, worsening and leaving a problem, but not level changes inside it', () => {
    const monitor = new HueHealthMonitor()
    monitor.load(resources())

    expect(monitor.update({ id: 'pow-sensor', type: 'device_power', power_state: { battery_state: 'low', battery_level: 15 } })).to.have.lengthOf(1)
    expect(monitor.update({ id: 'pow-sensor', type: 'device_power', power_state: { battery_level: 14 } })).to.deep.equal([])
    expect(monitor.report().battery[0].batteryLevel).to.equal(14)

    const worse = monitor.update({ id: 'pow-sensor', type: 'device_power', power_state: { battery_state: 'critical', battery_level: 4 } })
    expect(worse[0]).to.include({ active: true, batteryState: 'critical' })

    const solved = monitor.update({ id: 'pow-sensor', type: 'device_power', power_state: { battery_state: 'normal', battery_level: 100 } })
    expect(solved[0]).to.include({ category: 'battery', active: false, batteryState: 'normal', name: 'Hallway sensor' })
    expect(monitor.report().ok).to.equal(true)
  })

  it('follows Zigbee status and software update state changes', () => {
    const monitor = new HueHealthMonitor()
    monitor.load(resources())

    expect(monitor.update({ id: 'zb-lamp', type: 'zigbee_connectivity', status: 'disconnected' })[0]).to.include({ active: true, status: 'disconnected' })
    expect(monitor.update({ id: 'zb-lamp', type: 'zigbee_connectivity', status: 'connected' })[0]).to.include({ active: false, status: 'connected' })
    expect(monitor.update({ id: 'sw-lamp', type: 'device_software_update', state: 'update_pending' })[0]).to.include({ active: true, state: 'update_pending' })
    expect(monitor.update({ id: 'sw-lamp', type: 'device_software_update', state: 'installing' })[0]).to.include({ active: true, state: 'installing' })
    expect(monitor.update({ id: 'sw-lamp', type: 'device_software_update', state: 'no_update' })[0]).to.include({ active: false })
  })

  it('ignores disabled categories, unrelated resources and events before load', () => {
    const monitor = new HueHealthMonitor({ softwareUpdate: false })
    expect(monitor.update({ id: 'zb-lamp', type: 'zigbee_connectivity', status: 'disconnected' })).to.deep.equal([])
    monitor.load(resources())
    expect(monitor.update({ id: 'sw-lamp', type: 'device_software_update', state: 'ready_to_install' })).to.deep.equal([])
    expect(monitor.update({ id: 'light-1', type: 'light', on: { on: true } })).to.deep.equal([])
    expect(monitor.update({ id: 'unknown', type: 'device_power', power_state: { battery_level: 1 } })).to.deep.equal([])
    expect(monitor.report().ok).to.equal(true)
  })

  it('learns new services and device renames from the event stream', () => {
    const monitor = new HueHealthMonitor()
    monitor.load(resources())
    monitor.update({ id: 'dev-lamp', type: 'device', metadata: { name: 'Office lamp' } })
    const changes = monitor.update({ id: 'pow-new', type: 'device_power', owner: { rid: 'dev-lamp', rtype: 'device' }, power_state: { battery_state: 'low', battery_level: 5 } })
    expect(changes[0]).to.include({ active: true, name: 'Office lamp', resourceId: 'pow-new' })
  })

  it('clears problems of services gone after a reload', () => {
    const list = resources()
    list[5].status = 'disconnected'
    const monitor = new HueHealthMonitor()
    monitor.load(list)

    const changes = monitor.load(resources().filter((resource) => resource.id !== 'zb-lamp'))
    expect(changes).to.have.lengthOf(1)
    expect(changes[0]).to.include({ category: 'connectivity', active: false, resourceId: 'zb-lamp' })
    expect(monitor.report().ok).to.equal(true)
  })
})

describe('hueUltimateHealth node', () => {
  const instantiate = (config = {}) => {
    let Constructor
    const RED = {
      nodes: {
        registerType: (type, constructor) => { Constructor = constructor },
        createNode: (node) => {
          node.handlers = {}
          node.on = (name, handler) => { node.handlers[name] = handler }
          node.sent = []
          node.send = (msg) => node.sent.push(msg)
          node.statuses = []
          node.status = (status) => node.statuses.push(status)
        },
        getNode: () => hueServer
      }
    }
    const hueServer = {
      clients: [],
      addClient (client) { this.clients.push(client) },
      removeClient (client) { this.clients = this.clients.filter((item) => item !== client) }
    }
    require('../nodes/hueUltimateHealth')(RED)
    const node = {}
    Constructor.call(node, { serverHue: 'bridge', name: 'Health', ...config })
    return { node, hueServer }
  }

  it('sends one message per device warning at startup', () => {
    const { node, hueServer } = instantiate()
    expect(hueServer.clients).to.deep.equal([node])
    const list = resources()
    list[3].power_state = { battery_state: 'low', battery_level: 9 }
    list[6].state = 'ready_to_install'

    node.handleHueResourcesLoaded(list)
    expect(node.sent).to.have.lengthOf(2)
    const [battery, update] = node.sent
    expect(battery.payload).to.equal('Hallway sensor, Hallway, battery, 9%')
    expect(battery).to.include({ topic: 'Health', warning: 'battery', deviceName: 'Hallway sensor', deviceRoom: 'Hallway' })
    expect(Number.isNaN(Date.parse(battery.lastUpdate))).to.equal(false)
    expect(update.payload).to.equal('Desk lamp, software_update') // no room
    expect(update).to.include({ warning: 'software_update', deviceRoom: '' })
    expect(node.statuses.at(-1).fill).to.equal('red')

    node.handleHueResourcesLoaded(list) // reconnection without changes
    expect(node.sent).to.have.lengthOf(2)
  })

  it('sends nothing at startup when every device is fine', () => {
    const { node } = instantiate()
    node.handleHueResourcesLoaded(resources())
    expect(node.sent).to.deep.equal([])
    expect(node.statuses.at(-1).fill).to.equal('green')
  })

  it('sends a message when a device warning starts, nothing when it is solved', () => {
    const { node } = instantiate()
    node.handleHueResourcesLoaded(resources())

    node.handleSendHUE({ id: 'zb-lamp', type: 'zigbee_connectivity', status: 'disconnected' })
    node.handleSendHUE({ id: 'zb-lamp', type: 'zigbee_connectivity', status: 'disconnected' })
    expect(node.sent).to.have.lengthOf(1)
    expect(node.sent[0].payload).to.equal('Desk lamp, zigbee_connectivity')
    expect(node.sent[0].warning).to.equal('zigbee_connectivity')

    node.handleSendHUE({ id: 'zb-lamp', type: 'zigbee_connectivity', status: 'connected' })
    expect(node.sent).to.have.lengthOf(1)
    expect(node.statuses.at(-1).fill).to.equal('green')
  })

  it('answers an input request with the current warnings', () => {
    const { node } = instantiate()
    node.handleHueResourcesLoaded(resources())
    node.handleSendHUE({ id: 'pow-sensor', type: 'device_power', power_state: { battery_state: 'critical', battery_level: 3 } })

    const out = []
    let isDone = false
    node.handlers.input({ topic: 'check' }, (msg) => out.push(msg), () => { isDone = true })
    expect(isDone).to.equal(true)
    expect(out).to.have.lengthOf(1)
    expect(out[0].payload).to.equal('Hallway sensor, Hallway, battery, 3%')
  })

  it('does not answer requests before the bridge resources are loaded', () => {
    const { node } = instantiate()
    const out = []
    node.handlers.input({}, (msg) => out.push(msg), () => {})
    expect(out).to.deep.equal([])
  })

  it('applies the configured categories and threshold', () => {
    const { node } = instantiate({ monitorBattery: true, batteryThreshold: '85', monitorConnectivity: false })
    node.handleHueResourcesLoaded(resources())
    expect(node.sent).to.have.lengthOf(1)
    expect(node.sent[0].warning).to.equal('battery')
    node.handleSendHUE({ id: 'zb-lamp', type: 'zigbee_connectivity', status: 'disconnected' })
    expect(node.sent).to.have.lengthOf(1)
  })
})
