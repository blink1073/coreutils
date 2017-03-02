// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
  expect
} from 'chai';

import {
  URLExt
} from '..';


describe('@jupyterlab/coreutils', () => {

  describe('URLExt', () => {

    describe('.parse()', () => {

      it('should parse a url into a URLExt object', () => {
        let obj = URLExt.parse('http://www.example.com');
        expect(obj.href).to.equal('http://www.example.com/');
        expect(obj.protocol).to.equal('http:');
        expect(obj.slashes).to.equal(true);
        expect(obj.host).to.equal('www.example.com');
        expect(obj.hostname).to.equal('www.example.com');
        expect(obj.pathname).to.equal('/');
        expect(obj.path).to.equal('/');
      });

      it('should handle query and hash', () => {
        let obj = URLExt.parse('http://x.com/path?that\'s#all, folks');
        expect(obj.href).to.equal('http://x.com/path?that%27s#all,%20folks');
        expect(obj.protocol).to.equal('http:');
        expect(obj.slashes).to.equal(true);
        expect(obj.host).to.equal('x.com');
        expect(obj.hostname).to.equal('x.com');
        expect(obj.search).to.equal('?that%27s');
        expect(obj.query).to.equal('that%27s');
        expect(obj.pathname).to.equal('/path');
        expect(obj.hash).to.equal('#all,%20folks');
        expect(obj.path).to.equal('/path?that%27s');
      });

    });

    describe('.resolve()', () => {

      it('should resolve a target URLExt relative to a base url', () => {
        let path = URLExt.resolve('/foo/bar/baz', '/bar');
        expect(path).to.equal('/bar');
        expect(URLExt.resolve('/foo/bar', '.')).to.equal('/foo/');
        path = URLExt.resolve(
          'http://example.com/b//c//d;p?q#blarg',
          'https://u:p@h.com/p/a/t/h?s#hash2'
        );
        expect(path).to.equal('https://u:p@h.com/p/a/t/h?s#hash2');
      });

    });

    describe('.join()', () => {

      it('should join a sequence of url components', () => {
        expect(URLExt.join('/foo/', 'bar/')).to.equal('/foo/bar/');
      });

    });

    describe('.encodeParts()', () => {

      it('should encode and join a sequence of url components', () => {
        expect(URLExt.encodeParts('>/>')).to.equal('%3E/%3E');
      });

    });

    describe('objectToQueryString()', () => {

      it('should return a serialized object string suitable for a query', () => {
        let obj = {
          name: 'foo',
          id: 'baz'
        };
        expect(URLExt.objectToQueryString(obj)).to.equal('?name=foo&id=baz');
      });

    });

    describe('.isLocal()', () => {

      it('should test whether the url is a local url', () => {
        expect(URLExt.isLocal('//foo')).to.equal(false);
        expect(URLExt.isLocal('http://foo')).to.equal(false);
        expect(URLExt.isLocal('/foo/bar')).to.equal(true);
        expect(URLExt.isLocal('foo.txt')).to.equal(true);
      });

    });

  });


});
