// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
  expect
} from 'chai';

import {
  Path
} from '..';


const TESTPATH = '/foo/test/simple/test-path.js';


describe('@jupyterlab/coreutils', () => {

  describe('Path', () => {

    describe('.join()', () => {

      it('should join the arguments and normalize the path', () => {
        let path = Path.join('/foo', '../../../bar');
        expect(path).to.equal('/bar');
      });

    });

    describe('.basename()', () => {

      it('should return the last portion of a path', () => {
        expect(Path.basename(TESTPATH)).to.equal('test-path.js');
      });

    });

    describe('.dirname()', () => {

      it('should get the directory name of a path', () => {
        expect(Path.dirname(TESTPATH)).to.equal('/foo/test/simple');
      });

    });

    describe('.extname()', () => {

      it('should get the file extension of the path', () => {
        expect(Path.extname(TESTPATH)).to.equal('.js');
      });

      it('should only take the last occurance of a dot', () => {
        expect(Path.extname('foo.tar.gz')).to.equal('.gz');
      });

    });

    describe('.normalize()', () => {

      it('should normalize a string path', () => {
        let path = Path.normalize('./fixtures///b/../b/c.js');
        expect(path).to.equal('fixtures/b/c.js');
      });

    });

    describe('.resolve()', () => {

      it('should resolve a sequence of paths to an absolute path', () => {
        let path = Path.resolve('/var/lib', '../', 'file/');
        expect(path).to.equal('/var/file');
      });

    });

    describe('.relative()', () => {

      it('should solve the relative path', () => {
        let path = Path.relative('/var/lib', '/var/apache');
        expect(path).to.equal('../apache');
      });

    });

    describe('.isAbsolute()', () => {

      it('should determine whether a path is absolute', () => {
        expect(Path.isAbsolute('/home/foo')).to.equal(true);
        expect(Path.isAbsolute('./baz')).to.equal(false);
      });

    });

    describe('.normalizeExtension()', () => {

      it('should normalize a file extension to be of type `.foo`', () => {
        expect(Path.normalizeExtension('foo')).to.equal('.foo');
        expect(Path.normalizeExtension('.bar')).to.equal('.bar');
      });

    });

  });

});
