export interface CreateSessionInput {
  id: string;
  expiresAt: Date;
  token: string;
  userId: string;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export interface UpdateSessionInput {
  id: string;
  expiresAt?: Date;
  token?: string;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export interface ActiveSession {
  id: string;
  token: string;
  expiresAt: Date;
  userId: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  isExpired: boolean;
}
