declare module '@zilliz/milvus2-sdk-node' {
  export class MilvusClient {
    constructor(config: { address: string; token?: string; ssl?: boolean });
    createCollection(params: CollectionCreateParams): Promise<void>;
    insert(params: InsertParams): Promise<InsertResponse>;
    search(params: SearchParams): Promise<SearchResponse>;
    query(params: QueryParams): Promise<QueryResponse>;
    loadCollectionSync(params: LoadParams): Promise<void>;
    createIndex(params: IndexParams): Promise<void>;
    listCollections(): Promise<any[]>;
  }

  export interface CollectionCreateParams {
    collection_name: string;
    fields: FieldSchema[];
    enable_dynamic_field?: boolean;
  }

  export interface FieldSchema {
    name: string;
    data_type: DataType;
    is_primary_key?: boolean;
    max_length?: number;
    dim?: number;
  }

  export enum DataType {
    VARCHAR = 'VARCHAR',
    FLOAT_VECTOR = 'FLOAT_VECTOR',
    JSON = 'JSON'
  }
}