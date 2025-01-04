import { createServer } from 'node:http';
import { env } from 'node:process';
import { expect, use } from 'chai';
import request from 'superagent';
import prefix from 'superagent-prefix';

// eslint-disable-next-line import/no-unresolved
import superagent from 'chai-superagent';

use(superagent());

const BASEURL = env.HTTPBIN_BASEURL ?? 'https://httpbin.org';

describe('superagent', () => {
  const isNode = typeof process === 'object';
  // eslint-disable-next-line unicorn/prefer-global-this
  const isBrowser = typeof window === 'object';

  describe('Browser and Node.js', () => {
    it('can request a web page', () => request
      .get(`${BASEURL}/html`)
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
      .get(`${BASEURL}/get`)
      .then((res) => {
        expect(res).to.have.status(200);
        expect(res).to.be.json; // eslint-disable-line no-unused-expressions
        expect(res).to.not.be.html; // eslint-disable-line no-unused-expressions
        expect(res).to.not.be.text; // eslint-disable-line no-unused-expressions
        expect(res.text).to.be.a('string').with.length.above(0);
        expect(res.body).to.be.an('object');
      }));

    it('can read response headers', () => request
      .get(`${BASEURL}/response-headers`)
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
      .get(`${BASEURL}/status/400`)
      .ok((res) => res.status === 400)
      .then((res) => {
        expect(res).to.have.status(400);
      }));

    it('should reject non valid instances in strict mode', () => {
      expect(
        () => expect({}).to.have.status(200),
      ).to.throw(Error, 'expected {} to be an instance of Response');

      expect(
        () => expect({}).to.be.json,
      ).to.throw(Error, 'expected {} to be an instance of Request or Response');

      expect(
        () => expect({}).to.be.html,
      ).to.throw(Error, 'expected {} to be an instance of Request or Response');

      expect(
        () => expect({}).to.be.text,
      ).to.throw(Error, 'expected {} to be an instance of Request or Response');

      expect(
        () => expect({}).to.have.header('Pragma', 'test1'),
      ).to.throw(Error, 'expected {} to be an instance of Request or Response');

      expect(
        () => expect({}).to.redirect,
      ).to.throw(Error, 'expected {} to be an instance of Response');

      expect(
        () => expect({}).to.redirectTo('foo'),
      ).to.throw(Error, 'expected {} to be an instance of Response');

      expect(
        () => expect({}).to.have.param('foo', 'bar'),
      ).to.throw(Error, 'expected {} to be an instance of Request');

      expect(
        () => expect({}).to.have.cookie('foo', 'bar'),
      ).to.throw(Error, 'expected {} to be an instance of Request');

      expect(
        () => expect({}).to.have.cookie('foo', 'bar'),
      ).to.throw(Error, 'expected {} to be an instance of Request');

      expect(
        () => expect({}).to.have.charset('utf8'),
      ).to.throw(Error, 'expected {} to be an instance of Request');
    });
  });

  if (isNode) {
    describe('Node.js', () => {
      it('can request an already existing url', (done) => {
        const server = createServer((req, res) => {
          expect(req.headers['x-api-key']).to.equal('test2');
          res.writeHeader(200, { 'content-type': 'text/plain' });
          res.end('hello world');
        });

        server.listen(0, () => {
          const { address, port } = server.address();

          request
            .get(`http://${address.replace('::', 'localhost')}:${port}/`)
            .set('X-API-Key', 'test2')
            .end((err, res) => {
              expect(res).to.have.status(200);
              expect(res.text).to.equal('hello world');
              server.once('close', () => { done(err); });
              server.close();
            });
        });
      });

      it('agent can be used to persist cookies', (done) => {
        const server = createServer((req, res) => {
          res.setHeader('Set-Cookie', 'mycookie=test');
          res.writeHeader(200, { 'content-type': 'text/plain' });
          res.end(`your cookie: ${req.headers.cookie}`);
        });

        server.listen(0, () => {
          const { address, port } = server.address();
          const agent = request.agent().use(prefix(`http://${address.replace('::', 'localhost')}:${port}`));

          agent
            .get('/')
            .then((res) => {
              expect(res.headers['set-cookie'][0]).to.equal('mycookie=test');
              expect(res.text).to.equal('your cookie: undefined');
            })
            .then(() => agent.get('/'))
            .then((res) => {
              expect(res.text).to.equal('your cookie: mycookie=test');
              server.once('close', () => { done(); });
              server.close();
            });
        });
      });
    });
  }
});
