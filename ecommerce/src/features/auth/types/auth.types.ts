export interface SignInPayload {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface SignInResponse {
  accessToken: string;
  refreshToken?: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}
