import { FieldError } from "../shared/http/error";

export interface SafeUser {
  id: string;
  email: string;
  displayName: string;
  createdAt: string;
}

export interface StoredUser extends SafeUser {
  passwordHash: string;
}

export interface RegisterCommand {
  email: string;
  password: string;
  displayName: string;
}

export interface LoginCommand {
  email: string;
  password: string;
}

export interface AuthTokenPayload {
  sub: string;
}

export interface AuthSuccessResponse {
  user: SafeUser;
}

export interface CurrentUserResponse {
  user: SafeUser | null;
}

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    fieldErrors?: FieldError[];
  };
}
