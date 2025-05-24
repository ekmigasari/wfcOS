// Account creation input (without auto-generated fields)
export interface CreateAccountInput {
  id: string;
  accountId: string;
  providerId: string;
  userId: string;
  accessToken?: string | null;
  refreshToken?: string | null;
  idToken?: string | null;
  accessTokenExpiresAt?: Date | null;
  refreshTokenExpiresAt?: Date | null;
  scope?: string | null;
  password?: string | null;
}

// Account update input (all fields optional except id)
export interface UpdateAccountInput {
  id: string;
  accountId?: string;
  providerId?: string;
  accessToken?: string | null;
  refreshToken?: string | null;
  idToken?: string | null;
  accessTokenExpiresAt?: Date | null;
  refreshTokenExpiresAt?: Date | null;
  scope?: string | null;
  password?: string | null;
}

// OAuth account data
export interface OAuthAccount {
  id: string;
  accountId: string;
  providerId: string;
  accessToken?: string | null;
  refreshToken?: string | null;
  idToken?: string | null;
  accessTokenExpiresAt?: Date | null;
  refreshTokenExpiresAt?: Date | null;
  scope?: string | null;
}

// Password account data
export interface PasswordAccount {
  id: string;
  accountId: string;
  providerId: string;
  password?: string | null;
}
