const assert = require("assert");
const expect = require("chai").expect;
const request = require("supertest");
const app = require("../ExpressFunctionApp/app");


describe('GET /api/hello', () => {

  it('should return 200 status', () => {
    return request(app)
      .get('/api/hello')
      .then((response) => {
        expect(response.status).to.eql(200)
      })
  });

  it('should return json response', () => {
    return request(app)
      .get('/api/hello')
      .then((response) => {
        expect(response.body).to.eql({"hello": "world"});
        expect(response.headers['content-type']).to.include('application/json');
      })
  });

});


describe('GET /api/docs/', () => {

  it('should return 200 status for existing file', () => {
    return request(app)
      .get('/api/docs/swagger.json')
      .then((response) => {
        expect(response.status).to.eql(200)
      })
  });

  it('should return 404 status for non-existing file', () => {
    return request(app)
      .get('/api/docs/doesnexist.json')
      .then((response) => {
        expect(response.status).to.eql(404)
      })
  });

});

describe('ALL /api/echo/:status?', () => {

  it('should return 200 status', () => {
    return request(app)
      .get('/api/echo')
      .then((response) => {
        expect(response.status).to.eql(200)
      })
  });

  it('should return request headers in echo-headers object, downcased keys', () => {
    return request(app)
      .get('/api/echo')
      .set('Custom-Echo-Header', 'Random-Value-123')
      .set('Another-Echo-Header', 'My value 456')
      .then((response) => {
        expect(response.body['echo-headers']['custom-echo-header']).to.eql('Random-Value-123');
        expect(response.body['echo-headers']['another-echo-header']).to.eql('My value 456');
      })
  });

  it('should return json response', () => {
    return request(app)
      .get('/api/echo')
      .then((response) => {
        expect(response.headers['content-type']).to.include('application/json');
      })
  });

  it('should return query strings in echo-qs object', () => {
    return request(app)
      .get('/api/echo?abc=def&ghi=jkl')
      .then((response) => {
        expect(response.body['echo-qs']['abc']).to.eql('def');
        expect(response.body['echo-qs']['ghi']).to.eql('jkl');
      })
  });

  ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'].forEach((method) => {
    it('should return ' + method + ' method in echo-method key', () => {
      return request(app)
        [method.toLowerCase()]('/api/echo')
        .then((response) => {
          expect(response.body['echo-method']).to.eql(method);
        })
    });
  });


  it('should return json request body in echo-body object', () => {
    return request(app)
      .post('/api/echo')
      .set('Content-Type', 'application/vnd.api+json')
      .send({'key1': 'value1', 'key2': 'value2'})
      .then((response) => {
        expect(response.body['echo-body-content-type']).to.include('application/vnd.api+json');
        expect(response.body['echo-body']).to.eql({'key1': 'value1', 'key2': 'value2'});
      })
  });

  it('should return 400 status for malformed json request body', () => {
    return request(app)
      .post('/api/echo')
      .set('Content-Type', 'application/vnd.api+json')
      .send('{"key1":}')
      .then((response) => {
        expect(response.body['error']['body']).to.eql('{\"key1\":}');
      })
  });

  [200, 400, 401, 403, 404, 405, 410, 500, 502, 503, 504].forEach((status) => {
    it('should return ' + status + ' status if supplied in route parameter', () => {
      return request(app)
        .post('/api/echo/' + status.toString())
        .then((response) => {
          expect(response.status).to.eql(status);
        })
    });
  });
});
