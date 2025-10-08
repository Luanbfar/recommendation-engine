export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  vector: number[];
}

export interface ProductRepository {
  findProductById(id: string): Promise<Product | null>;
  findProductByName(name: string): Promise<Product | null>;
  createProduct(productData: Partial<Product>): Promise<Product>;
  findSimilarProducts(vector: number[], limit: number): Promise<Product[]>;
  updateProduct(id: string, updateData: Partial<Product>): Promise<Product | null>;
  deleteProduct(id: string): Promise<boolean>;
}
