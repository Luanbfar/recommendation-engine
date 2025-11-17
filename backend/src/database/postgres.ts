import { DataSource } from "typeorm";
import { UserModel } from "../models/user-model.ts";
import { ProductModel } from "../models/product-model.ts";
import { config } from "../config/env.ts";

const PostgresDataSource = new DataSource({
  type: "postgres",
  url: config.database.postgresUrl,
  entities: [UserModel, ProductModel],
  synchronize: true,
});

export default PostgresDataSource;
