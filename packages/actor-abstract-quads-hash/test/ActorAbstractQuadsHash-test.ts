import { ActorAbstract } from '@comunica/bus-abstract';
import { Bus } from '@comunica/core';
import { ActorAbstractQuadsHash } from '../lib/ActorAbstractQuadsHash';

describe('ActorAbstractQuadsHash', () => {
  let bus: any;

  beforeEach(() => {
    bus = new Bus({ name: 'bus' });
  });

  describe('An ActorAbstractQuadsHash instance', () => {
    let actor: ActorAbstractQuadsHash;

    beforeEach(() => {
      actor = new ActorAbstractQuadsHash({ name: 'actor', bus });
    });

    it('should test', () => {
      return expect(actor.test({ todo: true })).resolves.toEqual({ todo: true }); // TODO
    });

    it('should run', () => {
      return expect(actor.run({ todo: true })).resolves.toMatchObject({ todo: true }); // TODO
    });
  });
});
