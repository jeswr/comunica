import type {
  IActorQueryOperationOutputUpdate,
} from '@comunica/bus-query-operation';
import { KEY_CONTEXT_READONLY } from '@comunica/bus-query-operation';
import { ActionContext, Bus } from '@comunica/core';
import { DataFactory } from 'rdf-data-factory';
import { ActorQueryOperationCreate } from '../lib/ActorQueryOperationCreate';
const DF = new DataFactory();

describe('ActorQueryOperationCreate', () => {
  let bus: any;
  let mediatorQueryOperation: any;
  let mediatorUpdateQuads: any;

  beforeEach(() => {
    bus = new Bus({ name: 'bus' });
    mediatorUpdateQuads = {
      mediate: jest.fn(() => Promise.resolve({
        updateResult: Promise.resolve(),
      })),
    };
  });

  describe('An ActorQueryOperationCreate instance', () => {
    let actor: ActorQueryOperationCreate;

    beforeEach(() => {
      actor = new ActorQueryOperationCreate({ name: 'actor', bus, mediatorQueryOperation, mediatorUpdateQuads });
    });

    it('should test on create', () => {
      const op: any = { operation: { type: 'create' }};
      return expect(actor.test(op)).resolves.toBeTruthy();
    });

    it('should not test on readOnly', () => {
      const op: any = { operation: { type: 'create' }, context: ActionContext({ [KEY_CONTEXT_READONLY]: true }) };
      return expect(actor.test(op)).rejects.toThrowError(`Attempted a write operation in read-only mode`);
    });

    it('should not test on non-create', () => {
      const op: any = { operation: { type: 'some-other-type' }};
      return expect(actor.test(op)).rejects.toBeTruthy();
    });

    it('should run in normal mode', async() => {
      const op: any = {
        operation: {
          type: 'create',
          source: DF.namedNode('g1'),
          silent: false,
        },
      };
      const output = <IActorQueryOperationOutputUpdate> await actor.run(op);
      expect(output.type).toEqual('update');
      await expect(output.updateResult).resolves.toBeUndefined();
      expect(mediatorUpdateQuads.mediate.mock.calls[0][0].createGraphs).toEqual({
        graphs: [ DF.namedNode('g1') ],
        requireNonExistence: true,
      });
    });

    it('should run in silent mode', async() => {
      const op: any = {
        operation: {
          type: 'create',
          source: DF.namedNode('g1'),
          silent: true,
        },
      };
      const output = <IActorQueryOperationOutputUpdate> await actor.run(op);
      expect(output.type).toEqual('update');
      await expect(output.updateResult).resolves.toBeUndefined();
      expect(mediatorUpdateQuads.mediate.mock.calls[0][0].createGraphs).toEqual({
        graphs: [ DF.namedNode('g1') ],
        requireNonExistence: false,
      });
    });
  });
});
