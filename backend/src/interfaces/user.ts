export interface User {
  id: number;
  name: string;
  email: string;
  taste: number[];
}

export interface UserRepository {
  createUser(userData: Partial<User>): Promise<User>;
  findUserById(id: number): Promise<User | null>;
  findUserByEmail(email: string): Promise<User | null>;
  updateUserById(id: number, updateData: Partial<User>): Promise<User | null>;
  updateUserByEmail(email: string, updateData: Partial<User>): Promise<User | null>;
  deleteUser(id: number): Promise<boolean>;
}
