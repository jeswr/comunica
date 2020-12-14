import { SparqlEndpointFetcher } from 'fetch-sparql-endpoint';

(async () => {
  console.log("before await");
  await (new SparqlEndpointFetcher).fetchUpdate("http://rsmsrv01.nci.org.au:8080/fuseki/Wikidata/update", "INSERT DATA { GRAPH <http://www.wikidata.org/Human-en-gb-Subset> { <http://example.org/james> <http://example.org/funkyLable> \"Funky label\" } }")
  console.log("after await");
})()