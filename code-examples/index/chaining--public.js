
const carbon = require('carbon-io')
const __     = carbon.fibers.__(module)
const o      = carbon.atom.o(module).main
const _o     = carbon.bond._o(module)

__(function() {
  module.exports = o({
    _type: carbon.carbond.Service,
    port: 8888,
<mark js-highlighted-code="chaining-public-1">    privateHelloService: <mark js-inline-highlight="chaining-public-1">_o</mark>('http://localhost:9999'),</mark>
    
    endpoints : {
      hello: o({
        _type: carbon.carbond.Endpoint,
        
        <mark class="no-highlight">get</mark>: {
          responses: [
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
          
          service: function(req, res) {
            return this.getService().privateHelloService.getEndpoint('hello').<mark class="no-highlight">get</mark>().body
          }
        }

      })
    }

  })
})
