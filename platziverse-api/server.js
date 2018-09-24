'use strict'

const http = require('http')
const chalk = require('chalk')
const expres = require('express')
const port = process.env.PORT || 3000

const debug = require('debug')('platziverse:api:routes')
const api = require('./api')
const asyncify = require('express-asyncify')
const app = asyncify(expres())
const server = http.createServer(app)

app.use('/api', api)

function handleFatalEerror (err) {
  console.error(`${chalk.red('[fatal error]')} ${err.message}`)
  console.error(err.stack)
  process.exit(1)
}
// Express Error Handler
app.use((err, req, res, next) => {
  debug(`Error: ${err.message}`)

  if (err.message.match(/not found/)) {
    return res.status(404).send({ error: err.message })
  }

  res.status(500).send({ error: err.message })
})

if (!module.parent) {
  process.on('uncaughtException', handleFatalEerror)
  process.on('unhandledRejection', handleFatalEerror)
  server.listen(port, () => {
    console.log(`${chalk.green('[platziverse-api]')} server listening on port ${port}`)
  })
}

module.exports = server
