import {
  CreateVerificationInput,
  UpdateVerificationInput,
} from "@/application/types";
import { Verification } from "@/infrastructure/db/prisma/generated";
import { prisma } from "@/infrastructure/utils/prisma";

export class VerificationRepository {
  async findById(id: string): Promise<Verification | null> {
    return prisma.verification.findUnique({
      where: { id },
    });
  }

  async findByIdentifierAndValue(
    identifier: string,
    value: string
  ): Promise<Verification | null> {
    return prisma.verification.findFirst({
      where: {
        identifier,
        value,
      },
    });
  }

  async create(data: CreateVerificationInput): Promise<Verification> {
    return prisma.verification.create({
      data: {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async update(
    id: string,
    data: UpdateVerificationInput
  ): Promise<Verification> {
    return prisma.verification.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  async delete(id: string): Promise<Verification> {
    return prisma.verification.delete({
      where: { id },
    });
  }

  async deleteExpiredVerifications(): Promise<number> {
    const result = await prisma.verification.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
    return result.count;
  }

  async deleteByIdentifier(identifier: string): Promise<number> {
    const result = await prisma.verification.deleteMany({
      where: { identifier },
    });
    return result.count;
  }
}
