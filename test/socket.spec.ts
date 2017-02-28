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
  let socket: ManagedSocket;

  beforeEach(function () {
    server = new Server(url);
  });

  afterEach(function () {
    socket.dispose();
    server.stop();
  });

  describe('ManagedSocket', () => {

    describe('#constructor()', () => {

      it('should create a new managed socket', () => {
        socket = new ManagedSocket({ url });
        expect(socket).to.be.an.instanceof(ManagedSocket);
      });

    });

    describe('#statusChanged()', () => {

      it('should be emitted when the status changes', () => {
        socket = new ManagedSocket({ url });
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
        socket = new ManagedSocket({ url });
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
        socket = new ManagedSocket({ url });
        expect(socket.url).to.equal(url);
      });

    });

    describe('#status', () => {

      it('should be the status of the socket', () => {
        socket = new ManagedSocket({ url });
        expect(socket.status).to.equal('closed');
        return socket.connect().then(() => {
          expect(socket.status).to.equal('open');
          socket.connect();
          expect(socket.status).to.equal('connecting');
        });
      });

    });

    describe('#isDisposed()', () => {

      it('should test whether the manager is disposed', () => {
        socket = new ManagedSocket({ url });
        expect(socket.isDisposed).to.equal(false);
        socket.dispose();
        expect(socket.isDisposed).to.equal(true);
      });

    });

    describe('#dispose()', () => {

      it('should dispose of the resources used by the manager', () => {
        socket = new ManagedSocket({ url });
        socket.dispose();
        expect(socket.isDisposed).to.equal(true);
        socket.dispose();
        expect(socket.isDisposed).to.equal(true);
      });

    });

    describe('#connect()', () => {

      it('should connect to the socket', () => {
        socket = new ManagedSocket({ url });
        return socket.connect().then(() => {
          expect(socket.status).to.equal('open');
        });
      });

      it('should reconnect to an open socket', () => {
        socket = new ManagedSocket({ url });
        return socket.connect().then(() => {
          expect(socket.status).to.equal('open');
          let promise = socket.connect();
          expect(socket.status).to.equal('connecting');
          return promise;
        }).then(() => {
          expect(socket.status).to.equal('open');
        });
      });

      it('should reconnect to a closed socket', () => {
        socket = new ManagedSocket({ url });
        return socket.connect().then(() => {
          expect(socket.status).to.equal('open');
          socket.close();
          expect(socket.status).to.equal('closed');
          let promise = socket.connect();
          expect(socket.status).to.equal('connecting');
          return promise;
        }).then(() => {
          expect(socket.status).to.equal('open');
        });
      });

    });

    describe('#send()', () => {

      it('should send a message to the server', (done) => {
        socket = new ManagedSocket({ url });
        socket.connect().then(() => {
          server.on('message', msg => {
            expect(msg).to.equal('foo');
            done();
          });
          socket.send('foo');
        }).catch(done);
      });

      it('should queue a message when the socket is not connected', (done) => {
        socket = new ManagedSocket({ url });
        socket.send('foo');
        server.on('message', msg => {
          expect(msg).to.equal('foo');
          done();
        });
        socket.connect().catch(done);
      });

    });

    describe('#close()', () => {

      it('should close the socket', () => {
        socket = new ManagedSocket({ url });
        return socket.connect().then(() => {
          socket.close();
          expect(socket.status).to.equal('closed');
          socket.close();
          expect(socket.status).to.equal('closed');
        });
      });

    });

  });

});
