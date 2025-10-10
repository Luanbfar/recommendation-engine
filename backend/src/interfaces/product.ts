export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  vector: number[];
}

export interface ProductStaging {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  createdAt: Date;
  isProcessing: boolean;
}

export interface ProductRepository {
  findProductById(id: string): Promise<Product | null>;
  findProductByName(name: string): Promise<Product | null>;
  createProduct(productData: Partial<Product>): Promise<Product>;
  findSimilarProducts(vector: number[], limit: number): Promise<Product[]>;
  updateProduct(id: string, updateData: Partial<Product>): Promise<Product | null>;
  deleteProduct(id: string): Promise<boolean>;
}

export interface ProductStagingRepository {
  createProductStaging(productData: ProductStaging): Promise<ProductStaging>;
  findUnprocessedProducts(limit: number): Promise<ProductStaging[]>;
  toggleProcessing(ids: string[], isProcessing: boolean): Promise<void>;
  deleteProducts(ids: string[]): Promise<void>;
}
