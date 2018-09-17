'use strict'

const debug = require('debug')('platziverse:mqtt')
const mosca = require('mosca')
const redis = require('redis')
const chalk = require('chalk')
const db = require('platziverse-db')
const { parsePayload } = require('./util')
const backed = {
  type: 'redis',
  redis,
  return_buffers: true
}

const settigs = {
  port: 1883,
  backed
}
const config = {
  database: process.env.DB_NAME || 'platziverse',
  username: process.env.DB_USER || 'platzi',
  password: process.env.DB_PASS || 'platzi',
  host: process.env.DB_HOST || 'localhost',
  dialect: 'postgres',
  logging: s => debug(s)
}

const server = new mosca.Server(settigs)
const clients = new Map()

let Agent, Metric
server.on('clientConnected', client => {
  debug(`client connected: ${client.id}`)
  clients.set(client.id, null)
})

server.on('clientDisconnected', async client => {
  debug(`client disconnected: ${client.id}`)
  const agent = clients.get(client.id)
  if (agent) {
    agent.connected = false
    try {
      await Agent.createOrUpdate(agent)
    } catch (e) {
      return handleError(e)
    }
    clients.delete(client.id)
    server.publish({
      topic: 'agent/disconnected',
      payload: JSON.stringify({
        agent: {
          uuid: agent.uuid
        }
      })
    })
    debug(`client: ${client.id} marcado como desconectado `)
  }
})

server.on('published', async (packet, client) => {
  debug(`received: ${packet.topic}`)
  switch (packet.topic) {
    case 'agent/connected':
    case 'agent/disconnected':
      debug(`payload: ${packet.payload}`)
      break
    case 'agent/message':
      const payload = parsePayload(packet.payload)
      if (payload) {
        payload.agent.connected = true
        let agent
        try {
          agent = await Agent.createOrUpdate(payload.agent)
        } catch (e) {
          return handleError(e)
        }
        debug(`agent : ${agent.uuid} saved`)
        // notificar que el agente fue conectado
        if (!clients.get(client.id)) {
          clients.set(client.id, agent)
          server.publish  ({
            topic: 'agent/connected',
            payload: JSON.stringify({
              agent: {
                uuid: agent.uuid,
                name: agent.name,
                hostname: agent.hostname,
                pid: agent.pid,
                connected: agent.connected
              }
            })
          })
        }
        // almacenar las metricas
        for (let metric of payload.metrics) {
          let m
          try {
            m = await Metric.create(agent.uuid, metric)
          } catch (e) {
            return handleError(e)
          }
          debug(`metric : ${m.id} saved on agent ${agent.uuid}`)
        }
      }
      break
  }
})

server.on('error', handleFatalEerror)

process.on('uncaughtException', handleFatalEerror)
process.on('unhandledRejection', handleFatalEerror)

server.on('ready', async () => {
  const services = await db(config).catch(handleFatalEerror)
  Agent = services.Agent
  Metric = services.Metric
  console.log(`${chalk.green('[plaztiverse-mqtt] server is running')}`)
})

function handleFatalEerror (err) {
  console.error(`${chalk.red('[fatal error]')} ${err.message}`)
  console.error(err.stack)
  process.exit(1)
}
function handleError (err) {
  console.error(`${chalk.red('[error]')} ${err.message}`)
  console.error(err.stack)
}
