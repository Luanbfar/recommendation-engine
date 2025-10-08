import type { User, UserRepository } from "../interfaces/user.ts";
import { UserModel } from "../models/user-model.ts";
import { Repository } from "typeorm";

export class PostgresUserRepository extends Repository<UserModel> implements UserRepository {
  async createUser(userData: Partial<User>): Promise<User> {
    const user = this.create(userData);
    return await this.save(user);
  }
  async findUserById(id: number): Promise<User | null> {
    return await this.findOneBy({ id });
  }
  async findUserByEmail(email: string): Promise<User | null> {
    return await this.findOneBy({ email });
  }
  async updateUserById(id: number, updateData: Partial<User>): Promise<User | null> {
    const result = await this.update(id, updateData);
    if (result.affected && result.affected > 0) {
      return await this.findOneBy({ id });
    }
    return null;
  }
  async updateUserByEmail(email: string, updateData: Partial<User>): Promise<User | null> {
    const result = await this.update({ email }, updateData);
    if (result.affected && result.affected > 0) {
      return await this.findOneBy({ email });
    }
    return null;
  }
  async deleteUser(id: number): Promise<boolean> {
    const result = await this.delete(id);
    return result.affected !== undefined && result.affected !== null && result.affected > 0;
  }
}
