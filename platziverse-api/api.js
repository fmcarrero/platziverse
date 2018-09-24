'use strict'

const debug = require('debug')('platziverse:api:routes')
const express = require('express')
const db = require('platziverse-db')

const config = require('./config')
const asyncify = require('express-asyncify')
let services, Agent, Metric

const api = asyncify(express.Router())
api.use('*', async (req, res, next) => {
  try {
    if (!services) {
      debug('connected to db')
      services = await db(config.db)
    }
  } catch (e) {
    return next(e)
  }
  Agent = services.Agent
  Metric = services.Metric
  next()
}
)

api.get('/agents', async (req, res, next) => {
  debug('request to agents')
  let agents = []
  try {
    agents = await Agent.findConnected()
  } catch (e) {
    return next(e)
  }
  res.send(agents)
})
api.get('/agent/:uuid', async (req, res, next) => {
  const { uuid } = req.params
  debug(`request to /agent/${uuid}`)
  let agent
  try {
    agent = await Agent.findByUuId(uuid)
  } catch (e) {
    return next(e)
  }
  if (!agent) {
    return next(new Error(`agent not found with uuid ${uuid}`))
  }
  res.send(agent)
})
api.get('/metrics/:uuid', async (req, res, next) => {
  const { uuid } = req.params
  debug(`request to /Metrics/${uuid}`)
  let metrics = []
  try {
    metrics = await Metric.findByAgentUuid(uuid)
  } catch (e) {
    return next(e)
  }
  if (!metrics || metrics.length === 0) {
    return next(new Error(`Metrics not found for agent with uuid ${uuid}`))
  }
  res.send(metrics)
})
api.get('/metrics/:uuid/:type', async (req, res, next) => {
  const { uuid, type } = req.params
  let metrics = []
  try {
    metrics = await Metric.findByTypeAgentUuid(type, uuid)
  } catch (e) {
    return next(e)
  }
  if (!metrics || metrics.length === 0) {
    return next(new Error(`Metrics (${type}) not found for agent with uuid ${uuid}`))
  }
  res.send(metrics)
})

module.exports = api
