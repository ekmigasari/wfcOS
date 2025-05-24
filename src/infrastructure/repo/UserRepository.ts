import { CreateUserInput, UpdateUserInput } from "@/application/types";
import { User, PlanType } from "@/infrastructure/db/prisma/generated";
import { prisma } from "@/infrastructure/utils/prisma";

export class UserRepository {
  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async findAll(): Promise<User[]> {
    return prisma.user.findMany();
  }

  async create(data: CreateUserInput): Promise<User> {
    return prisma.user.create({
      data: {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
        planType: data.planType || PlanType.FREE,
      },
    });
  }

  async update(id: string, data: UpdateUserInput): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  async delete(id: string): Promise<User> {
    return prisma.user.delete({
      where: { id },
    });
  }
}
