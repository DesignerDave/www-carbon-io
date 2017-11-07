const carbon = require('carbon-io')
const __     = carbon.fibers.__(module)
const _o     = carbon.bond._o(module)
const o      = carbon.atom.o(module).main
const assert = require('assert')

__(function() {
  module.exports = o({
    _type: carbon.carbond.test.ServiceTest,
    name: 'ZipcodeServiceTest',
    service: _o('../lib/ZipcodeService'),

    tests: [
      // Test PUT by inserting some zipcodes
      {
        reqSpec: {
          url: '/zipcodes/94114',
          method: 'PUT',
          body: { _id: '94114', state: 'CA' }
        },
        resSpec: {
          statusCode: 201,
        }
      },

      // Test GET by looking up single zipcode
      {
        reqSpec: {
          url: '/zipcodes/94114',
          method: 'GET'
        },
        resSpec: {
          statusCode: 200,
          body: { _id: '94114', state: 'CA' }
        }
      }
    ],

    setup: function() {
      carbon.carbond.test.ServiceTest.prototype.setup.call(this)
      this.service.db.command({dropDatabase: 1})
    },

    teardown: function() {
      this.service.db.command({dropDatabase: 1})
      carbon.carbond.test.ServiceTest.prototype.teardown.call(this)
    }
  })
})