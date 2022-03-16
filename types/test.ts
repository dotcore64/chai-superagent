import fs from 'fs';
import http from 'http';
import chai from 'chai';
import request, { Response } from 'superagent';
import supertest from 'supertest';
import ChaiHttp from './index';

chai.use(ChaiHttp);

declare const app: http.Server;

supertest(app).get('/');
request('http://localhost:8080').get('/');

supertest(app)
    .put('/user/me')
    .set('X-API-Key', 'foobar')
    .send({ password: '123', confirmPassword: '123' });

supertest(app)
    .post('/user/me')
    .field('_method', 'put')
    .field('password', '123')
    .field('confirmPassword', '123');

supertest(app)
    .post('/user/avatar')
    .attach('imageField', fs.readFileSync('avatar.png'), 'avatar.png');

supertest(app)
    .get('/protected')
    .auth('user', 'pass');

// HTTPS request, from: https://github.com/visionmedia/superagent/commit/6158efbf42cb93d77c1a70887284be783dd7dabe
const ca = fs.readFileSync('ca.cert.pem');
const key = fs.readFileSync('key.pem');
const cert = fs.readFileSync('cert.pem');
const callback = (err: any, res: Response) => {};

supertest(app)
    .post('/secure')
    .ca(ca)
    .key(key)
    .cert(cert)
    .end(callback);

const pfx = fs.readFileSync('cert.pfx');
supertest(app)
    .post('/secure')
    .pfx(pfx)
    .end(callback);

supertest(app)
    .get('/search')
    .query({ name: 'foo', limit: 10 });

supertest(app)
    .get('/download')
    .buffer()
    .parse((res, cb) => {
        let data = '';
        res.setEncoding('binary');
        res.on('data', (chunk: any) => { data += chunk; });
        res.on('end', () => { cb(undefined, new Buffer(data, 'binary')); });
    });

supertest(app)
    .put('/user/me')
    .send({ passsword: '123', confirmPassword: '123' })
    .end((err: any, res: Response) => {
        chai.expect(err).to.be.null;
        chai.expect(res).to.have.status(200);
    });

supertest(app)
    .put('/user/me')
    .send({ passsword: '123', confirmPassword: '123' })
    .then((res: Response) => chai.expect(res).to.have.status(200))
    .catch((err: any) => { throw err; });

const agent = supertest.agent(app);

agent
    .post('/session')
    .send({ username: 'me', password: '123' })
    .then((res: Response) => {
        chai.expect(res).to.have.cookie('sessionid');
        // The `agent` now has the sessionid cookie saved, and will send it
        // back to the server in the next request:
        return agent.get('/user/me')
            .then((res: Response) => chai.expect(res).to.have.status(200));
    });

function test1() {
    const req = request.get('https://google.com/');
    req.then((res: Response) => {
        chai.expect(res).to.have.status(200);
        chai.expect(res).to.have.header('content-type', 'text/plain');
        chai.expect(res).to.have.header('content-type', /^text/);
        chai.expect(res).to.have.headers;
        chai.expect('127.0.0.1').to.be.an.ip;
        chai.expect(res).to.be.json;
        chai.expect(res).to.be.html;
        chai.expect(res).to.be.text;
        chai.expect(res).to.redirect;
        chai.expect(res).to.redirectTo('http://example.com');
        chai.expect(res).to.have.param('orderby');
        chai.expect(res).to.have.param('orderby', 'date');
        chai.expect(res).to.not.have.param('limit');
        chai.expect(req).to.have.cookie('session_id');
        chai.expect(req).to.have.cookie('session_id', '1234');
        chai.expect(req).to.not.have.cookie('PHPSESSID');
        chai.expect(res).to.have.cookie('session_id');
        chai.expect(res).to.have.cookie('session_id', '1234');
        chai.expect(res).to.not.have.cookie('PHPSESSID');
        chai.expect(res.body).to.have.property('version', '4.0.0');
        chai.expect(res.text).to.equal('<html><body></body></html>');
    }, (err: any) => {
        throw err;
    });
}
