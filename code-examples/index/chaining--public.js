
const carbon = require('carbon-io')
const __     = carbon.fibers.__(module)
const o      = carbon.atom.o(module).main
<mark js-highlighted-code="chaining-public-1">const <mark js-inline-highlight="chaining-public-1">_o</mark>     = carbon.bond._o(module)</mark>

__(function() {
  module.exports = o({
    _type: carbon.carbond.Service,
    port: 8888,
    privateHelloService: _o('http://localhost:9999'), 
    
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
