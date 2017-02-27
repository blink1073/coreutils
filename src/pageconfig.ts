// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
  JSONObject
} from '@phosphor/coreutils';

import * as minimist
  from 'minimist';

import {
  URL
} from './url';


/**
 * Declare a stub for the node process variable.
 */
declare var process: any;


/**
 * The namespace for Page Config functions.
 */
export
namespace PageConfig {
  /**
   * Get global configuration data for the Jupyter application.
   *
   * @param name - The name of the configuration option.
   *
   * @returns The config value or `undefined` if not found.
   *
   * #### Notes
   * For browser based applications, it is assumed that the page HTML
   * includes a script tag with the id `jupyter-config-data` containing the
   * configuration as valid JSON.
   */
  export
  function getOption(name: string): string {
    if (Private.configData) {
      return Private.configData[name];
    }
    let data: { [arg: string]: any } = Object.create(null);
    if (typeof window === 'undefined') {
      data = minimist(process.argv.slice(2));
    } else {
      let el = document.getElementById('jupyter-config-data');
      if (el) {
        data = JSON.parse(el.textContent) as JSONObject;
      }
    }
    for (let key in data) {
      Private.configData[key] = String(data[key]);
    }
  }

  /**
   * Get the base URL for a Jupyter application.
   */
  export
  function getBaseUrl(): string {
    let baseUrl = getOption('baseUrl');
    if (!baseUrl || baseUrl === '/') {
      baseUrl = (typeof location === 'undefined' ?
                 'http://localhost:8888/' : location.origin + '/');
    }
    return baseUrl;
  }

  /**
   * Get the base websocket URL for a Jupyter application.
   */
  export
  function getWsUrl(baseUrl?: string): string {
    let wsUrl = getOption('wsUrl');
    if (!wsUrl) {
      baseUrl = baseUrl || getBaseUrl();
      if (baseUrl.indexOf('http') !== 0) {
        if (typeof location !== 'undefined') {
          baseUrl = URL.join(location.origin, baseUrl);
        } else {
          baseUrl = URL.join('http://localhost:8888/', baseUrl);
        }
      }
      wsUrl = 'ws' + baseUrl.slice(4);
    }
    return wsUrl;
  }
}


/**
 * The namespace for module private data.
 */
namespace Private {
  /**
   * Page config data for the Jupyter application.
   */
  export
  const configData: { [key: string]: string } = Object.create(null);
}
