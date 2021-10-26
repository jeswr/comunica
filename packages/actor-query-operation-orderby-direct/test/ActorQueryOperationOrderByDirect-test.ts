import { ActorQueryOperation, Bindings } from '@comunica/bus-query-operation';
import { Bus } from '@comunica/core';
import { ArrayIterator } from 'asynciterator';
import { DataFactory } from 'rdf-data-factory';
import { Algebra } from 'sparqlalgebrajs';
import { ActorQueryOperationOrderByDirect } from '../lib/ActorQueryOperationOrderByDirect';
const arrayifyStream = require('arrayify-stream');
const DF = new DataFactory();

describe('ActorQueryOperationOrderByDirect', () => {
  let bus: any;
  let mediatorQueryOperation: any;

  beforeEach(() => {
    bus = new Bus({ name: 'bus' });
    mediatorQueryOperation = {
      mediate: (arg: any) => Promise.resolve({
        bindingsStream: new ArrayIterator([
          Bindings({ '?a': DF.literal('2') }),
          Bindings({ '?a': DF.literal('1') }),
          Bindings({ '?a': DF.literal('3') }),
        ]),
        metadata: () => Promise.resolve({ cardinality: 3 }),
        operated: arg,
        type: 'bindings',
        variables: [ '?a' ],
        canContainUndefs: false,
      }),
    };
  });

  describe('The ActorQueryOperationOrderByDirect module', () => {
    it('should be a function', () => {
      expect(ActorQueryOperationOrderByDirect).toBeInstanceOf(Function);
    });

    it('should be a ActorQueryOperationOrderByDirect constructor', () => {
      expect(new (<any> ActorQueryOperationOrderByDirect)({ name: 'actor', bus, mediatorQueryOperation }))
        .toBeInstanceOf(ActorQueryOperationOrderByDirect);
      expect(new (<any> ActorQueryOperationOrderByDirect)({ name: 'actor', bus, mediatorQueryOperation }))
        .toBeInstanceOf(ActorQueryOperation);
    });

    it('should not be able to create new ActorQueryOperationOrderByDirect objects without \'new\'', () => {
      expect(() => { (<any> ActorQueryOperationOrderByDirect)(); }).toThrow();
    });
  });

  describe('An ActorQueryOperationOrderByDirect instance', () => {
    let actor: ActorQueryOperationOrderByDirect;
    let orderA: Algebra.TermExpression;
    let orderB: Algebra.TermExpression;
    let descOrderA: Algebra.OperatorExpression;
    let orderA1: Algebra.OperatorExpression;

    beforeEach(() => {
      actor = new ActorQueryOperationOrderByDirect({ name: 'actor', bus, mediatorQueryOperation });
      orderA = { type: Algebra.types.EXPRESSION, expressionType: Algebra.expressionTypes.TERM, term: DF.variable('a') };
      orderB = { type: Algebra.types.EXPRESSION, expressionType: Algebra.expressionTypes.TERM, term: DF.variable('b') };
      descOrderA = {
        type: Algebra.types.EXPRESSION,
        expressionType: Algebra.expressionTypes.OPERATOR,
        operator: 'desc',
        args: [ orderA ],
      };
      orderA1 = {
        args: [
          orderA,
          { type: Algebra.types.EXPRESSION, expressionType: Algebra.expressionTypes.TERM, term: DF.literal('1') },
        ],
        expressionType: Algebra.expressionTypes.OPERATOR,
        operator: '+',
        type: Algebra.types.EXPRESSION,
      };
    });

    it('should test on orderby', () => {
      const op: any = { operation: { type: 'orderby', expressions: []}};
      return expect(actor.test(op)).resolves.toBeTruthy();
    });

    it('should test on a descending orderby', () => {
      const op: any = { operation: { type: 'orderby', expressions: [ descOrderA ]}};
      return expect(actor.test(op)).resolves.toBeTruthy();
    });

    it('should test on multiple expressions', () => {
      const op: any = { operation: { type: 'orderby', expressions: [ orderA, descOrderA, orderA1 ]}};
      return expect(actor.test(op)).resolves.toBeTruthy();
    });

    it('should not test on non-orderby', () => {
      const op: any = { operation: { type: 'some-other-type' }};
      return expect(actor.test(op)).rejects.toBeTruthy();
    });

    it('should run', async() => {
      const op: any = { operation: { type: 'orderby', input: {}, expressions: [ orderA ]}};
      const output = await actor.run(op);
      const array = await arrayifyStream(ActorQueryOperation.getSafeBindings(output).bindingsStream);
      expect(array).toMatchObject([
        Bindings({ '?a': DF.literal('1') }),
        Bindings({ '?a': DF.literal('2') }),
        Bindings({ '?a': DF.literal('3') }),
      ]);
    });

    it('should run with a window', async() => {
      actor = new ActorQueryOperationOrderByDirect({ name: 'actor', bus, mediatorQueryOperation, window: 1 });
      const op: any = { operation: { type: 'orderby', input: {}, expressions: [ orderA ]}};
      const output = await actor.run(op);
      expect(ActorQueryOperation.getSafeBindings(output).canContainUndefs).toEqual(false);
      const array = await arrayifyStream(ActorQueryOperation.getSafeBindings(output).bindingsStream);
      expect(array).toMatchObject([
        Bindings({ '?a': DF.literal('2') }),
        Bindings({ '?a': DF.literal('1') }),
        Bindings({ '?a': DF.literal('3') }),
      ]);
    });

    it('should run operator expressions', async() => {
      const op: any = { operation: { type: 'orderby', input: {}, expressions: [ orderA1 ]}};
      const output = await actor.run(op);
      expect(ActorQueryOperation.getSafeBindings(output).canContainUndefs).toEqual(false);
      const array = await arrayifyStream(ActorQueryOperation.getSafeBindings(output).bindingsStream);
      expect(array).toMatchObject([
        Bindings({ '?a': DF.literal('1') }),
        Bindings({ '?a': DF.literal('2') }),
        Bindings({ '?a': DF.literal('3') }),
      ]);
    });

    it('should run descend', async() => {
      const op: any = { operation: { type: 'orderby', input: {}, expressions: [ descOrderA ]}};
      const output = await actor.run(op);
      expect(ActorQueryOperation.getSafeBindings(output).canContainUndefs).toEqual(false);
      const array = await arrayifyStream(ActorQueryOperation.getSafeBindings(output).bindingsStream);
      expect(array).toMatchObject([
        Bindings({ '?a': DF.literal('3') }),
        Bindings({ '?a': DF.literal('2') }),
        Bindings({ '?a': DF.literal('1') }),
      ]);
    });

    it('should ignore undefined results', async() => {
      const op: any = { operation: { type: 'orderby', input: {}, expressions: [ orderB ]}};
      const output = await actor.run(op);
      expect(ActorQueryOperation.getSafeBindings(output).canContainUndefs).toEqual(false);
      const array = await arrayifyStream(ActorQueryOperation.getSafeBindings(output).bindingsStream);
      expect(array).toMatchObject([
        Bindings({ '?a': DF.literal('2') }),
        Bindings({ '?a': DF.literal('1') }),
        Bindings({ '?a': DF.literal('3') }),
      ]);
    });
  });
});
