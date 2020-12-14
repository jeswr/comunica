import { ActorRdfUpdateQuads } from '@comunica/bus-rdf-update-quads';
import { Bus } from '@comunica/core';
import { ActorRdfUpdateQuadsHypermedia } from '../lib/ActorRdfUpdateQuadsHypermedia';

describe('ActorRdfUpdateQuadsHypermedia', () => {
  let bus: any;

  beforeEach(() => {
    bus = new Bus({ name: 'bus' });
  });

  describe('An ActorRdfUpdateQuadsHypermedia instance', () => {
    let actor: ActorRdfUpdateQuadsHypermedia;

    beforeEach(() => {
      actor = new ActorRdfUpdateQuadsHypermedia({ name: 'actor', bus });
    });

    it('should test', () => {
      return expect(actor.test({ todo: true })).resolves.toEqual({ todo: true }); // TODO
    });

    it('should run', () => {
      return expect(actor.run({ todo: true })).resolves.toMatchObject({ todo: true }); // TODO
    });
  });
});
