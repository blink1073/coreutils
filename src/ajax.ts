// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
  JSONValue
} from '@phosphor/coreutils';

import {
  PageConfig
} from './pageconfig';


/**
 * The namespace for AJAX functions.
 */
export
namespace AJAX {
  /**
   * Asynchronous XMLHttpRequest handler.
   *
   * @param url - The url to request.
   *
   * @param settings - The settings to apply to the request.
   *
   * @returns a Promise that resolves with the success data.
   */
  export
  function request(url: string, settings: ISettings): Promise<ISuccess> {
    if (!settings.cache) {
      // https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/Using_XMLHttpRequest#Bypassing_the_cache.
      url += ((/\?/).test(url) ? '&' : '?') + (new Date()).getTime();
    }
    settings = Private.handleSettings(settings);
    let xhr = Private.createRequest(settings);
    xhr.open(settings.method, url, true, settings.user, settings.password);
    return Private.handleRequest(xhr, settings);
  }

  /**
   * Create an ajax error from an ajax success.
   *
   * @param success - The original success object.
   *
   * @param message - The optional new error message.  If not given
   *  we use "Invalid Status: <xhr.status>"
   */
  export
  function makeError(success: ISuccess, message?: string): IError {
    let xhr = success.xhr;
    let settings = success.settings;
    let event = success.event;
    message = message || `Invalid Status: ${xhr.status}`;
    return { xhr, settings, event, message };
  }

  /**
   * Input settings for an AJAX request.
   */
  export
  interface ISettings {
    /**
     * The HTTP method to use.  Defaults to `'GET'`.
     */
    method?: string;

    /**
     * The return data type (used to parse the return data).
     */
    dataType?: string;

    /**
     * The outgoing content type, used to set the `Content-Type` header.
     */
    contentType?: string;

    /**
     * The request data.
     */
    data?: JSONValue;

    /**
     * Whether to cache the response. Defaults to `true`.
     */
    cache?: boolean;

    /**
     * The number of milliseconds a request can take before automatically
     * being terminated.  A value of 0 (which is the default) means there is
     * no timeout.
     */
    timeout?: number;

    /**
     * A mapping of request headers, used via `setRequestHeader`.
     */
    requestHeaders?: { [key: string]: string; };

    /**
     * Is a Boolean that indicates whether or not cross-site Access-Control
     * requests should be made using credentials such as cookies or
     * authorization headers.  Defaults to `false`.
     */
    withCredentials?: boolean;

    /**
     * The user name associated with the request.  Defaults to `''`.
     */
    user?: string;

    /**
     * The password associated with the request.  Defaults to `''`.
     */
    password?: string;

    /**
     * The optional XHRRequest constructor.
     */
    requestConstructor?: IRequestConstructor;
  }

  /**
   * Data for a successful  AJAX request.
   */
  export
  interface ISuccess {
    /**
     * The `onload` event.
     */
    readonly event: ProgressEvent;

    /**
     * The XHR object.
     */
    readonly xhr: XMLHttpRequest;

    /**
     * The ajax settings associated with the request.
     */
    readonly settings: ISettings;

    /**
     * The data returned by the ajax call.
     */
    readonly data: JSONValue;
  }

  /**
   * Data for an unsuccesful AJAX request.
   */
  export
  interface IError {
    /**
     * The event triggering the error.
     */
    readonly event: Event;

    /**
     * The XHR object.
     */
    readonly xhr: XMLHttpRequest;

    /**
     * The ajax settings associated with the request.
     */
    readonly settings: ISettings;

    /**
     * The error message.
     */
    readonly message?: string;
  }

  /**
   * The interface for an XMLHttpRequest constructor.
   */
  export
  interface IRequestConstructor {
    new(): XMLHttpRequest;
    (): XMLHttpRequest;
  }
}


/**
 * The namespace for module private data.
 */
namespace Private {
  /**
   * Handle the ajax settings, returning a new value.
   */
  export
  function handleSettings(settings: AJAX.ISettings): AJAX.ISettings {
    settings = {...settings};
    if (settings.requestHeaders) {
      settings.requestHeaders = {...settings.requestHeaders};
    } else {
      settings.requestHeaders = {};
    }

    // Handle default values.
    settings.method = settings.method || 'GET';
    settings.user = settings.user || '';
    settings.password = settings.password || '';
    settings.withCredentials = !!settings.withCredentials;

    // Ensure that requests have applied data.
    if (!settings.data) {
      settings.data = '{}';
      settings.contentType = 'application/json';
    }

    // Handle authorization.
    let token = PageConfig.getOption('token');
    if (token) {
      settings.requestHeaders['Authorization'] = `token ${token}`;
    } else if (typeof document !== 'undefined' && document.cookie) {
      let xsrfToken = Private.getCookie('_xsrf');
      if (xsrfToken !== void 0) {
        settings.requestHeaders['X-XSRFToken'] = xsrfToken;
      }
    }
    return settings;
  }

  /**
   * Make an xhr request using settings.
   */
  export
  function createRequest(settings: AJAX.ISettings): XMLHttpRequest {
    let xhr: XMLHttpRequest;
    if (settings.requestConstructor) {
      xhr = new settings.requestConstructor();
    } else {
      xhr = new XMLHttpRequest();
    }

    if (settings.contentType !== void 0) {
      xhr.setRequestHeader('Content-Type', settings.contentType);
    }
    if (settings.timeout !== void 0) {
      xhr.timeout = settings.timeout;
    }
    if (settings.withCredentials) {
      xhr.withCredentials = true;
    }

    // Write the request headers.
    let headers = settings.requestHeaders;
    for (let prop in headers) {
      xhr.setRequestHeader(prop, headers[prop]);
    }
    return xhr;
  }

  /**
   * Handle a request.
   */
  export
  function handleRequest(xhr: XMLHttpRequest, settings: AJAX.ISettings): Promise<AJAX.ISuccess> {
    return new Promise((resolve, reject) => {
      xhr.onload = (event: ProgressEvent) => {
        if (xhr.status >= 300) {
          let message = xhr.statusText || xhr.responseText;
          reject({ event, xhr, settings, message });
        }
        let data = xhr.responseText;
        try {
          data = JSON.parse(data);
        } catch (err) {
          // no-op
        }
        resolve({ xhr, settings, data, event });
      };

      xhr.onabort = (event: Event) => {
        reject({ xhr, event, settings });
      };

      xhr.onerror = (event: ErrorEvent) => {
        reject({ xhr, event, settings });
      };

      xhr.ontimeout = (ev: ProgressEvent) => {
        reject({ xhr, event, settings });
      };

      if (settings.data) {
        xhr.send(settings.data);
      } else {
        xhr.send();
      }
    });
  }

  /**
   * Get a cookie from the document.
   */
  export
  function getCookie(name: string) {
    // from tornado docs: http://www.tornadoweb.org/en/stable/guide/security.html
    let r = document.cookie.match('\\b' + name + '=([^;]*)\\b');
    return r ? r[1] : void 0;
  }
}
