// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
  expect
} from 'chai';

import {
  Server
} from 'mock-socket';

import {
  ManagedSocket
} from '..';


const url = 'ws://localhost:8080';


describe('@jupyterlab/coreutils', () => {

  let server: Server;

  beforeEach(function () {
    server = new Server(url);
  });

  afterEach(function () {
    server.stop();
  });

  describe('ManagedSocket', () => {

    describe('#constructor()', () => {

      it('should create a new managed socket', () => {
        let socket = new ManagedSocket({ url });
        expect(socket).to.be.an.instanceof(ManagedSocket);
      });

    });

    describe('#statusChanged()', () => {

    });

  });

});
