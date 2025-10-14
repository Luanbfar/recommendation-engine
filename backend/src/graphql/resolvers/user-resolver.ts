import { GraphQLError } from "graphql";
import { recommendationService, userService } from "../../app/app.ts";
import type { User } from "../../interfaces/user.ts";

export const userResolvers = {
  Query: {
    async getUser(_: any, args: { id: number }) {
      try {
        return await userService.getUserById(args.id);
      } catch (error: any) {
        throw new GraphQLError(error.message || "Failed to fetch user");
      }
    },

    async getUserByEmail(_: any, args: { email: string }) {
      try {
        return await userService.getUserByEmail(args.email);
      } catch (error: any) {
        throw new GraphQLError(error.message || "Failed to fetch user by email");
      }
    },
    async getUserTaste(_: any, args: { email: string; userProducts: [{ productId: string; amount: number }] }) {
      try {
        const userProductsMap = new Map<string, number>(args.userProducts.map((p) => [p.productId, p.amount]));

        return await recommendationService.getUserTaste(args.email, userProductsMap);
      } catch (error: any) {
        throw new GraphQLError(error.message || "Failed to fetch user taste");
      }
    },
    async getUserRecommendations(_: any, args: { email: string; limit: number }) {
      try {
        return await recommendationService.getUserRecommendations(args.email, args.limit);
      } catch (error: any) {
        throw new GraphQLError(error.message || "Failed to fetch user recommendations");
      }
    },
  },

  Mutation: {
    async createUser(_: any, args: { userData: Partial<User> }) {
      try {
        return await userService.createUser(args.userData);
      } catch (error: any) {
        throw new GraphQLError(error.message || "Failed to create user");
      }
    },

    async updateUser(_: any, args: { id: number; userData: Partial<User> }) {
      try {
        const user = await userService.updateUserById(args.id, args.userData);
        return user;
      } catch (error: any) {
        throw new GraphQLError(error.message || "Failed to update user");
      }
    },

    async deleteUser(_: any, args: { id: number }) {
      try {
        return await userService.deleteUser(args.id);
      } catch (error: any) {
        throw new GraphQLError(error.message || "Failed to delete user");
      }
    },
  },
};
