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

  let xhr: SinonFakeXMLHttpRequest;
  let requests: SinonFakeXMLHttpRequest[];

  beforeEach(function () {
    xhr = useFakeXMLHttpRequest();
    requests = [];
    xhr.onCreate = function (xhr) {
      requests.push(xhr);
    };
  });

  afterEach(function () {
    xhr.restore();
  });

  describe('AJAX', () => {

    describe('#request()', () => {

      it('should make an asynchronous xml request', () => {
        let promise = AJAX.request('foo', { xhr: xhr as any });
        let request = requests[0];
        request.respond(200, {}, 'foo');
        return expect(promise).to.be.fulfilled;
      });

      it('should populate defaults', () => {
        AJAX.request('foo', { xhr: xhr as any });
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
          xhr: xhr as any
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

    });

    describe('#makeError()', () => {

    });

  });

});
