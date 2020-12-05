import { ActorRdfCombineQuads } from '@comunica/bus-rdf-combine-quads';
import { Bus } from '@comunica/core';
import { ActorRdfCombineQuadsHashNoHistory } from '../lib/ActorRdfCombineQuadsHashNoHistory';

describe('ActorRdfCombineQuadsHashNoHistory', () => {
  let bus: any;

  beforeEach(() => {
    bus = new Bus({ name: 'bus' });
  });

  describe('An ActorRdfCombineQuadsHashNoHistory instance', () => {
    let actor: ActorRdfCombineQuadsHashNoHistory;

    beforeEach(() => {
      actor = new ActorRdfCombineQuadsHashNoHistory({ name: 'actor', bus });
    });

    it('should test', () => {
      return expect(actor.test({ todo: true })).resolves.toEqual({ todo: true }); // TODO
    });

    it('should run', () => {
      return expect(actor.run({ todo: true })).resolves.toMatchObject({ todo: true }); // TODO
    });
  });
});
