import { ActorRdfUpdateQuads } from '@comunica/bus-rdf-update-quads';
import { Bus } from '@comunica/core';
import { ActorRdfUpdateQuadsSparqlEndpoint } from '../lib/ActorRdfUpdateQuadsSparqlEndpoint';

describe('ActorRdfUpdateQuadsSparqlEndpoint', () => {
  let bus: any;

  beforeEach(() => {
    bus = new Bus({ name: 'bus' });
  });

  describe('An ActorRdfUpdateQuadsSparqlEndpoint instance', () => {
    let actor: ActorRdfUpdateQuadsSparqlEndpoint;

    beforeEach(() => {
      actor = new ActorRdfUpdateQuadsSparqlEndpoint({ name: 'actor', bus });
    });

    it('should test', () => {
      return expect(actor.test({ todo: true })).resolves.toEqual({ todo: true }); // TODO
    });

    it('should run', () => {
      return expect(actor.run({ todo: true })).resolves.toMatchObject({ todo: true }); // TODO
    });
  });
});
