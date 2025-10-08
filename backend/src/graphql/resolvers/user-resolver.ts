import { GraphQLError } from "graphql";
import { userService } from "../../app/app.ts";
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
