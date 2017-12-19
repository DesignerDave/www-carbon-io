const carbon = require('carbon-io')
const __     = carbon.fibers.__(module)
const o      = carbon.atom.o(module).main

<mark js-highlighted-code="hello-1"><mark js-inline-highlight="hello-1">__</mark>(function() {</mark>
  module.exports = o({
    _type: carbon.carbond.Service,
    port: 8888,
    endpoints : {
<mark js-highlighted-code="hello-2">      hello: <mark js-inline-highlight="hello-2">o</mark>({</mark>
  <mark js-highlighted-code="hello-3">      <mark js-inline-highlight="hello-3">_type:</mark> carbon.carbond.Endpoint,</mark>
        <mark class="no-highlight">get</mark>: function(req, res) {
          return { msg: 'Hello, world!' }
        }
      })
    }
  })
})