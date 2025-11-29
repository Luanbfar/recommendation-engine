import type { Product, ProductRepository, ProductStaging, ProductStagingRepository } from "../interfaces/product.ts";

export class ProductService {
  private productRepository: ProductRepository;
  private productStagingRepository: ProductStagingRepository;

  constructor(productRepository: ProductRepository, productStagingRepository: ProductStagingRepository) {
    this.productRepository = productRepository;
    this.productStagingRepository = productStagingRepository;
  }

  async getProductById(id: string): Promise<Product | null> {
    const product = await this.productRepository.findProductById(id);
    if (product) {
      product.vector = product.vector || [];
    }
    return product;
  }

  async getSimilarProducts(vector: string, limit: number): Promise<Product[]> {
    return await this.productRepository.findSimilarProducts(vector, limit);
  }

  async createProduct(productData: Partial<Product>): Promise<ProductStaging> {
    if (!productData.id || !productData.name || !productData.price || !productData.category) {
      throw new Error("Id, Name, price, and category are required");
    }
    const existingProduct = await this.getProductById(productData.id);
    if (existingProduct) {
      throw new Error("Product with this ID already exists");
    }
    const product = {
      id: productData.id,
      name: productData.name,
      description: productData.description || "",
      price: productData.price,
      category: productData.category,
      createdAt: new Date(),
      isProcessing: false,
    };
    return await this.productStagingRepository.createProductStaging(product);
  }

  async updateProduct(id: string, updateData: Partial<Product>): Promise<Product | null> {
    const product = await this.productRepository.updateProduct(id, updateData);
    if (product) {
      product.vector = product.vector || [];
    }
    return product;
  }

  async deleteProduct(id: string): Promise<boolean> {
    return await this.productRepository.deleteProduct(id);
  }

  async getAllProducts(limit: number = 50): Promise<Product[]> {
    try {
      const products = await this.productRepository.findAllProducts(limit);
      return products.map(product => ({
        ...product,
        vector: product.vector || []
      }));
    } catch (error) {
      console.error('Error fetching all products:', error);
      return [];
    }
  }

  async getRecentProducts(limit: number = 10): Promise<Product[]> {
    try {
      const products = await this.productRepository.findRecentProducts(limit);
      return products.map(product => ({
        ...product,
        vector: product.vector || []
      }));
    } catch (error) {
      console.error('Error fetching recent products:', error);
      return [];
    }
  }

  async getRandomProducts(limit: number = 10): Promise<Product[]> {
    try {
      const products = await this.productRepository.findRandomProducts(limit);
      return products.map(product => ({
        ...product,
        vector: product.vector || []
      }));
    } catch (error) {
      console.error('Error fetching random products:', error);
      return [];
    }
  }

  async getPopularProducts(limit: number = 10): Promise<Product[]> {
    // Por enquanto, retorna produtos aleatórios, ent futuramente se necessario, fazer uma logica de popularidade
    return await this.getRandomProducts(limit);
  }
}