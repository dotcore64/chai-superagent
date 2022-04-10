import { isIP } from 'net';
import qs from 'qs';
import { URL } from 'url';
import Cookie from 'cookiejar';
import charset from 'charset';
import { Request, Response, agent as Agent } from 'superagent';

/**
 * ## Assertions
 *
 * The Chai HTTP module provides a number of assertions
 * for the `expect` and `should` interfaces.
 */

export default ({ strict = true } = {}) => (chai, _) => {
  const { Assertion } = chai;
  const i = _.inspect;

  /*!
   * Content types hash. Used to
   * define `Assertion` properties.
   *
   * @type {Object}
   */

  const contentTypes = {
    json: 'application/json',
    text: 'text/plain',
    html: 'text/html',
  };

  /*!
   * Return a header from `Request` or `Response` object.
   *
   * @param {Request|Response} object
   * @param {String} Header
   * @returns {String|Undefined}
   */

  function getHeader(obj, key) {
    const normalized = key && key.toLowerCase();
    if (obj.getHeader) return obj.getHeader(normalized);
    if (obj.headers) return obj.headers[normalized];
    return undefined;
  }

  function assertRequest(obj) {
    if (strict) {
      new Assertion(obj).assert(
        obj instanceof Request,
        'expected #{act} to be an instance of Request',
        null,
        true,
        obj,
        false,
      );
    }
  }

  function assertResponse(obj) {
    if (strict) {
      new Assertion(obj).assert(
        obj instanceof Response,
        'expected #{act} to be an instance of Response',
        null,
        true,
        obj,
        false,
      );
    }
  }

  function assertResponseOrRequest(obj) {
    if (strict) {
      new Assertion(obj).assert(
        obj instanceof Response || obj instanceof Request,
        'expected #{act} to be an instance of Request or Response',
        null,
        true,
        obj,
        false,
      );
    }
  }

  function assertResponseOrRequestOrAgent(obj) {
    if (strict) {
      new Assertion(obj).assert(
        obj instanceof Response || obj instanceof Request || obj instanceof Agent,
        'expected #{act} to be an instance of Request or Response or Agent',
        null,
        true,
        obj,
        false,
      );
    }
  }

  /**
   * ### .status (code)
   *
   * Assert that a response has a supplied status.
   *
   * ```js
   * expect(res).to.have.status(200);
   * ```
   *
   * @param {Number} status number
   * @name status
   * @api public
   */

  Assertion.addMethod('status', function (code) { // eslint-disable-line func-names
    assertResponse(this._obj);

    const hasStatus = Boolean('status' in this._obj || 'statusCode' in this._obj);
    new Assertion(hasStatus).assert(
      hasStatus,
      "expected #{act} to have keys 'status', or 'statusCode'",
      null, // never negated
      hasStatus, // expected
      this._obj, // actual
      false, // no diff
    );

    const status = this._obj.status || this._obj.statusCode;

    this.assert(
      status === code,
      'expected #{this} to have status code #{exp} but got #{act}',
      'expected #{this} to not have status code #{act}',
      code,
      status,
    );
  });

  /**
   * ### .header (key[, value])
   *
   * Assert that a `Response` or `Request` object has a header.
   * If a value is provided, equality to value will be asserted.
   * You may also pass a regular expression to check.
   *
   * __Note:__ When running in a web browser, the
   * [same-origin policy](https://tools.ietf.org/html/rfc6454#section-3)
   * only allows Chai HTTP to read
   * [certain headers](https://www.w3.org/TR/cors/#simple-response-header),
   * which can cause assertions to fail.
   *
   * ```js
   * expect(req).to.have.header('x-api-key');
   * expect(req).to.have.header('content-type', 'text/plain');
   * expect(req).to.have.header('content-type', /^text/);
   * ```
   *
   * @param {String} header key (case insensitive)
   * @param {String|RegExp} header value (optional)
   * @name header
   * @api public
   */

  Assertion.addMethod('header', function (key, value) { // eslint-disable-line func-names
    assertResponseOrRequest(this._obj);

    const header = getHeader(this._obj, key);

    if (arguments.length < 2) {
      this.assert(
        typeof header !== 'undefined' || header === null,
        `expected header '${key}' to exist`,
        `expected header '${key}' to not exist`,
      );
    } else if (value instanceof RegExp) {
      this.assert(
        value.test(header),
        `expected header '${key}' to match ${value} but got ${i(header)}`,
        `expected header '${key}' not to match ${value} but got ${i(header)}`,
        value,
        header,
      );
    } else {
      this.assert(
        header === value,
        `expected header '${key}' to have value ${value} but got ${i(header)}`,
        `expected header '${key}' to not have value ${value}`,
        value,
        header,
      );
    }
  });

  /**
   * ### .headers
   *
   * Assert that a `Response` or `Request` object has headers.
   *
   * __Note:__ When running in a web browser, the
   * [same-origin policy](https://tools.ietf.org/html/rfc6454#section-3)
   * only allows Chai HTTP to read
   * [certain headers](https://www.w3.org/TR/cors/#simple-response-header),
   * which can cause assertions to fail.
   *
   * ```js
   * expect(req).to.have.headers;
   * ```
   *
   * @name headers
   * @api public
   */

  Assertion.addProperty('headers', function () { // eslint-disable-line func-names
    assertResponseOrRequest(this._obj);

    this.assert(
      this._obj.headers || this._obj.getHeader,
      'expected #{this} to have headers or getHeader method',
      'expected #{this} to not have headers or getHeader method',
    );
  });

  /**
   * ### .ip
   *
   * Assert that a string represents valid ip address.
   *
   * ```js
   * expect('127.0.0.1').to.be.an.ip;
   * expect('2001:0db8:85a3:0000:0000:8a2e:0370:7334').to.be.an.ip;
   * ```
   *
   * @name ip
   * @api public
   */

  Assertion.addProperty('ip', function () { // eslint-disable-line func-names
    this.assert(
      isIP(this._obj),
      'expected #{this} to be an ip',
      'expected #{this} to not be an ip',
    );
  });

  /**
   * ### .json / .text / .html
   *
   * Assert that a `Response` or `Request` object has a given content-type.
   *
   * ```js
   * expect(req).to.be.json;
   * expect(req).to.be.html;
   * expect(req).to.be.text;
   * ```
   *
   * @name json
   * @name html
   * @name text
   * @api public
   */

  function checkContentType(name) {
    const val = contentTypes[name];

    Assertion.addProperty(name, function () { // eslint-disable-line func-names
      assertResponseOrRequest(this._obj);

      new Assertion(this._obj).to.have.headers; // eslint-disable-line no-unused-expressions
      const ct = getHeader(this._obj, 'content-type');
      const ins = i(ct) === 'undefined'
        ? 'headers'
        : i(ct);

      this.assert(
        ct && ~ct.indexOf(val), // eslint-disable-line no-bitwise
        `expected ${ins} to include '${val}'`,
        `expected ${ins} to not include '${val}'`,
      );
    });
  }

  Object
    .keys(contentTypes)
    .forEach(checkContentType);

  /**
   * ### .charset
   *
   * Assert that a `Response` or `Request` object has a given charset.
   *
   * ```js
   * expect(req).to.have.charset('utf-8');
   * ```
   *
   * @name charset
   * @api public
   */

  Assertion.addMethod('charset', function (value) { // eslint-disable-line func-names
    assertResponseOrRequest(this._obj);

    const normalized = value.toLowerCase();

    const { headers } = this._obj;
    let cs = charset(headers);

    /*
     * Fix charset() treating "utf8" as a special case
     * See https://github.com/node-modules/charset/issues/12
     */
    if (cs === 'utf8') {
      cs = 'utf-8';
    }

    this.assert(
      cs != null && normalized === cs,
      `expected content type to have ${normalized} charset`,
      `expected content type to not have ${normalized} charset`,
    );
  });

  /**
   * ### .redirect
   *
   * Assert that a `Response` object has a redirect status code.
   *
   * ```js
   * expect(res).to.redirect;
   * ```
   *
   * @name redirect
   * @api public
   */

  Assertion.addProperty('redirect', function () { // eslint-disable-line func-names
    assertResponse(this._obj);

    const redirectCodes = [301, 302, 303, 307, 308];
    const { status } = this._obj;
    const { redirects } = this._obj;

    this.assert(
      redirectCodes.indexOf(status) >= 0 || (redirects && redirects.length),
      `expected redirect with 30X status code but got ${status}`,
      `expected not to redirect but got ${status} status`,
    );
  });

  /**
   * ### .redirectTo
   *
   * Assert that a `Response` object redirects to the supplied location.
   *
   * ```js
   * expect(res).to.redirectTo('http://example.com');
   * ```
   *
   * @param {String|RegExp} location url
   * @name redirectTo
   * @api public
   */

  Assertion.addMethod('redirectTo', function (destination) { // eslint-disable-line func-names
    assertResponse(this._obj);

    const { redirects } = this._obj;

    new Assertion(this._obj).to.redirect; // eslint-disable-line no-unused-expressions

    if (redirects && redirects.length) {
      let hasRedirected;

      if (Object.prototype.toString.call(destination) === '[object RegExp]') {
        hasRedirected = redirects.some((redirect) => destination.test(redirect));
      } else {
        hasRedirected = redirects.indexOf(destination) > -1;
      }
      this.assert(
        hasRedirected,
        `expected redirect to ${destination} but got ${redirects.join(' then ')}`,
        `expected not to redirect to ${destination} but got ${redirects.join(' then ')}`,
      );
    } else {
      const assertion = new Assertion(this._obj);
      _.transferFlags(this, assertion);
      assertion.with.header('location', destination);
    }
  });

  /**
   * ### .param
   *
   * Assert that a `Request` object has a query string parameter with a given
   * key, (optionally) equal to value
   *
   * ```js
   * expect(req).to.have.param('orderby');
   * expect(req).to.have.param('orderby', 'date');
   * expect(req).to.not.have.param('limit');
   * ```
   *
   * @param {String} parameter name
   * @param {String} parameter value
   * @name param
   * @api public
   */

  Assertion.addMethod('param', function (...args) { // eslint-disable-line func-names
    assertRequest(this._obj);

    const assertion = new Assertion();
    _.transferFlags(this, assertion);
    assertion._obj = qs.parse(new URL(this._obj.url, 'https://dummy.com').search.replace(/^\?/, ''));
    assertion.property(...args);
  });

  /**
   * ### .cookie
   *
   * Assert that a `Request`, `Response` or `Agent` object has a cookie header with a
   * given key, (optionally) equal to value
   *
   * ```js
   * expect(req).to.have.cookie('session_id');
   * expect(req).to.have.cookie('session_id', '1234');
   * expect(req).to.not.have.cookie('PHPSESSID');
   * expect(res).to.have.cookie('session_id');
   * expect(res).to.have.cookie('session_id', '1234');
   * expect(res).to.not.have.cookie('PHPSESSID');
   * expect(agent).to.have.cookie('session_id');
   * expect(agent).to.have.cookie('session_id', '1234');
   * expect(agent).to.not.have.cookie('PHPSESSID');
   * ```
   *
   * @param {String} parameter name
   * @param {String} parameter value
   * @name param
   * @api public
   */

  Assertion.addMethod('cookie', function (key, value) { // eslint-disable-line func-names
    assertResponseOrRequestOrAgent(this._obj);

    let header = getHeader(this._obj, 'set-cookie');
    let cookie;

    if (!header) {
      header = (getHeader(this._obj, 'cookie') || '').split(';');
    }

    if ((this._obj instanceof Agent || this._obj instanceof Request) && this._obj.jar) {
      cookie = this._obj.jar.getCookie(key, Cookie.CookieAccessInfo.All);
    } else {
      cookie = Cookie.CookieJar();
      cookie.setCookies(header);
      cookie = cookie.getCookie(key, Cookie.CookieAccessInfo.All);
    }

    if (value !== undefined) {
      this.assert(
        cookie.value === value,
        `expected cookie '${key}' to have value #{exp} but got #{act}`,
        `expected cookie '${key}' to not have value #{exp}`,
        value,
        cookie.value,
      );
    } else {
      this.assert(
        typeof cookie !== 'undefined' || cookie === null,
        `expected cookie '${key}' to exist`,
        `expected cookie '${key}' to not exist`,
      );
    }
  });
};
