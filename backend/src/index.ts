import "dotenv/config";
import "./app/app.ts";

import { userResolvers } from "./graphql/resolvers/user-resolver.ts";
import path from "path";
import { readFileSync } from "fs";
import { startStandaloneServer } from "@apollo/server/standalone";
import { ApolloServer } from "@apollo/server";
import { fileURLToPath } from "url";
import { productResolvers } from "./graphql/resolvers/product-resolver.ts";

try {
  const __dirname = fileURLToPath(import.meta.url);
  const userTypeDefs = readFileSync(path.join(__dirname, "../graphql/schemas/user.graphql"), "utf-8");
  const productTypeDefs = readFileSync(path.join(__dirname, "../graphql/schemas/product.graphql"), "utf-8");

  const server = new ApolloServer({
    typeDefs: [userTypeDefs, productTypeDefs],
    resolvers: [userResolvers, productResolvers],
  });

  const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
  });
  console.log("Apollo Server started successfully.", `\nServer ready at: ${url}`);
} catch (error) {
  console.error("Error starting Apollo Server:", error);
}
