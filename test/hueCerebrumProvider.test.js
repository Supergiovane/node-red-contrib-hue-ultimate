const { expect } = require('chai')
const { CEREBRUM_REGISTRY_KEY, getCerebrumRegistry } = require('../nodes/utils/cerebrumIntegration')
const { createHueCerebrumIntegration, mergeHueResource } = require('../nodes/utils/hueCerebrumProvider')

const resources = () => ([
  { id: 'dev-lamp', type: 'device', metadata: { name: 'Lampada tavolo' }, services: [{ rid: 'light-1', rtype: 'light' }] },
  { id: 'dev-sensor', type: 'device', metadata: { name: 'Sensore corridoio' }, services: [{ rid: 'motion-1', rtype: 'motion' }, { rid: 'temp-1', rtype: 'temperature' }, { rid: 'lux-1', rtype: 'light_level' }] },
  { id: 'room-living', type: 'room', metadata: { name: 'Soggiorno' }, children: [{ rid: 'dev-lamp', rtype: 'device' }], services: [{ rid: 'group-1', rtype: 'grouped_light' }] },
  { id: 'room-hall', type: 'room', metadata: { name: 'Corridoio' }, children: [{ rid: 'dev-sensor', rtype: 'device' }] },
  { id: 'light-1', type: 'light', owner: { rid: 'dev-lamp', rtype: 'device' }, metadata: { name: 'Lampada tavolo' }, on: { on: true }, dimming: { brightness: 42.4 } },
  { id: 'group-1', type: 'grouped_light', owner: { rid: 'room-living', rtype: 'room' }, on: { on: false } },
  { id: 'motion-1', type: 'motion', owner: { rid: 'dev-sensor', rtype: 'device' }, motion: { motion: false, motion_report: { motion: false, changed: '2026-11-26T10:00:00Z' } } },
  { id: 'temp-1', type: 'temperature', owner: { rid: 'dev-sensor', rtype: 'device' }, temperature: { temperature: 20.5 } },
  { id: 'lux-1', type: 'light_level', owner: { rid: 'dev-sensor', rtype: 'device' }, light: { light_level: 20001 } },
  { id: 'scene-1', type: 'scene', metadata: { name: 'Relax' } }
])

describe('Hue → Cerebrum integration', () => {
  let configNode
  let integration
  beforeEach(() => {
    delete globalThis[CEREBRUM_REGISTRY_KEY]
    configNode = { id: 'bridge-1', name: 'Casa', linkStatus: 'connected', hueAllResources: resources() }
    integration = createHueCerebrumIntegration({ configNode })
  })
  afterEach(() => integration.dispose())

  it('registers a read-only provider in the Cerebrum registry and removes it on close', async () => {
    const registry = getCerebrumRegistry()
    const provider = registry.providers.get('hue-ultimate:bridge-1')
    expect(provider).to.include({ adapterId: 'hue', ownerNodeId: 'bridge-1' })
    expect(provider.isReady()).to.equal(true)
    expect(provider).to.not.have.property('callService')
    expect(registry.adapters.get('hue').operations.map(operation => operation.id)).to.deep.equal(['list-entities', 'read-entity'])
    integration.dispose()
    expect(registry.providers.has('hue-ultimate:bridge-1')).to.equal(false)
    expect(registry.adapters.has('hue')).to.equal(false)
  })

  it('lists lights, room groups and sensors with room, kind and readable state', async () => {
    const entities = await integration.provider.listEntities()
    const byId = Object.fromEntries(entities.map(entity => [entity.id, entity]))
    expect(Object.keys(byId)).to.have.members(['light-1', 'group-1', 'motion-1', 'temp-1', 'lux-1'])
    expect(byId['light-1']).to.include({ name: 'Lampada tavolo', area: 'Soggiorno', kind: 'light', state: 'on', brightness: 42 })
    expect(byId['group-1']).to.include({ name: 'Soggiorno', area: 'Soggiorno', kind: 'light_group', state: 'off' })
    expect(byId['motion-1']).to.include({ name: 'Sensore corridoio (motion)', area: 'Corridoio', state: false })
    expect(byId['temp-1']).to.include({ state: 20.5, unit: '°C' })
    expect(byId['lux-1']).to.include({ state: 100, unit: 'lx' })
    expect(await integration.provider.getEntity('temp-1')).to.include({ id: 'temp-1' })
    expect(await integration.provider.getEntity('missing')).to.equal(null)
  })

  it('merges bridge events into states and notifies Cerebrum once per change', async () => {
    const events = []
    const unsubscribe = integration.provider.subscribe(event => events.push(event))
    integration.handleHueEvent({ id: 'light-1', type: 'light', on: { on: false } })
    integration.handleHueEvent({ id: 'light-1', type: 'light', dimming: { brightness: 10 } })
    integration.handleHueEvent({ id: 'motion-1', type: 'motion', motion: { motion_report: { motion: true } } })
    expect(events.map(event => [event.entityId, event.state])).to.deep.equal([['light-1', 'off'], ['motion-1', 'true']])
    expect(events[0]).to.include({ adapterId: 'hue', providerId: 'hue-ultimate:bridge-1', eventType: 'state_changed', previousState: '', area: 'Soggiorno', resourceName: 'Lampada tavolo' })
    expect((await integration.provider.getEntity('light-1'))).to.include({ state: 'off', brightness: 10 })
    // The shared resource list of the bridge is never mutated.
    expect(configNode.hueAllResources.find(resource => resource.id === 'light-1').on.on).to.equal(true)
    unsubscribe()
  })

  it('drops event overlays when the bridge reloads its resources', async () => {
    integration.handleHueEvent({ id: 'light-1', type: 'light', on: { on: false } })
    configNode.hueAllResources = resources()
    expect(await integration.provider.getEntity('light-1')).to.include({ state: 'on' })
  })

  it('merges nested Hue fields without losing siblings', () => {
    expect(mergeHueResource({ motion: { motion: false, motion_report: { motion: false, changed: 'a' } } }, { motion: { motion_report: { motion: true } } }))
      .to.deep.equal({ motion: { motion: false, motion_report: { motion: true, changed: 'a' } } })
  })
})
