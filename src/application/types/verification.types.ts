export interface Verification {
  id: string;
  identifier: string;
  value: string;
  expiresAt: Date;
}

export interface CreateVerificationInput {
  id: string;
  identifier: string;
  value: string;
  expiresAt: Date;
}

export interface UpdateVerificationInput {
  id: string;
  identifier?: string;
  value?: string;
  expiresAt?: Date;
}

export interface EmailVerification {
  id: string;
  identifier: string; // email address
  value: string; // verification code/token
  expiresAt: Date;
  isExpired: boolean;
}

export interface PasswordResetVerification {
  id: string;
  identifier: string; // email address
  value: string; // reset token
  expiresAt: Date;
  isExpired: boolean;
}

// Generic verification check
export interface VerificationCheck {
  isValid: boolean;
  isExpired: boolean;
  verification?: Verification;
}
