// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
  expect
} from 'chai';

import {
  PageConfig
} from '..';


describe('@jupyterlab/coreutils', () => {

  describe('PageConfig', () => {

    describe('#getOption()', () => {

      it('should get a known option', () => {
        expect(PageConfig.getOption('foo')).to.equal('bar');
      });

      it('should return an empty string for an unknown option', () => {
        expect(PageConfig.getOption('bar')).to.equal('');
      });

    });

    describe('#getBaseUrl()', () => {

    });

    describe('#getWsUrl()', () => {

    });

  });

});
