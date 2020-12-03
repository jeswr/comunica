import type { IProxyHandler, IRequest } from './IProxyHandler';

/**
 * A proxy handler that ovverides the SPARQL query of a request
 */
export class ProxyHandlerQueryOverride implements IProxyHandler {
  private readonly query: string;

  public constructor(query: string) {
    this.query = query;
  }

  public async getProxy(request: IRequest): Promise<IRequest> {
    return {
      init: request.init,
      input: this.modifyInput(request.input),
    };
  }

  public modifyInput(input: RequestInfo): RequestInfo {
    if (typeof input === 'string') {
      const url = new URL(input);
      url.searchParams.set('query', this.query);
      return url.toString();
    }
    const url = new URL(input.url);
    url.searchParams.set('query', this.query);
    return new Request(url.toString(), input);
  }
}
