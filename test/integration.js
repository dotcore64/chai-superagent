import { createServer } from 'http';
import { expect } from 'chai';
import request from 'superagent';
import supertest from 'supertest';

describe('superagent', () => {
  const isNode = typeof process === 'object';
  const isBrowser = typeof window === 'object';

  describe('Browser and Node.js', () => {
    it('can request a web page', () => request
      .get('https://httpbin.org/html')
      .then((res) => {
        expect(res).to.have.status(200);
        expect(res).to.be.html; // eslint-disable-line no-unused-expressions
        expect(res).to.not.be.text; // eslint-disable-line no-unused-expressions
        expect(res).to.not.be.json; // eslint-disable-line no-unused-expressions
        expect(res.text).to.be.a('string').with.length.above(0);

        // Slightly different behavior in SuperAgent in Node/browsers
        isNode && expect(res.body).to.deep.equal({}); // eslint-disable-line no-unused-expressions
        isBrowser && expect(res.body).to.be.null; // eslint-disable-line no-unused-expressions
      }));

    it('can request JSON data', () => request
      .get('https://httpbin.org/get')
      .then((res) => {
        expect(res).to.have.status(200);
        expect(res).to.be.json; // eslint-disable-line no-unused-expressions
        expect(res).to.not.be.html; // eslint-disable-line no-unused-expressions
        expect(res).to.not.be.text; // eslint-disable-line no-unused-expressions
        expect(res.text).to.be.a('string').with.length.above(0);
        expect(res.body).to.be.an('object');
      }));

    it('can read response headers', () => request
      .get('https://httpbin.org/response-headers')
      .query({ 'content-type': 'application/json' })
      .query({ pragma: 'test1' })
      .query({ location: 'test2' })
      .query({ 'x-api-key': 'test3' })
      .then((res) => {
        expect(res).to.have.status(200);

        // Content-Type and Pragma are supported on Node and browser
        expect(res).to.be.json; // eslint-disable-line no-unused-expressions
        expect(res).to.have.header('Content-Type', /json$/);
        expect(res).to.have.header('Pragma', 'test1');

        // When running in a browser, only "simple" headers are readable
        // https://www.w3.org/TR/cors/#simple-response-header
        isNode && expect(res).to.have.header('Location', 'test2'); // eslint-disable-line no-unused-expressions
        isNode && expect(res).to.have.header('X-API-Key', 'test3'); // eslint-disable-line no-unused-expressions
        isBrowser && expect(res).to.not.have.header('Location'); // eslint-disable-line no-unused-expressions
        isBrowser && expect(res).to.not.have.header('X-API-Key'); // eslint-disable-line no-unused-expressions
      }));

    it('succeeds when response has an error status', () => request
      .get('https://httpbin.org/status/400')
      .ok((res) => res.status === 400)
      .then((res) => {
        expect(res).to.have.status(400);
      }));
  });

  if (isNode) {
    describe('Node.js', () => {
      it('can test a supertest response', () => {
        const app = (req, res) => {
          expect(req.headers['x-api-key']).to.equal('testing');
          res.writeHeader(200, { 'content-type': 'text/plain' });
          res.end('hello universe');
        };

        return supertest(app).get('/')
          .set('X-API-Key', 'testing')
          .then((res) => {
            expect(res).to.have.status(200);
            expect(res.text).to.equal('hello universe');
          });
      });

      it('can request an already existing url', (done) => {
        const server = createServer((req, res) => {
          expect(req.headers['x-api-key']).to.equal('test2');
          res.writeHeader(200, { 'content-type': 'text/plain' });
          res.end('hello world');
        });

        server.listen(0, () => {
          request
            .get(`http://127.0.0.1:${server.address().port}/`)
            .set('X-API-Key', 'test2')
            .end((err, res) => {
              expect(res).to.have.status(200);
              expect(res.text).to.equal('hello world');
              server.once('close', () => { done(err); });
              server.close();
            });
        });
      });

      it('agent can be used to persist cookies', () => {
        const app = (req, res) => {
          res.setHeader('Set-Cookie', 'mycookie=test');
          res.writeHeader(200, { 'content-type': 'text/plain' });
          res.end(`your cookie: ${req.headers.cookie}`);
        };
        const agent = supertest.agent(app);

        return agent
          .get('/')
          .then((res) => {
            expect(res.headers['set-cookie'][0]).to.equal('mycookie=test');
            expect(res.text).to.equal('your cookie: undefined');
          })
          .then(() => agent.get('/'))
          .then((res) => {
            expect(res.text).to.equal('your cookie: mycookie=test');
          });
      });
    });
  }
});
