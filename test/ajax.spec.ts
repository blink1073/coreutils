// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
  expect, use
} from 'chai';

import {
  SinonFakeXMLHttpRequest, useFakeXMLHttpRequest
} from 'sinon';

import * as chaiAsPromised
  from 'chai-as-promised';

import {
  AJAX
} from '..';

use(chaiAsPromised);


describe('@jupyterlab/coreutils', () => {

  let xhr: AJAX.IConstructor;
  let requests: SinonFakeXMLHttpRequest[];

  beforeEach(function () {
    let fake = useFakeXMLHttpRequest();
    requests = [];
    fake.onCreate = function (request) {
      requests.push(request);
    };
    xhr = fake as any;
  });

  afterEach(function () {
    (xhr as any).restore();
  });

  describe('AJAX', () => {

    describe('#request()', () => {

      it('should make an asynchronous xml request', () => {
        let promise = AJAX.request('foo', { xhr });
        let request = requests[0];
        request.respond(200, {}, 'foo');
        return expect(promise).to.be.fulfilled;
      });

      it('should populate defaults', () => {
        AJAX.request('foo', { xhr });
        let request = requests[0];
        expect(request.method).to.equal('GET');
        expect(request.password).to.equal('');
        expect(request.requestBody).to.equal(null);
        expect(request.requestHeaders['Content-Type']).to.equal('application/json');
        expect(request.url).to.contain('foo?');
        expect(request.username).to.equal('');
        expect(request.withCredentials).to.equal(undefined);
      });

      it('should allow overrides', () => {
        let settings = {
          method: 'POST',
          dataType: 'application/json',
          contentType: 'application/json',
          data: { 'foo': 1, 'bar': 'baz' },
          cache: false,
          timeout: 10,
          requestHeaders: { 'foo': 'bar' },
          withCredentials: true,
          user: 'snuffy',
          password: 'password',
          token: 'secret',
          xhr
        };
        AJAX.request('foo', settings);
        let request = requests[0];
        expect(request.method).to.equal('POST');
        expect(request.password).to.equal('password');
        expect(request.requestBody).to.be.deep.equal(settings.data);
        expect(request.requestHeaders['Content-Type']).to.contain('application/json');
        expect(request.requestHeaders['Authorization']).to.equal('token secret');
        expect(request.requestHeaders['foo']).to.equal('bar');
        expect(request.url).to.not.contain('?');
        expect(request.username).to.equal('snuffy');
        expect(request.withCredentials).to.equal(true);
      });

      it('should resolve with a success object', () => {
        let promise = AJAX.request('foo', { xhr });
        let request = requests[0];
        request.respond(200, {}, 'foo');
        return promise.then(response => {
          expect(response.xhr).to.equal(request);
          expect(response.event.type).to.equal('load');
          expect(response.data).to.equal('foo');
          expect(response.settings['method']).to.equal('GET');
        });
      });

      it('should reject with an error object', () => {
        let promise = AJAX.request('foo', { xhr });
        let request = requests[0];
        request.respond(404, {}, 'foo');
        return promise.then(
          () => { throw Error('Expected failure'); },
          error => {
            expect(error.xhr).to.equal(request);
            expect(error.event.type).to.equal('load');
            expect(error.settings['method']).to.equal('GET');
            expect(error.xhr.statusText).to.equal('Not Found');
            expect(error.message).to.equal('Invalid Status: 404');
          }
        );
      });

    });

    describe('#makeError()', () => {

      it('should make an AJAX error from an AJAX success', () => {
        let promise = AJAX.request('foo', { xhr });
        let request = requests[0];
        request.respond(200, {}, 'foo');
        return promise.then(success => {
          let error = AJAX.makeError(success);
          expect(error.xhr).to.equal(request);
          expect(error.settings).to.equal(success.settings);
          expect(error.event).to.equal(success.event);
          expect(error.message).to.equal('Invalid Status: 200');
        });
      });

      it('should add an error message', () => {
        let promise = AJAX.request('foo', { xhr });
        let request = requests[0];
        request.respond(200, {}, 'foo');
        return promise.then(success => {
          let error = AJAX.makeError(success, 'custom failure');
          expect(error.xhr).to.equal(request);
          expect(error.settings).to.equal(success.settings);
          expect(error.event).to.equal(success.event);
          expect(error.message).to.equal('custom failure');
        });
      });
    });

  });

});
