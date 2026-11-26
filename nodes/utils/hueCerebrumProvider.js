'use strict'

// Publishes the devices of a Hue bridge to Cerebrum Ultimate (read-only):
// current states for chat, history, JavaScript routines and MCP clients.

const { registerCerebrumIntegration } = require('./cerebrumIntegration')

const isPlainObject = value => !!value && typeof value === 'object' && !Array.isArray(value)

// Hue v2 events carry only the changed fields: merge them into the cached copy.
const mergeHueResource = (target, delta) => {
  const out = { ...(isPlainObject(target) ? target : {}) }
  Object.entries(isPlainObject(delta) ? delta : {}).forEach(([key, value]) => {
    out[key] = isPlainObject(value) && isPlainObject(out[key]) ? mergeHueResource(out[key], value) : value
  })
  return out
}

const luxFromHue = value => Number.isFinite(Number(value)) ? Math.round(Math.pow(10, (Number(value) - 1) / 10000)) : undefined

// Each published Hue resource type: how to read its current state.
const HUE_ENTITY_TYPES = Object.freeze({
  light: { kind: 'light', capability: 'on_off', read: r => r.on ? (r.on.on ? 'on' : 'off') : undefined },
  grouped_light: { kind: 'light_group', capability: 'on_off', read: r => r.on ? (r.on.on ? 'on' : 'off') : undefined },
  motion: { kind: 'motion', capability: 'occupancy', read: r => r.motion ? (r.motion.motion_report ? r.motion.motion_report.motion : r.motion.motion) : undefined },
  camera_motion: { kind: 'motion', capability: 'occupancy', read: r => r.motion ? (r.motion.motion_report ? r.motion.motion_report.motion : r.motion.motion) : undefined },
  convenience_area_motion: { kind: 'motion', capability: 'occupancy', read: r => r.motion ? r.motion.motion : undefined },
  security_area_motion: { kind: 'motion', capability: 'occupancy', read: r => r.motion ? r.motion.motion : undefined },
  temperature: { kind: 'temperature', capability: 'measurement', unit: '°C', read: r => r.temperature ? (r.temperature.temperature_report ? r.temperature.temperature_report.temperature : r.temperature.temperature) : undefined },
  light_level: { kind: 'illuminance', capability: 'measurement', unit: 'lx', read: r => r.light ? luxFromHue(r.light.light_level_report ? r.light.light_level_report.light_level : r.light.light_level) : undefined },
  humidity: { kind: 'humidity', capability: 'measurement', unit: '%', read: r => r.humidity ? (r.humidity.humidity_report ? r.humidity.humidity_report.humidity : r.humidity.humidity) : undefined },
  contact: { kind: 'contact', capability: 'open_close', read: r => r.contact_report ? (r.contact_report.state === 'contact' ? 'closed' : 'open') : undefined },
  device_power: { kind: 'battery', capability: 'measurement', unit: '%', read: r => r.power_state ? r.power_state.battery_level : undefined },
  zigbee_connectivity: { kind: 'connectivity', capability: 'status', read: r => r.status },
  button: { kind: 'button', capability: 'event', read: r => r.button ? (r.button.button_report ? r.button.button_report.event : r.button.last_event) : undefined }
})

const lightDetails = resource => {
  const details = {}
  if (resource.dimming && Number.isFinite(Number(resource.dimming.brightness))) details.brightness = Math.round(Number(resource.dimming.brightness))
  if (resource.color_temperature && Number.isFinite(Number(resource.color_temperature.mirek))) details.colorTemperatureMirek = Number(resource.color_temperature.mirek)
  if (resource.color && resource.color.xy) details.colorXy = resource.color.xy
  return details
}

// rid of a service -> { device, room } using devices, rooms and zones.
const indexHueResources = resources => {
  const byId = new Map()
  const deviceByService = new Map()
  const roomByDevice = new Map()
  const groupNameByService = new Map()
  resources.forEach(resource => { if (resource && resource.id) byId.set(resource.id, resource) })
  resources.forEach(resource => {
    if (!resource) return
    if (resource.type === 'device') (resource.services || []).forEach(service => deviceByService.set(service.rid, resource))
    if (resource.type === 'room') (resource.children || []).forEach(child => { if (child.rtype === 'device') roomByDevice.set(child.rid, resource) })
    if (resource.type === 'room' || resource.type === 'zone') (resource.services || []).forEach(service => groupNameByService.set(service.rid, resource))
  })
  return { byId, deviceByService, roomByDevice, groupNameByService }
}

const buildHueCerebrumEntity = (resource, index) => {
  const definition = resource && HUE_ENTITY_TYPES[resource.type]
  if (!definition) return null
  const value = definition.read(resource)
  const owner = resource.owner ? index.byId.get(resource.owner.rid) : null
  const device = index.deviceByService.get(resource.id) || (owner && owner.type === 'device' ? owner : null)
  const group = index.groupNameByService.get(resource.id) || (owner && (owner.type === 'room' || owner.type === 'zone') ? owner : null)
  const room = group || (device && index.roomByDevice.get(device.id))
  const deviceName = device && device.metadata ? device.metadata.name : ''
  const ownName = resource.metadata ? resource.metadata.name : ''
  const roomName = room && room.metadata ? room.metadata.name : ''
  // A sensor device exposes several services (motion, temperature, …):
  // qualify their shared device name with the kind.
  const name = ownName ||
    (group && !device ? roomName : '') ||
    (deviceName && resource.type !== 'light' ? `${deviceName} (${definition.kind})` : deviceName) ||
    resource.id
  const entity = {
    id: resource.id,
    type: resource.type,
    name,
    area: roomName,
    kind: definition.kind,
    capability: definition.capability,
    state: value === undefined ? null : value
  }
  if (definition.unit) entity.unit = definition.unit
  if (deviceName && deviceName !== entity.name) entity.device = deviceName
  if (resource.type === 'light' || resource.type === 'grouped_light') Object.assign(entity, lightDetails(resource))
  return entity
}

const createHueCerebrumIntegration = ({ configNode, packageName = 'node-red-contrib-hue-ultimate' } = {}) => {
  let baseRef = null
  const overlay = new Map()

  // The bridge resource list is reloaded on reconnection; events update a
  // private overlay so the shared list is never mutated.
  const currentResources = () => {
    const base = Array.isArray(configNode.hueAllResources) ? configNode.hueAllResources : []
    if (base !== baseRef) {
      baseRef = base
      overlay.clear()
    }
    return base.map(resource => overlay.get(resource.id) || resource)
  }

  const entities = () => {
    const resources = currentResources()
    const index = indexHueResources(resources)
    return resources.map(resource => buildHueCerebrumEntity(resource, index)).filter(Boolean)
  }

  const integration = registerCerebrumIntegration({
    adapter: {
      id: 'hue',
      title: 'Philips Hue',
      packageName,
      kind: 'home-automation',
      capabilities: ['lights', 'rooms', 'motion', 'temperature', 'illuminance', 'contact', 'battery', 'buttons'],
      access: 'observe',
      operations: [
        { id: 'list-entities', description: 'Lights, light groups (rooms and zones) and sensors of the Hue bridge with their room and current state: on/off and brightness for lights, motion, temperature (°C), illuminance (lux), humidity, contact (open/closed), battery (%) and connectivity.' },
        { id: 'read-entity', description: 'Current state of one Hue light, group or sensor by its exact Hue resource id.' }
      ]
    },
    provider: {
      id: `hue-ultimate:${configNode.id}`,
      title: `Hue bridge ${configNode.name || configNode.host || ''}`.trim(),
      ownerNodeId: configNode.id,
      isReady: () => configNode.linkStatus === 'connected' && Array.isArray(configNode.hueAllResources),
      listEntities: async () => entities(),
      getEntity: async id => entities().find(entity => entity.id === String(id || '')) || null
    },
    // Sensors such as temperature and illuminance report often.
    minIntervalMs: 60 * 1000
  })

  const handleHueEvent = delta => {
    if (!delta || !delta.id) return
    const resources = currentResources()
    const base = overlay.get(delta.id) || resources.find(resource => resource.id === delta.id)
    if (!base) return
    const merged = mergeHueResource(base, delta)
    overlay.set(delta.id, merged)
    if (!integration.hasSubscribers()) return
    const entity = buildHueCerebrumEntity(merged, indexHueResources(resources.map(resource => resource.id === merged.id ? merged : resource)))
    if (!entity) return
    integration.emit({
      entityId: entity.id,
      eventType: entity.kind === 'button' ? 'button_event' : 'state_changed',
      state: entity.state,
      resourceName: entity.name,
      resourceType: entity.type,
      deviceName: entity.device,
      area: entity.area,
      kind: entity.kind,
      capability: entity.capability,
      unit: entity.unit,
      details: entity.kind === 'light' || entity.kind === 'light_group' ? lightDetails(merged) : {}
    })
  }

  return { handleHueEvent, entities, dispose: integration.dispose, provider: integration.provider }
}

module.exports = { buildHueCerebrumEntity, createHueCerebrumIntegration, indexHueResources, mergeHueResource }
