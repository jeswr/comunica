import 'cross-fetch/polyfill';
import { ProxyHandlerQueryOverride } from '../lib/ProxyHandlerQueryOverride';

describe('ProxyHandlerStatic', () => {
  let proxy: any;

  beforeEach(() => {
    proxy = new ProxyHandlerQueryOverride('SELECT ?s WHERE { ?s ?p ?o }');
  });

  it('should modify a string-based request', async() => {
    expect(await proxy.getProxy({ input: 'http://example.org/' }))
    // TODO: CHECK IF THIS SHOULD BE ENCODED, IE
      .toEqual({ input: 'http://example.org?query=SELECT ?s WHERE { ?s ?p ?o }' });
  });

  it('should modify a string-based request with init', async() => {
    expect(await proxy.getProxy({ input: 'http://example.org/', init: { a: 'B' }}))
      .toEqual({ input: 'http://example.org?query=SELECT ?s WHERE { ?s ?p ?o }', init: { a: 'B' }});
  });

  it('should modify an object-based request', async() => {
    expect(await proxy.getProxy({ input: new Request('http://example.org/') }))
      .toEqual({ input: new Request('http://example.org?query=SELECT ?s WHERE { ?s ?p ?o }') });
  });

  it('should modify an object-based request with options', async() => {
    const init = { headers: new Headers({ a: 'b' }) };
    expect(await proxy.getProxy({ input: new Request('http://example.org?query=SELECT ?s WHERE { ?s ?p ?o }', init) }))
      .toEqual({ input: new Request('http://example.org?query=SELECT ?s WHERE { ?s ?p ?o }', init) });
  });
});
