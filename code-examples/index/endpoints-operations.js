
const carbon = require('carbon-io')
const __     = carbon.fibers.__(module)
const o      = carbon.atom.o(module).main
const _o     = carbon.bond._o(module)

__(function() {
  module.exports = o({
    _type: carbon.carbond.Service,
    port: 8888,
    endpoints : {
      hello: o({
        _type: carbon.carbond.Endpoint,

        <mark class="no-highlight">get</mark>: {
          parameters: { 
            who: {
              location: 'query',  // Parameters can be passed via query, header, path, or body
              required: false,
              <mark class="no-highlight">default</mark>: 'world',
              schema: { type: 'string' } 
            }           
          },
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
            return { msg: `Hello ${req.parameters.who}!` }
          }
        }
      })
    }
  })
})
