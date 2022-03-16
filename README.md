# chai-superagent

[![Travis][build-badge]][build]
[![npm package][npm-badge]][npm]
[![Coverage Status][coveralls-badge]][coveralls]
[![Dependency Status][dependency-status-badge]][dependency-status]
[![devDependency Status][dev-dependency-status-badge]][dev-dependency-status]

> superagent integration testing with Chai assertions.

## Features

- simplified fork of [`chai-http`](https://github.com/chaijs/chai-http)
- esm module only, support node >= 14
- integration test request composition
- test http apps or external services
- assertions for common http tasks
- chai `expect` and `should` interfaces

## Install

```
$ npm install chai-superagent superagent
```

## Plugin

Use this plugin as you would all other Chai plugins.

```js
import { use } from 'chai';

use((await import('chai-superagent')).default);
```

## Integration Testing

Use `superagent` as you normally would, and test
the responses using the assertions provided in this library.

```js
import request from 'superagent';

request
  .get('http://localhost:8000/foo')
  .then(res => expect(res).to.have.status(200));
```

## Application / Server

You may use `supertest` to make requests to existing web servers.

__Note:__ This feature is only supported on Node.js, not in web browsers.

```js
import request from 'supertest';

request(app)
  .get('/')
  .then(res => expect(res).to.have.status(200));
```

## Assertions

The Chai HTTP module provides a number of assertions
for the `expect` and `should` interfaces.

### .status (code)

* **@param** _{Number}_ status number

Assert that a response has a supplied status.

```js
expect(res).to.have.status(200);
```

### .header (key[, value])

* **@param** _{String}_ header key (case insensitive)
* **@param** _{String|RegExp}_ header value (optional)

Assert that a `Response` or `Request` object has a header.
If a value is provided, equality to value will be asserted.
You may also pass a regular expression to check.

__Note:__ When running in a web browser, the
[same-origin policy](https://tools.ietf.org/html/rfc6454#section-3)
only allows Chai HTTP to read
[certain headers](https://www.w3.org/TR/cors/#simple-response-header),
which can cause assertions to fail.

```js
expect(req).to.have.header('x-api-key');
expect(req).to.have.header('content-type', 'text/plain');
expect(req).to.have.header('content-type', /^text/);
```

### .headers


Assert that a `Response` or `Request` object has headers.

__Note:__ When running in a web browser, the
[same-origin policy](https://tools.ietf.org/html/rfc6454#section-3)
only allows Chai HTTP to read
[certain headers](https://www.w3.org/TR/cors/#simple-response-header),
which can cause assertions to fail.

```js
expect(req).to.have.headers;
```

### .ip


Assert that a string represents valid ip address.

```js
expect('127.0.0.1').to.be.an.ip;
expect('2001:0db8:85a3:0000:0000:8a2e:0370:7334').to.be.an.ip;
```

### .json / .text / .html


Assert that a `Response` or `Request` object has a given content-type.

```js
expect(req).to.be.json;
expect(req).to.be.html;
expect(req).to.be.text;
```

### .charset



Assert that a `Response` or `Request` object has a given charset.

```js
expect(req).to.have.charset('utf-8');
```

### .redirect


Assert that a `Response` object has a redirect status code.

```js
expect(res).to.redirect;
expect(res).to.not.redirect;
```

### .redirectTo

* **@param** _{String|RegExp}_ location url

Assert that a `Response` object redirects to the supplied location.

```js
expect(res).to.redirectTo('http://example.com');
expect(res).to.redirectTo(/^\/search\/results\?orderBy=desc$/);
```

### .param

* **@param** _{String}_ parameter name
* **@param** _{String}_ parameter value

Assert that a `Request` object has a query string parameter with a given
key, (optionally) equal to value

```js
expect(req).to.have.param('orderby');
expect(req).to.have.param('orderby', 'date');
expect(req).to.not.have.param('limit');
```

### .cookie

* **@param** _{String}_ parameter name
* **@param** _{String}_ parameter value

Assert that a `Request` or `Response` object has a cookie header with a
given key, (optionally) equal to value

```js
expect(req).to.have.cookie('session_id');
expect(req).to.have.cookie('session_id', '1234');
expect(req).to.not.have.cookie('PHPSESSID');
expect(res).to.have.cookie('session_id');
expect(res).to.have.cookie('session_id', '1234');
expect(res).to.not.have.cookie('PHPSESSID');
```

## License

See the [LICENSE](LICENSE.md) file for license rights and limitations (MIT).

[build-badge]: https://img.shields.io/github/workflow/status/dotcore64/chai-superagent/test/master?style=flat-square
[build]: https://github.com/dotcore64/chai-superagent/actions

[npm-badge]: https://img.shields.io/npm/v/chai-superagent.svg?style=flat-square
[npm]: https://www.npmjs.org/package/chai-superagent

[coveralls-badge]: https://img.shields.io/coveralls/dotcore64/chai-superagent/master.svg?style=flat-square
[coveralls]: https://coveralls.io/r/dotcore64/chai-superagent

[dependency-status-badge]: https://david-dm.org/dotcore64/chai-superagent.svg?style=flat-square
[dependency-status]: https://david-dm.org/dotcore64/chai-superagent

[dev-dependency-status-badge]: https://david-dm.org/dotcore64/chai-superagent/dev-status.svg?style=flat-square
[dev-dependency-status]: https://david-dm.org/dotcore64/chai-superagent#info=devDependencies
