'use strict'

const agent = {
  id: 1,
  uuid: 'yyyy-yyy-yy',
  name: 'fixture',
  user: 'platzi',
  hostname: 'test-host',
  pid: 0,
  connected: true,
  createAt: new Date(),
  updateAt: new Date()
}

const agents = [
  agent,
  extend(agent, { id: 2, uuid: 'yyyyyy', connected: false, username: 'test' }),
  extend(agent, { id: 3, uuid: 'yyyyyy-yyx' }),
  extend(agent, { id: 4, uuid: 'yyyyas', username: 'test' })
]
function extend (obj, values) {
  const clone = Object.assign({}, obj)
  return Object.assign(clone, values)
}

module.exports = {
  single: agent,
  all: agents,
  connected: agents.filter(a => a.connected),
  platzi: agents.filter(a => a.username === 'platzi'),
  byUuid: id => agents.filter(a => a.uuid === id).shift(),
  byId: id => agents.filter(a => a.id === id).shift()
}
