import { ActorRdfCombineQuads } from '@comunica/bus-rdf-combine-quads';
import { Bus } from '@comunica/core';
import { ActorRdfCombineQuadsHashSingle } from '../lib/ActorRdfCombineQuadsHashSingle';

describe('ActorRdfCombineQuadsHashSingle', () => {
  let bus: any;

  beforeEach(() => {
    bus = new Bus({ name: 'bus' });
  });

  describe('An ActorRdfCombineQuadsHashSingle instance', () => {
    let actor: ActorRdfCombineQuadsHashSingle;

    beforeEach(() => {
      actor = new ActorRdfCombineQuadsHashSingle({ name: 'actor', bus });
    });

    it('should test', () => {
      return expect(actor.test({ todo: true })).resolves.toEqual({ todo: true }); // TODO
    });

    it('should run', () => {
      return expect(actor.run({ todo: true })).resolves.toMatchObject({ todo: true }); // TODO
    });
  });
});
