import { ActorRdfUpdateQuadStreams } from '@comunica/bus-rdf-update-quad-streams';
import { Bus } from '@comunica/core';
import { ActorRdfUpdateQuadStreamsDelegateCombine } from '../lib/ActorRdfUpdateQuadStreamsDelegateCombine';

describe('ActorRdfUpdateQuadStreamsDelegateCombine', () => {
  let bus: any;

  beforeEach(() => {
    bus = new Bus({ name: 'bus' });
  });

  describe('An ActorRdfUpdateQuadStreamsDelegateCombine instance', () => {
    let actor: ActorRdfUpdateQuadStreamsDelegateCombine;

    beforeEach(() => {
      actor = new ActorRdfUpdateQuadStreamsDelegateCombine({ name: 'actor', bus });
    });

    it('should test', () => {
      return expect(actor.test({ todo: true })).resolves.toEqual({ todo: true }); // TODO
    });

    it('should run', () => {
      return expect(actor.run({ todo: true })).resolves.toMatchObject({ todo: true }); // TODO
    });
  });
});
