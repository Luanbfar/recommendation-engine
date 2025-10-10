import { Column, CreateDateColumn, Entity, PrimaryColumn } from "typeorm";
import type { Product, ProductStaging } from "../interfaces/product.ts";

@Entity("products")
export class ProductModel implements Product {
  @PrimaryColumn("uuid")
  id!: string;
  @Column({ type: "varchar", length: 200 })
  name!: string;
  @Column({ type: "text", nullable: true })
  description!: string;
  @Column({ type: "int" })
  price!: number;
  @Column({ type: "varchar", length: 100 })
  category!: string;
  @Column({ type: "vector", length: 1024, nullable: true })
  vector!: number[];
}
