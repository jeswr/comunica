import { ActionContext, Bus } from '@comunica/core';
import type * as RDF from '@rdfjs/types';
import { ArrayIterator, empty, single } from 'asynciterator';
import { Store } from 'n3';
import { DataFactory } from 'rdf-data-factory';
import { ActorRdfUpdateQuadsRdfJsStore } from '../lib/ActorRdfUpdateQuadsRdfJsStore';
import { RdfJsQuadDestination } from '../lib/RdfJsQuadDestination';
import 'jest-rdf';

const DF = new DataFactory();
const arrayifyStream = require('arrayify-stream');

describe('ActorRdfUpdateQuadsRdfJsStore', () => {
  let bus: any;
  let destination: RdfJsQuadDestination;

  beforeEach(() => {
    bus = new Bus({ name: 'bus' });
  });

  describe('An ActorRdfUpdateQuadsRdfJsStore instance', () => {
    let destination: RdfJsQuadDestination;
    let store: RDF.Store;

    beforeEach(() => {
      store = new Store();
      destination = new RdfJsQuadDestination(store);
    });

    it('should insert empty stream', async () => {
      await destination.insert(empty());
      expect(await arrayifyStream(store.match())).toBeRdfIsomorphic([]);
    })

    it('should insert single quad', async () => {
      await destination.insert(single(DF.quad(DF.namedNode('sd1'), DF.namedNode('pd1'), DF.namedNode('od1'))));
      expect(await arrayifyStream(store.match())).toBeRdfIsomorphic([
        DF.quad(DF.namedNode('sd1'), DF.namedNode('pd1'), DF.namedNode('od1')),
      ]);
    })

    it('should insert/delete single quad', async () => {
      await destination.insert(single(DF.quad(DF.namedNode('sd1'), DF.namedNode('pd1'), DF.namedNode('od1'))));
      await destination.delete(single(DF.quad(DF.namedNode('sd1'), DF.namedNode('pd1'), DF.namedNode('od1'))));
      expect(await arrayifyStream(store.match())).toBeRdfIsomorphic([]);
    })

  });
});
