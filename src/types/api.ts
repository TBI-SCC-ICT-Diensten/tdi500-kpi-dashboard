export interface SparqlValue {
  type: 'uri' | 'literal' | 'typed-literal' | 'bnode';
  value: string;
  datatype?: string;
  'xml:lang'?: string;
}

export interface SparqlBinding {
  [key: string]: SparqlValue;
}

export interface SparqlResponse {
  head: {
    vars: string[];
  };
  results: {
    bindings: SparqlBinding[];
  };
}

export interface ApiError {
  message: string;
  statusCode?: number;
  endpoint?: string;
}