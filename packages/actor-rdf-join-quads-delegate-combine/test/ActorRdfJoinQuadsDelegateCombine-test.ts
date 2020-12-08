import { ActorRdfJoinQuads } from '@comunica/bus-rdf-join-quads';
import { Bus } from '@comunica/core';
import { ActorRdfJoinQuadsDelegateCombine } from '../lib/ActorRdfJoinQuadsDelegateCombine';

describe('ActorRdfJoinQuadsDelegateCombine', () => {
  let bus: any;

  beforeEach(() => {
    bus = new Bus({ name: 'bus' });
  });

  describe('An ActorRdfJoinQuadsDelegateCombine instance', () => {
    let actor: ActorRdfJoinQuadsDelegateCombine;

    beforeEach(() => {
      actor = new ActorRdfJoinQuadsDelegateCombine({ name: 'actor', bus });
    });

    it('should test', () => {
      return expect(actor.test({ todo: true })).resolves.toEqual({ todo: true }); // TODO
    });

    it('should run', () => {
      return expect(actor.run({ todo: true })).resolves.toMatchObject({ todo: true }); // TODO
    });
  });
});
