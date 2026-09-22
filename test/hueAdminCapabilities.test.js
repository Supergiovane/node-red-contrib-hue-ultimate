const assert = require('assert/strict')

function createHarness (bridge) {
  const getRoutes = new Map()
  let plugin
  const RED = {
    settings: {},
    plugins: {
      registerPlugin (_name, definition) { plugin = definition }
    },
    nodes: {
      getNode: id => id === 'bridge' ? bridge : undefined
    },
    httpAdmin: {
      get (path, ...handlers) { getRoutes.set(path, handlers.at(-1)) },
      post () {}
    },
    auth: {
      needsPermission: () => (_req, _res, next) => next()
    },
    log: {
      error () {},
      warn () {},
      info () {},
      debug () {}
    }
  }

  require('../nodes/hueUltimate-admin')(RED)
  plugin.onadd()
  return getRoutes
}

function createResponse () {
  return {
    statusCode: 200,
    payload: undefined,
    status (statusCode) {
      this.statusCode = statusCode
      return this
    },
    json (payload) {
      this.payload = payload
      return this
    }
  }
}

describe('Hue admin light capabilities', () => {
  it('serves the namespaced capabilities endpoint used by the standalone editor', async () => {
    const cachedResource = {
      id: 'light-1',
      type: 'light',
      color_temperature: { mirek: 250 },
      color: { xy: { x: 0.3, y: 0.3 } },
      dimming: { brightness: 50 }
    }
    const bridge = {
      getHueResourceSnapshot: async id => id === cachedResource.id ? cachedResource : undefined
    }
    const routes = createHarness(bridge)
    const handler = routes.get('/hueUltimate/knxUltimateGetLightObject')
    const response = createResponse()

    assert.equal(typeof handler, 'function')
    await handler({ query: { serverId: 'bridge', id: 'light-1' } }, response)

    assert.equal(response.statusCode, 200)
    assert.equal(response.payload.id, 'light-1')
    assert.equal(response.payload.calculatedKelvin, 4000)
    assert.match(response.payload.calculatedHEXColor, /^#[0-9a-f]{6}$/i)
    assert.equal(Object.hasOwn(cachedResource, 'calculatedKelvin'), false)
    assert.equal(Object.hasOwn(cachedResource, 'calculatedHEXColor'), false)
  })

  it('returns a precise client error instead of throwing for incomplete editor requests', async () => {
    const routes = createHarness(undefined)
    const handler = routes.get('/hueUltimate/knxUltimateGetLightObject')
    const response = createResponse()

    await handler({ query: { serverId: '', id: '' } }, response)

    assert.equal(response.statusCode, 400)
    assert.deepEqual(response.payload, { error: 'Hue bridge not specified' })
  })
})
