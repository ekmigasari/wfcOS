import { CreateAccountInput, UpdateAccountInput } from "@/application/types";
import { Account } from "@/infrastructure/db/prisma/generated";
import { prisma } from "@/infrastructure/utils/prisma";

export class AccountRepository {
  async findById(id: string): Promise<Account | null> {
    return prisma.account.findUnique({
      where: { id },
    });
  }

  async findByUserId(userId: string): Promise<Account[]> {
    return prisma.account.findMany({
      where: { userId },
    });
  }

  async create(data: CreateAccountInput): Promise<Account> {
    return prisma.account.create({
      data: {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async update(id: string, data: UpdateAccountInput): Promise<Account> {
    return prisma.account.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  async delete(id: string): Promise<Account> {
    return prisma.account.delete({
      where: { id },
    });
  }
}
