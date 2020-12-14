import { ActorRdfUpdateQuads } from '@comunica/bus-rdf-update-quads';
import { Bus } from '@comunica/core';
import { ActorRdfUpdateQuadsFile } from '../lib/ActorRdfUpdateQuadsFile';

describe('ActorRdfUpdateQuadsFile', () => {
  let bus: any;

  beforeEach(() => {
    bus = new Bus({ name: 'bus' });
  });

  describe('An ActorRdfUpdateQuadsFile instance', () => {
    let actor: ActorRdfUpdateQuadsFile;

    beforeEach(() => {
      actor = new ActorRdfUpdateQuadsFile({ name: 'actor', bus });
    });

    it('should test', () => {
      return expect(actor.test({ todo: true })).resolves.toEqual({ todo: true }); // TODO
    });

    it('should run', () => {
      return expect(actor.run({ todo: true })).resolves.toMatchObject({ todo: true }); // TODO
    });
  });
});
