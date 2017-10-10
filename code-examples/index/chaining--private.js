
var carbon = require('carbon-io')
var __     = carbon.fibers.__(module)
var _o     = carbon.bond._o(module)
var o      = carbon.atom.o(module).main

__(function() {
  module.exports = o({

    _type: carbon.carbond.Service,
    port: 9999,

    endpoints : {
      hello: o({
        _type: carbon.carbond.Endpoint,
        
        get: {
          responses: [
            {
              statusCode: 200,
              description: "Success",
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
            return { msg: "Hello world!" }
          }
        }

      })
    }

  })
})
