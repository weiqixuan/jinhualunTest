import { StoredUser } from "./auth.types";

export interface UserRepository {
  findByEmail(email: string): Promise<StoredUser | null>;
  findById(id: string): Promise<StoredUser | null>;
  create(user: StoredUser): Promise<void>;
}
