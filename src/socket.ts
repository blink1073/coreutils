// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
  PromiseDelegate
} from '@phosphor/coreutils';

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
   * Connect or reconnect to the socket.
   */
  connect(): Promise<void> {
    if (this._ws !== null) {
      this.close();
    }
    this._reconnectAttempt = 0;
    this._delegate = new PromiseDelegate<void>();
    this._createSocket();
    return this._delegate.promise;
  }

  /**
   * Send a message to the socket.
   *
   * #### Notes
   * If the socket is not open the message will be queued.
   */
  send(msg: string): void {
    if (this._status !== 'open') {
      this._pendingMessages.push(msg);
      return;
    }
    this._ws.send(msg);
  }

  /**
   * Close the socket.
   */
  close(): void {
    if (this._ws === null) {
      return;
    }
    // Clear the websocket event handlers and the socket itself.
    this._ws.onopen = this._dummyCallback;
    this._ws.onclose = this._dummyCallback;
    this._ws.onerror = this._dummyCallback;
    this._ws.onmessage = this._dummyCallback;
    this._ws.close();
    this._ws = null;
    this._setStatus('closed');
  }

  /**
   * Create the websocket connection and add socket status handlers.
   */
  private _createSocket(): void {
    this._setStatus('connecting');

    let url = this.url;
    // Strip any authentication from the display string.
    let parsed = URL.parse(url);
    let display = url.replace(parsed.auth || '', '');
    console.log(`Starting websocket: ${display}`);

    // Add token if needed.
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
    this._delegate.resolve(void 0);

    // Shift the message off the queue
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
    if (this._status === 'closed') {
      return;
    }

    this.close();

    if (this._reconnectAttempt < this._reconnectLimit) {
      let timeout = Math.pow(2, this._reconnectAttempt);
      console.error('Connection lost, reconnecting in ' + timeout + ' seconds.');
      setTimeout(this._createSocket.bind(this), 1e3 * timeout);
      this._reconnectAttempt += 1;
    } else {
      this._delegate.reject(new Error('Could not connect to socket'));
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
  private _delegate = new PromiseDelegate<void>();
  private _ws: WebSocket | null = null;
  private _status: ManagedSocket.Status = 'closed';
  private _pendingMessages: string[] = [];
  private _reconnectLimit = 7;
  private _reconnectAttempt = 0;
  private _statusChanged = new Signal<this, ManagedSocket.Status>(this);
  private _messageReceived = new Signal<this, MessageEvent>(this);
  private _dummyCallback = () => { /* no-op */ };
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
  type Status = 'open' | 'connecting' | 'closed';

  /**
   * The interface for a WebSocket factory.
   */
  export
  interface IFactory {
    new(): WebSocket;
    (): WebSocket;
  }
}
