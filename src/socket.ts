// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
  ISignal, Signal
} from '@phosphor/signaling';

import {
  PageConfig
} from './pageconfig';

import {
  URL
} from './url';


/**
 * A class that manages a web socket connection.
 */
export
class ManagedSocket {
  /**
   * Create a new managed socket.
   */
  constructor(options: ManagedSocket.IOptions) {
    this.url = options.url;
    this._token = options.token || PageConfig.getOption('token');
    this._status = 'starting';
    this._createSocket();
  }

  /**
   * A signal emitted when the status has changed.
   */
  get statusChanged(): ISignal<this, ManagedSocket.Status> {
    return this._statusChanged;
  }

  /**
   * A signal emitted when a message is received.
   */
  get messageReceived(): ISignal<this, MessageEvent> {
    return this._messageReceived;
  }

  /**
   * The url of the socket.
   */
  readonly url: string;

  /**
   * The status of the socket.
   */
  get status(): ManagedSocket.Status {
    return this._status;
  }

  /**
   * Send a message to the socket.  It will be queued until the
   * socket is connected.
   */
  send(msg: string): void {
    if (this._status !== 'open') {
      this._pendingMessages.push(msg);
      return;
    }
    this._ws.send(msg);
  }

  /**
   * Reconnect to the socket.
   */
  reconnect(): void {
    if (this._ws !== null) {
      // Clear the websocket event handlers and the socket itself.
      this._ws.onopen = null;
      this._ws.onclose = null;
      this._ws.onerror = null;
      this._ws.onmessage = null;
      this._ws.close();
      this._ws = null;
    }
    this._setStatus('reconnecting');
    this._createSocket();
  }

  /**
   * Create the websocket connection and add socket status handlers.
   */
  private _createSocket(): void {
    let url = this.url;
    // Strip any authentication from the display string.
    let parsed = URL.parse(url);
    let display = url.replace(parsed.auth, '');
    console.log('Starting websocket', display);

    // if token authentication is in use
    if (this._token !== '') {
      url = url + `&token=${encodeURIComponent(this._token)}`;
    }
    this._ws = new WebSocket(url);

    // Ensure incoming binary messages are not Blobs
    this._ws.binaryType = 'arraybuffer';

    this._ws.onmessage = (evt: MessageEvent) => { this._onWSMessage(evt); };
    this._ws.onopen = (evt: Event) => { this._onWSOpen(evt); };
    this._ws.onclose = (evt: Event) => { this._onWSClose(evt); };
    this._ws.onerror = (evt: Event) => { this._onWSClose(evt); };
  }

  /**
   * Handle a websocket open event.
   */
  private _onWSOpen(evt: Event): void {
    this._reconnectAttempt = 0;
    this._setStatus('open');
    // We shift the message off the queue
    // after the message is sent so that if there is an exception,
    // the message is still pending.
    while (this._pendingMessages.length > 0) {
      let msg = this._pendingMessages[0];
      this._ws.send(msg);
      this._pendingMessages.shift();
    }
  }

  /**
   * Handle a websocket message, validating and routing appropriately.
   */
  private _onWSMessage(evt: MessageEvent) {
    this._messageReceived.emit(evt);
  }

  /**
   * Handle a websocket close event.
   */
  private _onWSClose(evt: Event) {
    if (this._status === 'dead') {
      return;
    }

    // Clear the websocket event handlers and the socket itself.
    this._ws.onclose = null;
    this._ws.onerror = null;
    this._ws = null;

    if (this._reconnectAttempt < this._reconnectLimit) {
      this._setStatus('reconnecting');
      let timeout = Math.pow(2, this._reconnectAttempt);
      console.error('Connection lost, reconnecting in ' + timeout + ' seconds.');
      setTimeout(this._createSocket.bind(this), 1e3 * timeout);
      this._reconnectAttempt += 1;
    } else {
      this._setStatus('dead');
    }
  }

  /**
   * Set the status of the socket.
   */
  private _setStatus(status: ManagedSocket.Status): void {
    if (status === this._status) {
      return;
    }
    this._status = status;
    this._statusChanged.emit(status);
  }

  private _token: string;
  private _ws: WebSocket;
  private _status: ManagedSocket.Status;
  private _pendingMessages: string[] = [];
  private _reconnectLimit = 7;
  private _reconnectAttempt = 0;
  private _statusChanged = new Signal<this, ManagedSocket.Status>(this);
  private _messageReceived = new Signal<this, MessageEvent>(this);
}


/**
 * The namespace for ManagedSocket class statics.
 */
export
namespace ManagedSocket {
  /**
   * The options used to create a ManagedSocket.
   */
  export
  interface IOptions {
    /**
     * The url of the socket.
     */
    url: string;

    /**
     * The optional token for authentication. Defaults to PageConfig `token`.
     */
    token?: string;

    /**
     * The optional WebSocket constructor.
     */
    factory?: IFactory;
  }

  /**
   * A socket status type.
   */
  export
  type Status = 'open' | 'starting' | 'reconnecting' | 'dead';

  /**
   * The interface for an XMLHttpRequest factory.
   */
  export
  interface IFactory {
    new(): WebSocket;
    (): WebSocket;
  }
}
