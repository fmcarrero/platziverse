'use strict'

const db = require('../')
const chalk = require('chalk')
async function run () {
  const config = {
    database: process.env.DB_NAME || 'platziverse',
    username: process.env.DB_USER || 'platzi',
    password: process.env.DB_PASS || 'platzi',
    host: process.env.DB_HOST || 'localhost',
    dialect: 'postgres'
  }
  const { Agent, Metric } = await db(config).catch(handleFatalEerror)

  const agent = await Agent.createOrUpdate({
    uuid: 'yyy',
    name: 'test',
    username: 'test',
    hostname: 'test',
    pid: 1,
    connected: true
  }).catch(handleFatalEerror)
  console.log(agent)

  const agents = Agent.findAll().catch(handleFatalEerror)
  console.log(agents)

  const metrics = await Metric.findByAgentUuid(agent.uuid).catch(handleFatalEerror)
  console.log('metricas')
  console.log(metrics)

  const metric = await Metric.create(agent.uuid,{
    type : 'memory',
    value :'300'
  }).catch(handleFatalEerror)
  console.log('metric new ')
  console.log(metric)
  const metricsByType = await Metric.findByTypeAgentUuid('memory',agent.uuid).catch(handleFatalEerror)
  console.log('metricsByType')
  console.log(metricsByType)


}
function handleFatalEerror (err) {
  console.error(`${chalk.red('[fatal error]')} ${err.message}`)
  console.error(err.stack)
  process.exit(1)
}
run()
