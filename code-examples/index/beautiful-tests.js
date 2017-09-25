__(function() {
  module.exports = o({
    _type: carbon.carbond.test.ServiceTest,
    name: “ZipcodeServiceTest”,
    service: _o(“../lib/ZipcodeService”),

    setup: function() {
      carbon.carbond.test.ServiceTest.prototype.setup.call(this)
      this.service.db.command({dropDatabase: 1})
    },

    teardown: function() {
      this.service.db.command({dropDatabase: 1})
      carbon.carbond.test.ServiceTest.prototype.teardown.call(this)
    },

    tests: [
      // Test POST by inserting some zipcodes
      {
        reqSpec: {
          url: ‘/zipcodes’,
          method: “POST”,
          body: { “_id”: “94110”, state: “CA” }
        },
        resSpec: {
          statusCode: 201,
        }
      },

      // Test invalid POST. These should get a 400 status code (Bad Request)
      {
        reqSpec: {
          url: ‘/zipcodes’,
          method: “POST”,
          body: { _id: “1”, state: “NY” } // Malformed zipcode
        },
        resSpec: {
          statusCode: 400
        }
      }
    ]
  })
})