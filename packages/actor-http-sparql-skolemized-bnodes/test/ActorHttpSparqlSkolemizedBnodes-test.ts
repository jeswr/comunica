import { ActorHttp } from '@comunica/bus-http';
import { Bus, ActionContext } from '@comunica/core';
import { ActorHttpSparqlSkolemizedBnodes } from '../lib/ActorHttpSparqlSkolemizedBnodes';

describe('ActorHttpSparqlSkolemizedBnodes', () => {
  let bus: any;

  beforeEach(() => {
    bus = new Bus({ name: 'bus' });
  });

  describe('An ActorHttpSparqlSkolemizedBnodes instance', () => {
    let actor: ActorHttpSparqlSkolemizedBnodes;

    beforeEach(() => {
      actor = new ActorHttpSparqlSkolemizedBnodes({ name: 'actor', bus });
    });

    it('should test', () => {
      return expect(actor.test({ context: ActionContext({ skolemized: true }) })).resolves.toEqual(false); // TODO
    });

    it('should run', () => {
      return expect(actor.run({ todo: true })).resolves.toMatchObject({ todo: true }); // TODO
    });
    
  });
});
