import chai from 'chai';
import request, { Response } from 'superagent';
import ChaiSuperagent from 'chai-superagent';

chai.use(ChaiSuperagent());
chai.use(ChaiSuperagent({}));
chai.use(ChaiSuperagent({ strict: true }));

const agent = request.agent();

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
