
var chai = require('chai');
var chaiHttp = require('chai-http');
var expect = chai.expect;
chai.use(chaiHttp);

describe("when we issue a 'GET' to /filter with text='aaaa bbbb cccc'", function(){
    it("should return HTTP 200", function(done) {
        chai.request('http://localhost:3000')
            .get('/filter')
            .query({text: 'aa bb ccccc'}).end(function(req, res){
                expect(res.status).to.equal(200);
                done();
            });
    });
});

describe("when we issue a 'GET' to /filter with text='aa bb ccccc'", function(){
    it("should return 'ccccc'", function(done) {
        chai.request('http://localhost:3000')
            .get('/filter')
            .query({text: 'aa bb ccccc'}).end(function(req, res){
                expect(res.text).to.equal('ccccc');
                done();
            });
    });
});

describe("when we issue a 'GET' to /filter with text='aa bb cc'", function(){
    it("should return ''", function(done) {
        chai.request('http://localhost:3000')
            .get('/filter')
            .query({text: 'aa bb cc'}).end(function(req, res){
                expect(res.text).to.equal('');
                done();
            });
    });
});



chai.request('http://mydomain.com')
  .post('/myform')
  .field('_method', 'put')
  .field('username', 'dgonzalez')
  .field('password', '123456').end(...)
