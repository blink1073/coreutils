// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import * as posix
 from 'path-posix';


/**
 * The namespace for path-related functions.
 */
export
namespace Path {
  /**
   * Join a sequence of path components.
   *
   * @param parts - The url components.
   *
   * @returns the joined url.
   */
  export
  function join(...parts: string[]): string {
    return posix.join(...parts);
  }

  /**
   * Get the last portion of a path, similar to the Unix basename command.
   *
   * @param path - The file path.
   *
   * @param ext - An optional file extension.
   *
   * @returns - the basename of the path.
   */
  export
  function basename(path: string, ext?: string): string {
    return posix.basename(path, ext);
  }

  /**
   * Get the directory name of a path, similar to the Unix dirname command.
   *
   * @param path - The file path.
   *
   * @returns the directory name of the path.
   */
  export
  function dirname(path: string): string {
    return posix.dirname(path);
  }

  /**
   * Get the extension of the path.
   *
   * @param path - The file path.
   *
   * @returns the extension of the file.
   *
   * #### Notes
   * The extension is the string from the last occurance of the `.`
   * character to end of string in the last portion of the path, inclusive.
   * If there is no `.` in the last portion of the path, or if the first
   * character of the basename of path [[basename]] is `.`, then an
   * empty string is returned.
   */
  export
  function extname(path: string): string {
    return posix.extname(path);
  }

  /**
   * Normalize the given path, resolving '..' and '.' segments.
   *
   * @param path - The file path.
   *
   * @returns the normalized path.
   */
  export
  function normalize(path: string): string {
    return posix.normalize(path);
  }

  /**
   * Resolve a sequence of paths or path segments into an absolute path.
   *
   * @param parts - The path parts.
   *
   * @returns the resolved path.
   */
  export
  function resolve(...parts: string[]): string {
    return posix.resolve(...parts);
  }

  /**
   * Find the relative path from `from` to `to`.
   *
   * @param from - the source path.
   *
   * @param to - the target path.
   *
   * @returns the relative path.
   *
   * #### Notes
   * If from and to each resolve to the same path (after calling
   * path.resolve() on each), a zero-length string is returned.
   * If a zero-length string is passed as from or to, `/`
   * will be used instead of the zero-length strings.
   */
  export
  function relative(from: string, to: string): string {
    return posix.relative(from, to);
  }

  /**
   * Determine if a path is an absolute path.
   *
   * @param path - the file path.
   *
   * @returns whether the path is an absolute path.
   */
  export
  function isAbsolute(path: string): boolean {
    return posix.isAbsolute(path);
  }

  /**
   * Normalize a file extension to be of the type `'.foo'`.
   *
   * @param extension - the file extension.
   *
   * @returns the normalized file extension.
   *
   * #### Notes
   * Adds a leading dot if not present and converts to lower case.
   */
  export
  function normalizeExtension(extension: string): string {
    if (extension.length > 0 && extension.indexOf('.') !== 0) {
      extension = `.${extension}`;
    }
    return extension;
  }
}
