'use strict'

const customHTTP = require('./utils/http')
const hueColorConverter = require('./utils/colorManipulators/hueColorConverter')
const { initializeKnx } = require('./utils/optionalKnx')
const registered = new WeakSet()

module.exports = function (RED) {
  initializeKnx(RED)
  RED.plugins.registerPlugin('hueUltimateAdmin', {
    type: 'hue-ultimate-admin',
    onadd () {
      if (registered.has(RED)) return
      registered.add(RED)
      registerRoutes(RED)
    }
  })
}

function registerRoutes (RED) {
  const node = { sysLogger: RED.log }
  RED.httpAdmin.get('/hueUltimate/knxultimateCheckHueConnected', (req, res) => {
        try {
          const serverId = RED.nodes.getNode(req.query.serverId) // Retrieve node.id of the config node.
          if (!serverId) {
            res.json({ ready: false })
            return
          }
          if (serverId.hueAllResources === null || serverId.hueAllResources === undefined) {
            (async function main () {
              try {
                if (typeof serverId.loadResourcesFromHUEBridge === 'function') {
                  await serverId.loadResourcesFromHUEBridge()
                }
              } catch (error) {
                RED.log.error(`Errore RED.httpAdmin.get('/hueUltimate/knxultimateCheckHueConnected' ${error.stack}`)
              }
              res.json({ ready: false })
            }()).catch()
          } else {
            res.json({ ready: true })
          }
        } catch (error) {
          RED.log.error(`Errore RED.httpAdmin.get('/hueUltimate/knxultimateCheckHueConnected' ${error.stack}`)
          res.json({ ready: false })
        }
      })
  
  RED.httpAdmin.get('/hueUltimate/KNXUltimateGetHueBridgeInfo', RED.auth.needsPermission('hue-ultimate-config.read'), (req, res) => {
        async function fetchData () {
          try {
            const response = await customHTTP.getBridgeDetails(req.query.IP)
            // Mostra l'array risultante
            res.json(response)
          } catch (error) {
            if (node.sysLogger !== undefined && node.sysLogger !== null) node.sysLogger.error(`Error fetching discovery.meethue.com ${error.stack}`)
            res.json({ error: error.message })
          }
        }
        fetchData()
      })
  
  RED.httpAdmin.get('/hueUltimate/KNXUltimateGetPlainHueBridgeCredentials', RED.auth.needsPermission('hue-ultimate-config.read'), (req, res) => {
        try {
          const serverId = RED.nodes.getNode(req.query.serverId) // Retrieve node.id of the config node.
          const username = serverId.credentials.username
          const clientkey = serverId.credentials.clientkey
          res.json({ username, clientkey })
        } catch (error) {
          res.json({ error: error.message })
        }
      })
  
  RED.httpAdmin.get('/hueUltimate/KNXUltimateRegisterToHueBridge', (req, res) => {
        (async () => {
          try {
            const configNode = RED.nodes.getNode(req.query.serverId)
            const ipAddress = req.query.IP
            if (!ipAddress) throw new Error('Bridge IP address is required.')
            const registration = await customHTTP.registerBridgeUser(ipAddress, 'KNXUltimate', 'Node-RED')
            const bridgeInfo = {
              data: registration.bridge,
              name: registration.bridge?.name || configNode?.name || 'Hue Bridge',
              ipaddress: registration.bridge?.ipaddress || ipAddress,
              bridgeid: registration.bridge?.bridgeid || configNode?.bridgeid || ''
            }
            if (configNode) {
              try {
                configNode.credentials = configNode.credentials || {}
                configNode.credentials.username = registration.user.username
                configNode.credentials.clientkey = registration.user.clientkey
                if (typeof bridgeInfo.bridgeid === 'string' && bridgeInfo.bridgeid) {
                  try { configNode.bridgeid = bridgeInfo.bridgeid } catch (e) { /* noop */ }
                }
              } catch (credError) {
                if (node.sysLogger) node.sysLogger.warn(`Hue registration: unable to persist credentials for node ${configNode.id}: ${credError.message}`)
              }
            }
            res.json({ bridge: bridgeInfo, user: registration.user })
          } catch (error) {
            if (node.sysLogger) node.sysLogger.error(`Hue bridge registration failed: ${error.message}`)
            res.json({ error: error.message })
          }
        })()
      })
  
  RED.httpAdmin.get('/hueUltimate/KNXUltimateDiscoverHueBridges', RED.auth.needsPermission('hue-ultimate-config.read'), (req, res) => {
        customHTTP.discoverHueBridges().then((list) => {
          res.json(Array.isArray(list) ? list : [])
        }).catch((error) => {
          if (node.sysLogger) node.sysLogger.error(`Hue bridge discovery failed: ${error.message}`)
          res.json({ error: error.message })
        })
      })
  
  RED.httpAdmin.get('/hueUltimate/knxUltimateGetHueColor', (req, res) => {
        try {
          const serverId = RED.nodes.getNode(req.query.serverId) // Retrieve node.id of the config node.
          // find wether the light is a light or is grouped_light
          let hexColor
          const _oDevice = serverId.hueAllResources.filter((a) => a.id === req.query.id)[0]
          if (_oDevice.type === 'light') {
            hexColor = serverId.getColorFromHueLight(req.query.id)
          } else {
            // grouped_light, get the first light in the group
            const oLight = serverId.getFirstLightInGroup(_oDevice.id)
            hexColor = serverId.getColorFromHueLight(oLight.id)
          }
          res.json(hexColor !== undefined ? hexColor : 'Select the device first!')
        } catch (error) {
          res.json('Select the device first!')
        }
      })
  
  RED.httpAdmin.get('/hueUltimate/knxUltimateGetKelvinColor', (req, res) => {
        try {
          // find wether the light is a light or is grouped_light
          const serverId = RED.nodes.getNode(req.query.serverId) // Retrieve node.id of the config node.
          let kelvinValue
          const _oDevice = serverId.hueAllResources.filter((a) => a.id === req.query.id)[0]
          if (_oDevice.type === 'light') {
            kelvinValue = serverId.getKelvinFromHueLight(req.query.id)
          } else {
            // grouped_light, get the first light in the group
            const oLight = serverId.getFirstLightInGroup(_oDevice.id)
            kelvinValue = serverId.getKelvinFromHueLight(oLight.id)
          }
          res.json(kelvinValue !== undefined ? kelvinValue : 'Select the device first!')
        } catch (error) {
          res.json('Select the device first!')
        }
      })
  
  RED.httpAdmin.post('/hueUltimate/KNXUltimateLocateHueDevice', async (req, res) => {
        const respondError = (status, message) => {
          res.status(status).json({ error: message })
        }
        try {
          const rawServerId = req.body?.serverId
          const serverId = typeof rawServerId === 'string' ? rawServerId.trim() : (rawServerId ? String(rawServerId).trim() : '')
          if (!serverId) {
            respondError(400, 'Hue bridge not specified')
            return
          }
          const hueServer = RED.nodes.getNode(serverId)
          if (!hueServer) {
            respondError(404, 'Hue bridge not found')
            return
          }
          if (!hueServer.hueManager || !hueServer.hueManager.hueApiV2 || typeof hueServer.hueManager.hueApiV2.put !== 'function') {
            respondError(503, 'Hue bridge not ready')
            return
          }
          if (hueServer.linkStatus !== 'connected') {
            respondError(503, 'Hue bridge is not connected')
            return
          }
          const rawDeviceId = req.body?.deviceId
          const deviceId = typeof rawDeviceId === 'string' ? rawDeviceId.trim() : (rawDeviceId ? String(rawDeviceId).trim() : '')
          if (!deviceId) {
            respondError(400, 'Hue device not specified')
            return
          }
          const rawDeviceType = req.body?.deviceType
          const deviceType = typeof rawDeviceType === 'string' ? rawDeviceType.trim().toLowerCase() : (rawDeviceType ? String(rawDeviceType).trim().toLowerCase() : '')
          let resourceSnapshot = null
          if (typeof hueServer.getHueResourceSnapshot === 'function') {
            try {
              resourceSnapshot = await hueServer.getHueResourceSnapshot(deviceId, { forceRefresh: false })
            } catch (error) {
              resourceSnapshot = null
            }
          }
          const resolvedType = (resourceSnapshot?.type || deviceType || 'light').toLowerCase()
          const targets = []
          const addTarget = (id, type) => {
            if (!id || !type) return
            const trimmedId = typeof id === 'string' ? id.trim() : String(id).trim()
            const trimmedType = typeof type === 'string' ? type.trim().toLowerCase() : String(type).trim().toLowerCase()
            if (trimmedId === '' || trimmedType === '') return
            targets.push({ id: trimmedId, type: trimmedType })
          }
  
          if (resolvedType === 'grouped_light') {
            let lights = []
            if (typeof hueServer.getAllLightsBelongingToTheGroup === 'function') {
              try {
                lights = await hueServer.getAllLightsBelongingToTheGroup(deviceId)
              } catch (error) {
                lights = []
              }
            }
            if (Array.isArray(lights) && lights.length > 0) {
              lights.forEach((lightResource) => {
                const ownerId = lightResource?.owner?.rid
                if (ownerId) {
                  addTarget(ownerId, 'device')
                } else if (lightResource?.id) {
                  addTarget(lightResource.id, 'light')
                }
              })
            }
            if (targets.length === 0 && typeof hueServer.getFirstLightInGroup === 'function') {
              const firstLight = hueServer.getFirstLightInGroup(deviceId)
              const ownerId = firstLight?.owner?.rid
              if (ownerId) {
                addTarget(ownerId, 'device')
              } else if (firstLight?.id) {
                addTarget(firstLight.id, 'light')
              }
            }
          } else if (resolvedType === 'device') {
            addTarget(deviceId, 'device')
          } else {
            const ownerId = resourceSnapshot?.owner?.rid
            if (ownerId) {
              addTarget(ownerId, 'device')
            } else {
              addTarget(deviceId, resolvedType || 'light')
            }
          }
  
          const uniqueTargets = []
          const seenTargets = new Set()
          targets.forEach((target) => {
            const key = `${target.type}:${target.id}`
            if (!seenTargets.has(key)) {
              seenTargets.add(key)
              uniqueTargets.push(target)
            }
          })
  
          if (uniqueTargets.length === 0) {
            respondError(404, 'Hue device resource unavailable')
            return
          }
  
          const sessionKey = `identify:${deviceId}`
          const maxDurationMs = 600000
          const intervalMs = 1000
          const rawAction = (req.body?.action || '').toString().trim().toLowerCase()
          const explicitAction = rawAction === 'start' || rawAction === 'stop' ? rawAction : 'toggle'
  
          const stopIdentifySession = () => {
            if (typeof hueServer.isHueIdentifySessionActive === 'function' && hueServer.isHueIdentifySessionActive(sessionKey)) {
              if (typeof hueServer.stopHueIdentifySession === 'function') {
                hueServer.stopHueIdentifySession(sessionKey, 'manual')
              }
              return true
            }
            return false
          }
  
          if (explicitAction === 'stop') {
            const wasActive = stopIdentifySession()
            res.json({ status: 'stopped', wasActive })
            return
          }
  
          if (explicitAction !== 'start') {
            if (stopIdentifySession()) {
              res.json({ status: 'stopped', wasActive: true })
              return
            }
          }
  
          if (explicitAction === 'start' && typeof hueServer.isHueIdentifySessionActive === 'function' && hueServer.isHueIdentifySessionActive(sessionKey)) {
            res.json({ status: 'started', alreadyActive: true, expiresInMs: maxDurationMs })
            return
          }
  
          if (typeof hueServer.startHueIdentifySession === 'function') {
            const started = await hueServer.startHueIdentifySession({
              sessionKey,
              targets: uniqueTargets,
              intervalMs,
              maxDurationMs
            })
            if (!started) {
              respondError(500, 'Unable to start locate session')
              return
            }
            res.json({ status: 'started', expiresInMs: maxDurationMs })
            return
          }
          const identifyPayload = { identify: { action: 'identify' } }
          for (const target of uniqueTargets) {
            await hueServer.hueManager.hueApiV2.put(`/resource/${target.type}/${target.id}`, identifyPayload)
          }
          res.json({ status: 'started', expiresInMs: 0 })
        } catch (error) {
          try { RED.log.error(`KNXUltimate LocateHueDevice error: ${error.message}`) } catch (err) { }
          res.status(500).json({ error: error.message })
        }
      })
  
  RED.httpAdmin.get('/hueUltimate/KNXUltimateGetResourcesHUE', async (req, res) => {
        try {
          // °°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°
          const serverId = RED.nodes.getNode(req.query.serverId) // Retrieve node.id of the config node.
          if (serverId === null) {
            RED.log.warn('Warn hueUltimate/KNXUltimateGetResourcesHUE serverId is null')
            const jRet = []
            jRet.push({ name: 'PLEASE DEPLOY FIRST: then try again.', id: 'error' })
            res.json({ devices: jRet })
            return
          }
          const refreshFlag = (req.query.forceRefresh || '').toString().toLowerCase()
          const forceRefresh = refreshFlag === '1' || refreshFlag === 'true' || refreshFlag === 'yes'
          const jRet = await serverId.getResources(req.query.rtype, { forceRefresh })
          if (jRet !== undefined) {
            res.json(jRet)
          } else {
            res.json({ devices: [{ name: "I'm still connecting...Try in some seconds" }] })
          }
          // °°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°
        } catch (error) {
          // RED.log.error(`Errore hueUltimate/KNXUltimateGetResourcesHUE non gestito ${error.message}`);
          res.json({ devices: error.message })
          RED.log.error(`Err hueUltimate/KNXUltimateGetResourcesHUE: ${error.message}`)
          // (async () => {
          //   await node.initHUEConnection();
          // })();
        }
      })
}
