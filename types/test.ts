import { use, expect } from 'chai';
import request, { Response } from 'superagent';
import ChaiSuperagent from 'chai-superagent';

use(ChaiSuperagent());
use(ChaiSuperagent({}));
use(ChaiSuperagent({ strict: true }));

const agent = request.agent();

agent
    .post('/session')
    .send({ username: 'me', password: '123' })
    .then((res: Response) => {
        expect(res).to.have.cookie('sessionid');
        // The `agent` now has the sessionid cookie saved, and will send it
        // back to the server in the next request:
        return agent.get('/user/me')
            .then((res: Response) => expect(res).to.have.status(200));
    });

function test1() {
    const req = request.get('https://google.com/');
    req.then((res: Response) => {
        expect(res).to.have.status(200);
        expect(res).to.have.header('content-type', 'text/plain');
        expect(res).to.have.header('content-type', /^text/);
        expect(res).to.have.headers;
        expect(res).to.be.json;
        expect(res).to.be.html;
        expect(res).to.be.text;
        expect(res).to.redirect;
        expect(res).to.redirectTo('http://example.com');
        expect(res).to.have.param('orderby');
        expect(res).to.have.param('orderby', 'date');
        expect(res).to.not.have.param('limit');
        expect(req).to.have.cookie('session_id');
        expect(req).to.have.cookie('session_id', '1234');
        expect(req).to.not.have.cookie('PHPSESSID');
        expect(res).to.have.cookie('session_id');
        expect(res).to.have.cookie('session_id', '1234');
        expect(res).to.not.have.cookie('PHPSESSID');
        expect(res.body).to.have.property('version', '4.0.0');
        expect(res.text).to.equal('<html><body></body></html>');
    }, (err: any) => {
        throw err;
    });
}
