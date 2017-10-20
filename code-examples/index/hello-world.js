
const carbon = require('carbon-io')
const __     = carbon.fibers.__(module)
const o      = carbon.atom.o(module).main

__(function() {
  module.exports = o({
    _type: carbon.carbond.Service,
    port: 8888,
    endpoints : {
      hello: o({
        _type: carbon.carbond.Endpoint,
        <mark class="no-highlight">get</mark>: function(req, res) {
          return { msg: 'Hello, world!' }
        }
      })
    }
  })
})
