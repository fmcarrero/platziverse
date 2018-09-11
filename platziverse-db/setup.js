'use strict'

const db = require('./')
const debug = require('debug')('platziverse:db:setup')
async function setup () {
  const config = {
    database: process.env.DB_NAME || 'platziverse',
    username: process.env.DB_USER || 'platzi',
    password: process.env.DB_PASS || 'platzi',
    host: process.env.DB_HOST || 'localhost',
    dialect: 'postgres',
    logging: s => debug(s),
    setup: true
  }
  await db(config).catch(handleFatalEerror)
  console.log('success')
  process.exit(0)
}
function handleFatalEerror (err) {
  console.error(err.message)
  console.error(err.stack)
  process.exit(1)
}
setup()
