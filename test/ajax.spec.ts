// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
  expect, use
} from 'chai';

import * as chaiAsPromised from 'chai-as-promised';

import * as sinon from 'sinon';

import {
  AJAX
} from '..';

use(chaiAsPromised);


describe('@jupyterlab/coreutils', () => {

  let xhr: sinon.SinonFakeXMLHttpRequest;
  let requests: sinon.SinonFakeXMLHttpRequest[];

  beforeEach(function () {
    xhr = sinon.useFakeXMLHttpRequest();
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
        let promise = AJAX.request('foo', { requestConstructor: xhr as any });
        let request = requests[0];
        request.respond(200, {}, 'foo');
        return expect(promise).to.be.fulfilled;
      });

    });

    describe('#makeError()', () => {

    });

  });

});