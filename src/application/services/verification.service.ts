import { Verification } from "@/infrastructure/db/prisma/generated";
import { VerificationRepository } from "@/infrastructure/repo";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";

export class VerificationService {
  private verificationRepository: VerificationRepository;

  constructor() {
    this.verificationRepository = new VerificationRepository();
  }

  async getVerificationById(id: string): Promise<Verification | null> {
    return this.verificationRepository.findById(id);
  }

  async getVerificationByIdentifierAndValue(
    identifier: string,
    value: string
  ): Promise<Verification | null> {
    return this.verificationRepository.findByIdentifierAndValue(
      identifier,
      value
    );
  }

  async createEmailVerification(
    email: string,
    expiresInHours = 24
  ): Promise<Verification> {
    // Create a verification token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expiresInHours);

    // Delete any existing verifications for this email
    await this.verificationRepository.deleteByIdentifier(email);

    return this.verificationRepository.create({
      id: uuidv4(),
      identifier: email,
      value: token,
      expiresAt,
    });
  }

  async createPasswordResetVerification(
    email: string,
    expiresInHours = 1
  ): Promise<Verification> {
    // Create a reset token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expiresInHours);

    // Delete any existing password reset verifications for this email
    await this.verificationRepository.deleteByIdentifier(`reset:${email}`);

    return this.verificationRepository.create({
      id: uuidv4(),
      identifier: `reset:${email}`,
      value: token,
      expiresAt,
    });
  }

  async verifyToken(identifier: string, token: string): Promise<boolean> {
    const verification =
      await this.verificationRepository.findByIdentifierAndValue(
        identifier,
        token
      );

    if (!verification) {
      return false;
    }

    if (new Date(verification.expiresAt) < new Date()) {
      await this.verificationRepository.delete(verification.id);
      return false;
    }

    return true;
  }

  async consumeVerification(
    identifier: string,
    token: string
  ): Promise<boolean> {
    const verification =
      await this.verificationRepository.findByIdentifierAndValue(
        identifier,
        token
      );

    if (!verification) {
      return false;
    }

    if (new Date(verification.expiresAt) < new Date()) {
      await this.verificationRepository.delete(verification.id);
      return false;
    }

    // Token is valid, delete it to prevent reuse
    await this.verificationRepository.delete(verification.id);
    return true;
  }

  async cleanupExpiredVerifications(): Promise<number> {
    return this.verificationRepository.deleteExpiredVerifications();
  }
}
