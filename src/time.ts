// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import * as moment
 from 'moment';


/**
 * The namespace for date functions.
 */
export
namespace Time {
  /**
   * Convert a timestring to a human readable string (e.g. 'two minutes ago').
   *
   * @param value - The date timestring.
   *
   * @returns A formatted date.
   */
  export
  function formatHuman(value: string): string {
    let time = moment(value).fromNow();
    time = time === 'a few seconds ago' ? 'seconds ago' : time;
    return time;
  }

  /**
   * Convert a timestring to a date format.
   *
   * @param value - The date timestring.
   *
   * @param format - The format string.
   *
   * @returns A formatted date.
   */
  export
  function format(value: string, format='YYYY-MM-DD HH:mm'): string {
    return moment(value).format(format);
  }
}
