import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import type { User } from "../interfaces/user.ts";

@Entity("users")
export class UserModel implements User {
  @PrimaryGeneratedColumn()
  id!: number;
  @Column({ type: "varchar", length: 100 })
  name!: string;
  @Column({ type: "varchar", length: 100, unique: true })
  email!: string;
  @Column({ type: "vector", length: 1024, nullable: true })
  taste!: number[];
}
