import { IActionHttp, IActorHttpOutput } from '@comunica/bus-http';
import { ActorRdfUpdateQuads, IActionRdfUpdateQuads, IActorRdfUpdateQuadsOutput } from '@comunica/bus-rdf-update-quads';
import { ActionContext, Actor, IActorArgs, IActorTest, Mediator } from '@comunica/core';
import { DataSourceUtils } from '@comunica/utils-datasource';
import { Factory, toSparql } from 'sparqlalgebrajs';
import { SparqlEndpointFetcher } from 'fetch-sparql-endpoint';
import { getDataSourceType, getDataSourceValue } from '@comunica/bus-rdf-resolve-quad-pattern';
import * as RDF from 'rdf-js';
import { Pattern } from 'sparqlalgebrajs/lib/algebra';
// import { QuadStream } from '@comunica/bus-query-operation';
// import { AsyncIterator } from 'asynciterator';
// import arrayifyStream from 'arrayify-stream'

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
    console.log("test sparql operation")
    const source = await DataSourceUtils.getSingleSource(action.context);
    if (!source) {
      console.log("a");
      throw new Error('Illegal state: undefined sparql endpoint source.');
    }
    // @ts-ignore AFTER `||` is hacky workaround - do not use in production
    if (source && getDataSourceType(source) === 'sparql'
      // @ts-ignore
      || (getDataSourceType(source) === undefined && /\/sparql$/.test(source?.value ?? ''))
      // This is for the default apache jena fuseki config
      // @ts-ignore
      || (getDataSourceType(source) === undefined && /\/update$/.test(source?.value ?? ''))
    ) {
      return { httpRequests: 1 };
    }
    console.log(this)
    console.log("Throwing error for sparql endpoint")
    throw new Error(`${this.name} requires a single source with a 'sparql' endpoint to be present in the context.`);
  }

  public async runOperation(action: IActionRdfUpdateQuads): Promise<IActorRdfUpdateQuadsOutput> {
    console.log("Run sparql operation")
    const source = await DataSourceUtils.getSingleSource(action.context);
    if (!source) {
      throw new Error('Illegal state: undefined sparql endpoint source.');
    }
    const endpoint: string = <string>getDataSourceValue(source);
    this.lastContext = action.context;

    const insertions: Pattern[] | undefined = await action.quadStreamInsert
      ? await require('arrayify-stream')(action.quadStreamInsert)
        .then((array: RDF.Quad[]) => {
          console.log("inside then", array);
          if (array.length === 0) {
            return undefined;
          } else {
            return array.map(quad => ActorRdfUpdateQuadsSparqlEndpoint.FACTORY.createPattern(
              quad.subject,
              quad.predicate,
              quad.object,
              quad.graph
            ))
          }
        }).catch((e: Error) => {
          console.log(e)
        })
      : undefined;
    
    console.log(insertions)

    const deletions: Pattern[] | undefined = action.quadStreamDelete
      ? await require('arrayify-stream')(action.quadStreamDelete)
        .then((array: RDF.Quad[]) => {
          if (array.length === 0) {
            return undefined;
          } else {
            return array.map(quad => ActorRdfUpdateQuadsSparqlEndpoint.FACTORY.createPattern(
              quad.subject,
              quad.predicate,
              quad.object,
              quad.graph
            ))
          }
        })
      : undefined;

    const query = toSparql(ActorRdfUpdateQuadsSparqlEndpoint.FACTORY.createDeleteInsert(deletions, insertions));
    try {
      await this.endpointFetcher.fetchUpdate(endpoint, query);
    } catch (e) {
      return {};
    };
    return {
      quadStreamInserted : action.quadStreamInsert,
      quadStreamDeleted: action.quadStreamDelete
    }
  }
}
