
const carbon = require('carbon-io')
<mark js-highlighted-code="hello-1">const <mark js-inline-highlight="hello-1">__</mark>     = carbon.fibers.__(module)</mark>
<mark js-highlighted-code="hello-2">const <mark js-inline-highlight="hello-2">o</mark>      = carbon.atom.o(module).main</mark>

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
