import { expect, use } from 'chai';
import { agent as Agent } from 'superagent';

// eslint-disable-next-line import/no-unresolved
import superagent from 'chai-superagent';

use(superagent({ strict: false }));

describe('assertions', () => {
  it('#status property "status"', () => {
    const res = { status: 200 };
    expect(res).to.have.status(200);

    expect(() => {
      expect(res).to.not.have.status(200);
    }).to.throw('expected { status: 200 } to not have status code 200');

    expect(() => {
      expect({}).to.not.to.have.status(200);
    }).to.throw("expected {} to have keys 'status', or 'statusCode'");
  });

  it('#status property "statusCode"', () => {
    expect({ statusCode: 200 }).to.have.status(200);
  });

  it('#status property "status" should work with inheritance', () => {
    class TestError {}
    TestError.prototype.status = 404;
    const testError = new TestError();
    expect(testError).to.have.status(404);
  });

  it('#header test existence', () => {
    const req = { headers: { foo: 'bar' } };
    const res = {
      getHeader(key) {
        return key === 'foo' ? 'bar' : undefined;
      },
    };

    expect(req).to.have.header('foo');
    expect(req).to.not.have.header('bar');

    expect(res).to.have.header('foo');
    expect(res).to.not.have.header('bar');

    expect(() => {
      expect(req).to.have.header('bar');
    }).to.throw('expected header \'bar\' to exist');

    expect(() => {
      expect(res).to.have.header('bar');
    }).to.throw('expected header \'bar\' to exist');
  });

  it('#header test value', () => {
    const req = { headers: { foo: 'bar' } };
    const res = {
      getHeader() {
        return 'foo';
      },
    };

    expect(req).to.have.header('foo', 'bar');
    expect(res).to.have.header('bar', 'foo');
    expect(res).to.have.header('bar', /^fo/);

    expect(() => {
      expect(req).to.not.have.header('foo', 'bar');
    }).to.throw('expected header \'foo\' to not have value bar');

    expect(() => {
      expect(res).to.not.have.header('bar', 'foo');
    }).to.throw('expected header \'bar\' to not have value foo');

    expect(() => {
      expect(res).to.not.have.header('bar', /^fo/);
    }).to.throw('expected header \'bar\' not to match /^fo/ but got \'foo\'');
  });

  it('#header case insensitive', () => {
    const req = { headers: { foo: 'bar' } };
    const res = {
      getHeader() {
        return 'foo';
      },
    };

    expect(res).to.have.header('Foo');
    expect(res).to.have.header('Bar');
    expect(req).to.have.header('FoO', 'bar');
    expect(res).to.have.header('BAr', 'foo');
  });

  it('#headers', () => {
    const req = { headers: { foo: 'bar' } };
    const res = {
      getHeader() {
        return 'foo';
      },
    };

    expect(req).to.have.headers; // eslint-disable-line no-unused-expressions
    expect(res).to.have.headers; // eslint-disable-line no-unused-expressions

    expect(() => {
      expect(req).to.not.have.headers; // eslint-disable-line no-unused-expressions
    }).to.throw('expected { headers: { foo: \'bar\' } } to not have headers or getHeader method');

    expect(() => {
      expect(res).to.not.have.headers; // eslint-disable-line no-unused-expressions
    }).to.throw(/expected .*getHeader.* to not have headers or getHeader method/);
  });

  it('#json', () => {
    const req = { headers: { 'content-type': ['application/json'] } };
    const res = {
      getHeader() {
        return 'application/json';
      },
    };

    expect(req).to.be.json; // eslint-disable-line no-unused-expressions
    expect(res).to.be.json; // eslint-disable-line no-unused-expressions

    expect(() => {
      expect(req).to.not.be.json; // eslint-disable-line no-unused-expressions
    }).to.throw('expected [ \'application/json\' ] to not include \'application/json\'');

    expect(() => {
      expect(res).to.not.be.json; // eslint-disable-line no-unused-expressions
    }).to.throw('expected \'application/json\' to not include \'application/json\'');
  });

  it('#text', () => {
    const req = { headers: { 'content-type': ['text/plain'] } };
    const res = {
      getHeader() {
        return 'text/plain';
      },
    };

    expect(req).to.be.text; // eslint-disable-line no-unused-expressions
    expect(res).to.be.text; // eslint-disable-line no-unused-expressions

    expect(() => {
      expect(req).to.not.be.text; // eslint-disable-line no-unused-expressions
    }).to.throw('expected [ \'text/plain\' ] to not include \'text/plain\'');

    expect(() => {
      expect(res).to.not.be.text; // eslint-disable-line no-unused-expressions
    }).to.throw('expected \'text/plain\' to not include \'text/plain\'');
  });

  it('#html', () => {
    const req = { headers: { 'content-type': ['text/html'] } };
    const res = {
      getHeader() {
        return 'text/html';
      },
    };

    expect(req).to.be.html; // eslint-disable-line no-unused-expressions
    expect(res).to.be.html; // eslint-disable-line no-unused-expressions

    expect(() => {
      expect(req).to.not.be.html; // eslint-disable-line no-unused-expressions
    }).to.throw('expected [ \'text/html\' ] to not include \'text/html\'');

    expect(() => {
      expect(res).to.not.be.html; // eslint-disable-line no-unused-expressions
    }).to.throw('expected \'text/html\' to not include \'text/html\'');
  });

  it('#redirect', () => {
    expect({ status: 200 }).to.not.redirect; // eslint-disable-line no-unused-expressions

    [301, 302, 303, 307, 308].forEach((status) => {
      expect({ status }).to.redirect; // eslint-disable-line no-unused-expressions
    });

    expect({ // eslint-disable-line no-unused-expressions
      status: 200,
      redirects: ['http://example.com'],
    }).to.redirect;

    expect({ // eslint-disable-line no-unused-expressions
      status: 200,
      redirects: [],
    }).to.not.redirect;

    expect(() => {
      expect({ status: 200 }).to.redirect; // eslint-disable-line no-unused-expressions
    }).to.throw('expected redirect with 30X status code but got 200');

    expect(() => {
      expect({ status: 301 }).to.not.redirect; // eslint-disable-line no-unused-expressions
    }).to.throw('expected not to redirect but got 301 status');
  });

  it('#redirectTo', () => {
    expect({ status: 301, headers: { location: 'foo' } }).to.redirectTo('foo');
    expect({ status: 301, headers: { location: 'bar' } }).to.not.redirectTo('foo');
    expect({ status: 200, redirects: ['bar'] }).to.redirectTo('bar');
    expect({ status: 200, redirects: ['bar'] }).to.not.redirectTo('foo');
    expect({ status: 200, redirects: ['foo'] }).to.redirectTo(/foo/);
    expect({ status: 200, redirects: ['foo/bar?baz=qux'] }).to.redirectTo(/^foo\/bar/);

    expect(() => {
      expect({ status: 301, headers: { location: 'foo' } }).to.not.redirectTo('foo');
    }).to.throw('expected header \'location\' to not have value foo');

    expect(() => {
      expect({ status: 301, headers: { location: 'bar' } }).to.redirectTo('foo');
    }).to.throw('expected header \'location\' to have value foo');

    expect(() => {
      expect({ status: 200, redirects: ['bar', 'baz'] }).to.redirectTo('foo');
    }).to.throw('expected redirect to foo but got bar then baz');

    expect(() => {
      expect({ status: 301, headers: { location: 'foo' } }).to.not.redirectTo(/foo/);
    }).to.throw('expected header \'location\' not to match /foo/ but got \'foo\'');

    expect(() => {
      expect({ status: 200, redirects: ['bar', 'baz'] }).to.redirectTo(/foo/);
    }).to.throw('expected redirect to /foo/ but got bar then baz');
  });

  it('#param', () => {
    const req = { url: '/test?x=y&foo=bar' };
    expect(req).to.have.param('x');
    expect(req).to.have.param('foo');
    expect(req).to.have.param('x', 'y');
    expect(req).to.have.param('foo', 'bar');
    expect(req).to.not.have.param('bar');
    expect(req).to.not.have.param('y');
    expect(req).to.not.have.param('x', 'z');
    expect(req).to.not.have.param('foo', 'baz');

    expect(() => {
      expect(req).to.not.have.param('foo');
    }).to.throw(/expected .* to not have property 'foo'/);

    expect(() => {
      expect(req).to.not.have.param('foo', 'bar');
    }).to.throw(/expected .* to not have property 'foo' of 'bar'/);
  });

  it('#param (nested)', () => {
    const req = { url: '/test?form[name]=jim&form[lastName]=bob' };
    expect(req).to.have.param('form');
    expect(req).to.have.nested.param('form.name');
    expect(req).to.have.nested.param('form.name', 'jim');
    expect(req).to.have.nested.param('form.lastName');
    expect(req).to.have.nested.param('form.lastName', 'bob');
    expect(req).to.not.have.param('bar');
    expect(req).to.not.have.nested.param('form.bar');
    expect(req).to.not.have.nested.param('form.name', 'sue');

    expect(() => {
      expect(req).to.not.have.nested.param('form.name');
    }).to.throw(/expected .* to not have nested property 'form.name'/);

    expect(() => {
      expect(req).to.not.have.nested.param('form.lastName', 'bob');
    }).to.throw(/expected .* to not have nested property 'form.lastName' of 'bob'/);
  });

  it('#cookie', () => {
    const res = {
      headers: {
        'set-cookie': [
          'name=value',
          'name2=value2; Expires=Wed, 09 Jun 2024 10:18:14 GMT',
        ],
      },
    };
    expect(res).to.have.cookie('name');
    expect(res).to.have.cookie('name2');
    expect(res).to.have.cookie('name', 'value');
    expect(res).to.have.cookie('name2', 'value2');
    expect(res).to.not.have.cookie('bar');
    expect(res).to.not.have.cookie('name2', 'bar');

    expect(() => {
      expect(res).to.not.have.cookie('name');
    }).to.throw('expected cookie \'name\' to not exist');

    expect(() => {
      expect(res).to.have.cookie('foo');
    }).to.throw('expected cookie \'foo\' to exist');

    expect(() => {
      expect(res).to.not.have.cookie('name', 'value');
    }).to.throw('expected cookie \'name\' to not have value \'value\'');

    expect(() => {
      expect(res).to.have.cookie('name2', 'value');
    }).to.throw('expected cookie \'name2\' to have value \'value\' but got \'value2\'');
  });

  it('#cookie (request)', () => {
    const req = {
      headers: {
        'set-cookie': [
          'name=value;',
          'name2=value2; Expires=Wed, 09 Jun 2024 10:18:14 GMT',
          'name3=value3; Domain=.somedomain.com',
        ],
      },
    };
    expect(req).to.have.cookie('name');
    expect(req).to.have.cookie('name2');
    expect(req).to.have.cookie('name3');
    expect(req).to.have.cookie('name', 'value');
    expect(req).to.have.cookie('name2', 'value2');
    expect(req).to.have.cookie('name3', 'value3');
    expect(req).to.not.have.cookie('bar');
    expect(req).to.not.have.cookie('name2', 'bar');

    expect(() => {
      expect(req).to.not.have.cookie('name');
    }).to.throw('expected cookie \'name\' to not exist');

    expect(() => {
      expect(req).to.have.cookie('foo');
    }).to.throw('expected cookie \'foo\' to exist');

    expect(() => {
      expect(req).to.not.have.cookie('name', 'value');
    }).to.throw('expected cookie \'name\' to not have value \'value\'');

    expect(() => {
      expect(req).to.have.cookie('name2', 'value');
    }).to.throw('expected cookie \'name2\' to have value \'value\' but got \'value2\'');
  });

  it('#cookie (agent)', () => {
    const agent = Agent();

    const cookies = [
      'name=value',
      'name2=value2; Expires=Wed, 09 Jun 2024 10:18:14 GMT',
      'name3=value3; Domain=.somedomain.com',
    ];

    if (!agent.jar) { // in the browser
      expect(() => {
        expect(agent).to.have.cookie('name');
      }).to.throw('In browsers cookies are managed automatically by the browser, so the .agent() does not isolate cookies.');
      return;
    }

    // node
    agent.jar.setCookies(cookies);

    expect(agent).to.have.cookie('name');
    expect(agent).to.have.cookie('name2');
    expect(agent).to.have.cookie('name3');
    expect(agent).to.have.cookie('name', 'value');
    expect(agent).to.have.cookie('name2', 'value2');
    expect(agent).to.have.cookie('name3', 'value3');
    expect(agent).to.not.have.cookie('bar');
    expect(agent).to.not.have.cookie('name2', 'bar');

    expect(() => {
      expect(agent).to.not.have.cookie('name');
    }).to.throw('expected cookie \'name\' to not exist');

    expect(() => {
      expect(agent).to.have.cookie('foo');
    }).to.throw('expected cookie \'foo\' to exist');

    expect(() => {
      expect(agent).to.not.have.cookie('name', 'value');
    }).to.throw('expected cookie \'name\' to not have value \'value\'');

    expect(() => {
      expect(agent).to.have.cookie('name2', 'value');
    }).to.throw('expected cookie \'name2\' to have value \'value\' but got \'value2\'');
  });

  describe('#charset', () => {
    it('should match charset in content type', () => {
      const req = { headers: { 'content-type': ['text/plain; charset=utf-8'] } };
      expect(req).to.have.charset('utf8');

      expect(() => {
        expect(req).to.not.have.charset('utf8');
      }).to.throw('expected content type to not have utf8 charset');
    });

    it('should handle no content type', () => {
      const req = { headers: {} };
      expect(req).to.not.have.charset('utf8');

      expect(() => {
        expect(req).to.have.charset('utf8');
      }).to.throw('expected content type to have utf8 charset');
    });

    it('should handle no charset in content type', () => {
      const req = { headers: { 'content-type': ['text/plain'] } };
      expect(req).to.not.have.charset('utf8');

      expect(() => {
        expect(req).to.to.have.charset('utf8');
      }).to.throw('expected content type to have utf8 charset');
    });
  });
});
