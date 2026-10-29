'use strict'

// Bridge-wide device health for HUE Health. It keeps the latest device_power,
// zigbee_connectivity and device_software_update state of every Hue device and
// reports which ones need attention. Pure logic: the node feeds it the resource
// list and the event stream, and decides what to send.

const RESOURCE_CATEGORY = Object.freeze({
  device_power: 'battery',
  zigbee_connectivity: 'connectivity',
  device_software_update: 'softwareUpdate'
})
const CATEGORIES = Object.freeze(['battery', 'connectivity', 'softwareUpdate'])

const DEFAULT_BATTERY_THRESHOLD = 20

const isPlainObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value)

const readServiceData = (category, resource, previous = {}) => {
  switch (category) {
    case 'battery': {
      const powerState = { ...(previous.powerState || {}), ...(isPlainObject(resource.power_state) ? resource.power_state : {}) }
      return { powerState }
    }
    case 'connectivity':
      return { status: resource.status !== undefined ? resource.status : previous.status }
    case 'softwareUpdate':
      return { state: resource.state !== undefined ? resource.state : previous.state }
    default:
      return {}
  }
}

class HueHealthMonitor {
  constructor ({ batteryThreshold = DEFAULT_BATTERY_THRESHOLD, battery = true, connectivity = true, softwareUpdate = true } = {}) {
    const threshold = Number(batteryThreshold)
    this.batteryThreshold = Number.isFinite(threshold) ? threshold : DEFAULT_BATTERY_THRESHOLD
    this.enabled = { battery: battery !== false, connectivity: connectivity !== false, softwareUpdate: softwareUpdate !== false }
    this.loaded = false
    this.devices = new Map() // deviceId -> name
    this.rooms = new Map() // roomId -> { name, deviceIds: Set }
    this.services = new Map() // serviceId -> { category, deviceId, data }
    this.signatures = new Map() // serviceId -> { issue, service } of its active issue
  }

  // Replaces everything with a full /resource snapshot. Returns the issue changes.
  load (resources) {
    this.devices.clear()
    this.rooms.clear()
    this.services.clear()
    const list = Array.isArray(resources) ? resources : []
    list.forEach((resource) => {
      if (!isPlainObject(resource) || typeof resource.id !== 'string') return
      if (resource.type === 'device') {
        this.devices.set(resource.id, resource.metadata?.name || '')
      } else if (resource.type === 'room') {
        this._applyRoom(resource)
      } else if (RESOURCE_CATEGORY[resource.type] !== undefined && typeof resource.owner?.rid === 'string') {
        const category = RESOURCE_CATEGORY[resource.type]
        this.services.set(resource.id, { category, deviceId: resource.owner.rid, data: readServiceData(category, resource) })
      }
    })
    this.loaded = true
    return this._collectChanges()
  }

  // Applies one event stream item (often a partial resource). Returns the issue changes.
  update (resource) {
    if (!this.loaded || !isPlainObject(resource) || typeof resource.id !== 'string') return []
    if (resource.type === 'device') {
      if (resource.metadata?.name !== undefined) this.devices.set(resource.id, resource.metadata.name)
      return []
    }
    if (resource.type === 'room') {
      this._applyRoom(resource)
      return []
    }
    const category = RESOURCE_CATEGORY[resource.type]
    if (category === undefined) return []
    const service = this.services.get(resource.id)
    if (service) {
      service.data = readServiceData(category, resource, service.data)
    } else if (typeof resource.owner?.rid === 'string') {
      this.services.set(resource.id, { category, deviceId: resource.owner.rid, data: readServiceData(category, resource) })
    } else {
      return []
    }
    return this._collectChanges(resource.id)
  }

  // Current devices needing attention, grouped by category.
  report () {
    const payload = { ok: true, issues: 0 }
    CATEGORIES.forEach((category) => { payload[category] = [] })
    this.services.forEach((service, serviceId) => {
      const issue = this._issueOf(service)
      if (!issue) return
      payload[service.category].push(this._describe(serviceId, service, issue))
    })
    CATEGORIES.forEach((category) => {
      payload[category].sort((left, right) => left.name.localeCompare(right.name, undefined, { numeric: true, sensitivity: 'base' }))
      payload.issues += payload[category].length
    })
    payload.ok = payload.issues === 0
    return payload
  }

  _applyRoom (resource) {
    const room = this.rooms.get(resource.id) || { name: '', deviceIds: new Set() }
    if (resource.metadata?.name !== undefined) room.name = resource.metadata.name
    if (Array.isArray(resource.children)) {
      room.deviceIds = new Set(resource.children.filter((child) => child?.rtype === 'device').map((child) => child.rid))
    }
    this.rooms.set(resource.id, room)
  }

  _roomOf (deviceId) {
    for (const room of this.rooms.values()) {
      if (room.deviceIds.has(deviceId)) return room.name
    }
    return ''
  }

  // Returns the issue signature, or null when the service is fine. A change of
  // signature (e.g. battery low -> critical, update pending -> ready) is reported;
  // a change of value inside the same signature (battery 15% -> 14%) is not.
  _issueOf (service) {
    if (!this.enabled[service.category]) return null
    const { data } = service
    switch (service.category) {
      case 'battery': {
        const { battery_state: batteryState, battery_level: batteryLevel } = data.powerState
        if (batteryState === 'critical') return 'critical'
        if (batteryState === 'low') return 'low'
        if (typeof batteryLevel === 'number' && batteryLevel <= this.batteryThreshold) return 'low'
        return null
      }
      case 'connectivity':
        return data.status !== undefined && data.status !== 'connected' ? data.status : null
      case 'softwareUpdate':
        return data.state !== undefined && data.state !== 'no_update' ? data.state : null
      default:
        return null
    }
  }

  _describe (serviceId, service, issue) {
    const entry = {
      deviceId: service.deviceId,
      name: this.devices.get(service.deviceId) || service.deviceId,
      room: this._roomOf(service.deviceId),
      resourceId: serviceId
    }
    switch (service.category) {
      case 'battery':
        entry.batteryLevel = service.data.powerState.battery_level
        entry.batteryState = issue || service.data.powerState.battery_state // Cleared entries show the bridge value
        break
      case 'connectivity':
        entry.status = service.data.status
        break
      case 'softwareUpdate':
        entry.state = service.data.state
        break
      default:
        break
    }
    return entry
  }

  _collectChanges (onlyServiceId) {
    const changes = []
    const serviceIds = onlyServiceId !== undefined
      ? [onlyServiceId]
      : new Set([...this.services.keys(), ...this.signatures.keys()])
    serviceIds.forEach((serviceId) => {
      const service = this.services.get(serviceId)
      const previous = this.signatures.get(serviceId) // { issue, service }
      const issue = service ? this._issueOf(service) : null
      if ((previous ? previous.issue : null) === issue) return
      if (issue === null) {
        this.signatures.delete(serviceId)
        // A service gone from the bridge still reports its cleared issue.
        const cleared = service || previous.service
        changes.push({ category: cleared.category, active: false, ...this._describe(serviceId, cleared, null) })
        return
      }
      this.signatures.set(serviceId, { issue, service })
      changes.push({ category: service.category, active: true, ...this._describe(serviceId, service, issue) })
    })
    return changes
  }
}

module.exports = { HueHealthMonitor, CATEGORIES, DEFAULT_BATTERY_THRESHOLD }
