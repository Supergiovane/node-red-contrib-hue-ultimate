const { expect } = require('chai')

describe('hueEngine queue robustness', () => {
  let classHUE

  const makeSilentLogger = () => ({
    debug: () => {},
    info: () => {},
    warn: () => {},
    error: () => {}
  })

  before(async () => {
    const mod = await import('../nodes/utils/hueEngine.mjs')
    classHUE = mod.classHUE
  })

  it('keeps opposite on/off commands as separate requests, in order', async () => {
    const hue = new classHUE('ip', 'user', 'key', 'bridge', makeSilentLogger(), { startQueue: false })

    await hue.writeHueQueueAdd('lamp-1', { on: { on: true } }, 'setLight')
    await hue.writeHueQueueAdd('lamp-1', { on: { on: false } }, 'setLight')
    await hue.writeHueQueueAdd('lamp-1', { on: { on: true } }, 'setLight')

    expect(hue.commandQueue).to.have.lengthOf(3)
    // unshift inserts at head, so newest at index 0
    expect(hue.commandQueue[0]._state).to.deep.equal({ on: { on: true } })
    expect(hue.commandQueue[1]._state).to.deep.equal({ on: { on: false } })
    expect(hue.commandQueue[2]._state).to.deep.equal({ on: { on: true } })
    await hue.close()
  })

  it('merges a brightness sent right after a switch-on into the same request', async () => {
    const hue = new classHUE('ip', 'user', 'key', 'bridge', makeSilentLogger(), { startQueue: false })

    await hue.writeHueQueueAdd('lamp-1', { on: { on: true } }, 'setLight')
    await hue.writeHueQueueAdd('lamp-2', { on: { on: true } }, 'setLight')
    await hue.writeHueQueueAdd('lamp-1', { dimming: { brightness: 20 } }, 'setLight')

    expect(hue.commandQueue).to.have.lengthOf(2)
    expect(hue.commandQueue[1]._lightID).to.equal('lamp-1')
    expect(hue.commandQueue[1]._state).to.deep.equal({ on: { on: true }, dimming: { brightness: 20 } })
    await hue.close()
  })

  it('merges a switch-on into a queued brightness preset', async () => {
    const hue = new classHUE('ip', 'user', 'key', 'bridge', makeSilentLogger(), { startQueue: false })

    await hue.writeHueQueueAdd('group-1', { dimming: { brightness: 20 } }, 'setGroupedLight')
    await hue.writeHueQueueAdd('group-1', { on: { on: true } }, 'setGroupedLight')

    expect(hue.commandQueue).to.have.lengthOf(1)
    expect(hue.commandQueue[0]._state).to.deep.equal({ dimming: { brightness: 20 }, on: { on: true } })
    expect(hue.commandQueue[0]._notBefore).to.equal(0)
    await hue.close()
  })

  it('lets the latest color mode win when merging', async () => {
    const hue = new classHUE('ip', 'user', 'key', 'bridge', makeSilentLogger(), { startQueue: false })

    await hue.writeHueQueueAdd('lamp-1', { on: { on: true }, color: { xy: { x: 0.3, y: 0.3 } } }, 'setLight')
    await hue.writeHueQueueAdd('lamp-1', { color_temperature: { mirek: 300 } }, 'setLight')

    expect(hue.commandQueue).to.have.lengthOf(1)
    expect(hue.commandQueue[0]._state).to.deep.equal({ on: { on: true }, color_temperature: { mirek: 300 } })
    await hue.close()
  })

  it('does not merge different operations on the same id', async () => {
    const hue = new classHUE('ip', 'user', 'key', 'bridge', makeSilentLogger(), { startQueue: false })

    await hue.writeHueQueueAdd('scene-1', { recall: { action: 'active' } }, 'setScene')
    await hue.writeHueQueueAdd('scene-1', { recall: { action: 'active' } }, 'setScene')
    await hue.writeHueQueueAdd('id-1', { on: { on: true } }, 'setLight')
    await hue.writeHueQueueAdd('id-1', { on: { on: true } }, 'setGroupedLight')

    expect(hue.commandQueue).to.have.lengthOf(4)
    await hue.close()
  })

  it('holds only a bare switch-on, waiting for a brightness to follow', async () => {
    const hue = new classHUE('ip', 'user', 'key', 'bridge', makeSilentLogger(), { startQueue: false })
    const before = Date.now()

    await hue.writeHueQueueAdd('lamp-1', { on: { on: true } }, 'setLight')
    await hue.writeHueQueueAdd('lamp-2', { on: { on: true }, dimming: { brightness: 20 } }, 'setLight')
    await hue.writeHueQueueAdd('plug-1', { on: { on: true } }, 'setPlug')

    expect(hue.commandQueue[2]._notBefore).to.be.at.least(before + hue.switchOnHoldMs)
    expect(hue.commandQueue[1]._notBefore).to.equal(0)
    expect(hue.commandQueue[0]._notBefore).to.equal(0)
    await hue.close()
  })

  it('sends one request for a switch-on followed by a brightness', async () => {
    const hue = new classHUE('ip', 'user', 'key', 'bridge', makeSilentLogger(), { startQueue: false })
    hue.HUEBridgeConnectionStatus = 'connected'
    hue.queueIdlePollMs = 5
    const calls = []
    hue.hueApiV2 = { put: async (url, body) => { calls.push({ url, body }) }, get: async () => [] }
    hue.handleQueue()

    await hue.writeHueQueueAdd('lamp-1', { on: { on: true } }, 'setLight')
    await new Promise((resolve) => setTimeout(resolve, 40))
    expect(calls).to.have.lengthOf(0) // still held
    await hue.writeHueQueueAdd('lamp-1', { dimming: { brightness: 20 } }, 'setLight')
    await new Promise((resolve) => setTimeout(resolve, hue.switchOnHoldMs + 60))

    expect(calls).to.deep.equal([
      { url: '/resource/light/lamp-1', body: { on: { on: true }, dimming: { brightness: 20 } } }
    ])
    await hue.close()
  })

  it('merges into a pending switch-on only on request', async () => {
    const hue = new classHUE('ip', 'user', 'key', 'bridge', makeSilentLogger(), { startQueue: false })

    expect(hue.mergeIntoPendingSwitchOn('group-1', { dimming: { brightness: 20 } }, 'setGroupedLight')).to.equal(false)
    expect(hue.commandQueue).to.have.lengthOf(0)

    await hue.writeHueQueueAdd('group-1', { color_temperature: { mirek: 300 } }, 'setGroupedLight')
    expect(hue.mergeIntoPendingSwitchOn('group-1', { dimming: { brightness: 20 } }, 'setGroupedLight')).to.equal(false)

    await hue.writeHueQueueAdd('group-1', { on: { on: true } }, 'setGroupedLight')
    expect(hue.mergeIntoPendingSwitchOn('group-1', { dimming: { brightness: 20 } }, 'setGroupedLight')).to.equal(true)
    expect(hue.commandQueue).to.have.lengthOf(1)
    expect(hue.commandQueue[0]._state).to.deep.equal({ color_temperature: { mirek: 300 }, on: { on: true }, dimming: { brightness: 20 } })
    await hue.close()
  })

  it('caps the queue length to avoid unbounded growth', async () => {
    const hue = new classHUE('ip', 'user', 'key', 'bridge', makeSilentLogger(), { startQueue: false })
    hue.queueMaxLength = 3

    for (let i = 0; i < 10; i += 1) {
      await hue.writeHueQueueAdd(`lamp-${i}`, { on: { on: true } }, 'setLight')
    }

    expect(hue.commandQueue).to.have.lengthOf(3)
    expect(hue.commandQueue[0]._lightID).to.equal('lamp-9')
    expect(hue.commandQueue[2]._lightID).to.equal('lamp-7')
    await hue.close()
  })

  it('drops the failing queue item when Hue returns device communication issues', async () => {
    const hue = new classHUE('ip', 'user', 'key', 'bridge', makeSilentLogger(), { startQueue: false })
    hue.HUEBridgeConnectionStatus = 'connected'

    const calls = []
    hue.hueApiV2 = {
      put: async (url) => {
        calls.push(url)
        if (url.includes('/resource/light/lamp-1')) {
          throw new Error(
            'The response for https://127.0.0.1/clip/v2/resource/light/lamp-1 returned errors ' +
              JSON.stringify([{ description: 'device (light) has communication issues, command (.on.on) may not have effect' }])
          )
        }
      },
      get: async () => []
    }

    await hue.writeHueQueueAdd('lamp-1', { on: { on: true } }, 'setLight')
    await hue.writeHueQueueAdd('lamp-2', { on: { on: true } }, 'setLight')
    expect(hue.commandQueue).to.have.lengthOf(2)

    await hue.processQueueItem() // lamp-1 fails, must be dropped
    expect(hue.commandQueue).to.have.lengthOf(1)

    await hue.processQueueItem() // lamp-2 succeeds
    expect(hue.commandQueue).to.have.lengthOf(0)
    expect(calls.some((item) => item.includes('/resource/light/lamp-1'))).to.equal(true)
    expect(calls.some((item) => item.includes('/resource/light/lamp-2'))).to.equal(true)
    await hue.close()
  })

  it('does not consume queued commands while disconnected', async () => {
    const hue = new classHUE('ip', 'user', 'key', 'bridge', makeSilentLogger(), { startQueue: false })
    hue.HUEBridgeConnectionStatus = 'disconnected'
    let putCalls = 0
    hue.hueApiV2 = { put: async () => { putCalls += 1 }, get: async () => [] }

    await hue.writeHueQueueAdd('lamp-1', { on: { on: true } }, 'setLight')
    await hue.processQueueItem()

    expect(putCalls).to.equal(0)
    expect(hue.commandQueue).to.have.lengthOf(1)
    await hue.close()
  })
})
