export type AuthMode = "login" | "register";

export interface AuthFieldError {
  field: string;
  message: string;
}

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  createdAt: string;
}

export interface AuthSuccessResponse {
  user: AuthUser;
}

export interface CurrentUserResponse {
  user: AuthUser | null;
}

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    fieldErrors?: AuthFieldError[];
  };
}

export interface LoginValues {
  email: string;
  password: string;
}

export interface RegisterValues extends LoginValues {
  displayName: string;
}

export type AuthFormValues = Partial<RegisterValues> & LoginValues;
