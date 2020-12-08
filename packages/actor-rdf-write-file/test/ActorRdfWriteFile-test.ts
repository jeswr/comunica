import { ActorRdfWrite } from '@comunica/bus-rdf-write';
import { Bus } from '@comunica/core';
import { ActorRdfWriteFile } from '../lib/ActorRdfWriteFile';

describe('ActorRdfWriteFile', () => {
  let bus: any;

  beforeEach(() => {
    bus = new Bus({ name: 'bus' });
  });

  describe('An ActorRdfWriteFile instance', () => {
    let actor: ActorRdfWriteFile;

    beforeEach(() => {
      actor = new ActorRdfWriteFile({ name: 'actor', bus });
    });

    it('should test', () => {
      return expect(actor.test({ todo: true })).resolves.toEqual({ todo: true }); // TODO
    });

    it('should run', () => {
      return expect(actor.run({ todo: true })).resolves.toMatchObject({ todo: true }); // TODO
    });
  });
});
