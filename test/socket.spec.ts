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

      it('should be emitted when the status changes', () => {
        let socket = new ManagedSocket({ url });
        let called = false;
        socket.statusChanged.connect((sender, args) => {
          expect(sender).to.equal(socket);
          expect(args).to.equal('connecting');
          called = true;
        });
        socket.connect();
        expect(called).to.equal(true);
      });

    });

    describe('#messageReceived()', () => {

      it('should be emitted when a message is received', () => {
        let socket = new ManagedSocket({ url });
        return socket.connect().then(() => {
          let called = false;
          socket.messageReceived.connect((sender, args) => {
            expect(sender).to.equal(socket);
            expect(args.data).to.equal('foo');
            called = true;
          });

          server.send('foo');
          expect(called).to.equal(true);
        });
      });

    });

    describe('#url', () => {

      it('should be the url of the socket', () => {
        let socket = new ManagedSocket({ url });
        expect(socket.url).to.equal(url);
      });

    });

    describe('#status', () => {

      it('should be the status of the socket', () => {
        let socket = new ManagedSocket({ url });
        expect(socket.status).to.equal('closed');
        return socket.connect().then(() => {
          expect(socket.status).to.equal('open');
          socket.connect();
          expect(socket.status).to.equal('connecting');
        });
      });
    });
  });

});
