import { ActorRdfCombineQuads } from '@comunica/bus-rdf-combine-quads';
import { Bus } from '@comunica/core';
import { ActorRdfCombineQuadsHash } from '../lib/ActorRdfCombineQuadsHash';

describe('ActorRdfCombineQuadsHash', () => {
  let bus: any;

  beforeEach(() => {
    bus = new Bus({ name: 'bus' });
  });

  describe('An ActorRdfCombineQuadsHash instance', () => {
    let actor: ActorRdfCombineQuadsHash;

    beforeEach(() => {
      actor = new ActorRdfCombineQuadsHash({ name: 'actor', bus });
    });

    it('should test', () => {
      return expect(actor.test({ todo: true })).resolves.toEqual({ todo: true }); // TODO
    });

    it('should run', () => {
      return expect(actor.run({ todo: true })).resolves.toMatchObject({ todo: true }); // TODO
    });
  });
});
