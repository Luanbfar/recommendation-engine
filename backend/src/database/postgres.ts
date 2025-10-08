import { DataSource } from "typeorm";
import { UserModel } from "../models/user-model.ts";
import { ProductModel } from "../models/product-model.ts";

const PostgresDataSource = new DataSource({
  type: "postgres",
  url: process.env.POSTGRES_DB_URL ?? "localhost",
  entities: [UserModel, ProductModel],
  synchronize: true,
});

export default PostgresDataSource;
