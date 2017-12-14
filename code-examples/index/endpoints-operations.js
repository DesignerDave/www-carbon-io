const carbon = require('carbon-io')
const __     = carbon.fibers.__(module)
const o      = carbon.atom.o(module).main

__(function() {
  module.exports = o({
<mark js-highlighted-code="endpoints-operations-1">    _type: carbon.carbond.<mark js-inline-highlight="endpoints-operations-1">Service</mark>,</mark>
    port: 8888,
    endpoints : {
      hello: o({
<mark js-highlighted-code="endpoints-operations-2">        _type: carbon.carbond.<mark js-inline-highlight="endpoints-operations-2">Endpoint</mark>,</mark>

<mark js-highlighted-code="endpoints-operations-3">        <mark class="no-highlight" js-inline-highlight="endpoints-operations-3">get</mark>: {</mark>
  <mark js-highlighted-code="endpoints-operations-4">        <mark js-inline-highlight="endpoints-operations-4">parameters</mark>: {</mark>
            who: {
              location: 'query',  // Parameters can be query, header, path, or body
              required: false,
              <mark class="no-highlight">default</mark>: 'world',
              schema: { type: 'string' }
            }
          },
<mark js-highlighted-code="endpoints-operations-5">          <mark js-inline-highlight="endpoints-operations-5">responses</mark>: [</mark>
            {
              statusCode: 200,
              description: 'Success',
              schema: {
                type: 'object',
                properties: {
                  msg: { type: 'string' }
                },
                required: [ 'msg' ],
                additionalProperties: false
              }
            }
          ],

<mark js-highlighted-code="endpoints-operations-6">          <mark js-inline-highlight="endpoints-operations-6">service</mark>: function(req, res) {</mark>
            return { msg: `Hello ${req.parameters.who}!` }
          }
        }
      })
    }
  })
})