import { IActionHttp, IActorHttpOutput } from '@comunica/bus-http';
import { ActorRdfUpdateQuads, IActionRdfUpdateQuads, IActorRdfUpdateQuadsOutput } from '@comunica/bus-rdf-update-quads';
import { ActionContext, Actor, IActorArgs, IActorTest, Mediator } from '@comunica/core';
import { DataSourceUtils } from '@comunica/utils-datasource';
import { Factory, toSparql } from 'sparqlalgebrajs';
import { SparqlEndpointFetcher } from 'fetch-sparql-endpoint';
import { getDataSourceType, getDataSourceValue } from '@comunica/bus-rdf-resolve-quad-pattern';
import * as RDF from 'rdf-js';
import { Pattern } from 'sparqlalgebrajs/lib/algebra';
import { QuadStream } from '@comunica/bus-query-operation';
import { AsyncIterator } from 'asynciterator';

/**
 * A comunica Sparql Endpoint RDF Update Quads Actor.
 */
export class ActorRdfUpdateQuadsSparqlEndpoint extends ActorRdfUpdateQuads {
  protected static readonly FACTORY: Factory = new Factory();

  public readonly mediatorHttp: Mediator<Actor<IActionHttp, IActorTest, IActorHttpOutput>,
    IActionHttp, IActorTest, IActorHttpOutput>;

  public readonly endpointFetcher: SparqlEndpointFetcher;

  protected lastContext?: ActionContext;

  public constructor(args: IActorArgs<IActionRdfUpdateQuads, IActorTest, IActorRdfUpdateQuadsOutput>) {
    super(args);
    // TODO: Make sure endpoint fetcher is selecting and endpoint that allows updates
    this.endpointFetcher = new SparqlEndpointFetcher({
      fetch: (input: Request | string, init?: RequestInit) => this.mediatorHttp.mediate(
        { input, init, context: this.lastContext },
      ),
      prefixVariableQuestionMark: true,
    });
  }

  // TODO: Add test to ensure update requests are allowed.
  public async testOperation(action: IActionRdfUpdateQuads): Promise<IActorTest> {
    const source = await DataSourceUtils.getSingleSource(action.context);
    if (!source) {
      throw new Error('Illegal state: undefined sparql endpoint source.');
    }
    if (source && getDataSourceType(source) === 'sparql') {
      return { httpRequests: 1 };
    }
    throw new Error(`${this.name} requires a single source with a 'sparql' endpoint to be present in the context.`);
  }

  public async runOperation(action: IActionRdfUpdateQuads): Promise<IActorRdfUpdateQuadsOutput> {
    const source = await DataSourceUtils.getSingleSource(action.context);
    if (!source) {
      throw new Error('Illegal state: undefined sparql endpoint source.');
    }
    const endpoint: string = <string> getDataSourceValue(source);
    this.lastContext = action.context;

    let quadStreamInserted: QuadStream | undefined = undefined;
    let quadStreamDeleted: QuadStream | undefined = undefined;

    // TODO: Break up into batches for large sets of quads
    let insertions: Pattern[] | undefined = undefined;
    let deletions: Pattern[] | undefined = undefined;
    if (action.quadStreamInsert) {
      insertions = [];
      quadStreamInserted = new AsyncIterator<RDF.Quad>();
      let quad: RDF.Quad | null = null;
      while (quad = action.quadStreamInsert.read()) {
        quadStreamInserted.append([ quad ]);
        insertions.push(
          ActorRdfUpdateQuadsSparqlEndpoint.FACTORY.createPattern(
            quad.subject,
            quad.predicate,
            quad.object,
            quad.graph
          )
        );
      }
    }
    if (action.quadStreamDelete) {
      deletions = [];
      quadStreamDeleted = new AsyncIterator<RDF.Quad>();
      let quad: RDF.Quad | null = null;
      while (quad = action.quadStreamDelete.read()) {
        quadStreamDeleted.append([ quad ]);
        deletions.push(
          ActorRdfUpdateQuadsSparqlEndpoint.FACTORY.createPattern(
            quad.subject,
            quad.predicate,
            quad.object,
            quad.graph
          )
        );
      }
    }

    const query = toSparql(ActorRdfUpdateQuadsSparqlEndpoint.FACTORY.createDeleteInsert(deletions, insertions));
    try {
      // TODO: REPLACE WITH await this.endpointFetcher.fetchUpdate(endpoint, query);
      const init = {
        method: 'POST',
        headers: {
          'content-type': 'application/sparql-update',
        },
        body: query,
      }
      // @ts-ignore [ IGNORING MAKING HANDLE FETCH CALL PRIVATE ]
      await this.endpointFetcher.handleFetchCall(endpoint, init);
    } catch (e) {
      // If the query is unsuccessful we return no insertions or deletions.
      return {};
    };
    return {
      quadStreamInserted,
      quadStreamDeleted
    }
  }
}
