import { ActorRdfCombineQuads } from '@comunica/bus-rdf-combine-quads';
import { Bus } from '@comunica/core';
import { ActorRdfCombineQuadsHashSingleNoHistory } from '../lib/ActorRdfCombineQuadsHashSingleNoHistory';

describe('ActorRdfCombineQuadsHashSingleNoHistory', () => {
  let bus: any;

  beforeEach(() => {
    bus = new Bus({ name: 'bus' });
  });

  describe('An ActorRdfCombineQuadsHashSingleNoHistory instance', () => {
    let actor: ActorRdfCombineQuadsHashSingleNoHistory;

    beforeEach(() => {
      actor = new ActorRdfCombineQuadsHashSingleNoHistory({ name: 'actor', bus });
    });

    it('should test', () => {
      return expect(actor.test({ todo: true })).resolves.toEqual({ todo: true }); // TODO
    });

    it('should run', () => {
      return expect(actor.run({ todo: true })).resolves.toMatchObject({ todo: true }); // TODO
    });
  });
});
