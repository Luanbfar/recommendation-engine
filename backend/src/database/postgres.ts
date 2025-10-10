import { DataSource } from "typeorm";
import { UserModel } from "../models/user-model.ts";
import { ProductModel } from "../models/product-model.ts";
import { postgresDbUrl } from "../config/env.ts";

const PostgresDataSource = new DataSource({
  type: "postgres",
  url: postgresDbUrl,
  entities: [UserModel, ProductModel],
  synchronize: true,
});

export default PostgresDataSource;
