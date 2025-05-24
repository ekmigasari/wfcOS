import { CreateSessionInput, UpdateSessionInput } from "@/application/types";
import { Session } from "@/infrastructure/db/prisma/generated";
import { prisma } from "@/infrastructure/utils/prisma";

export class SessionRepository {
  async findById(id: string): Promise<Session | null> {
    return prisma.session.findUnique({
      where: { id },
    });
  }

  async findByToken(token: string): Promise<Session | null> {
    return prisma.session.findUnique({
      where: { token },
    });
  }

  async findByUserId(userId: string): Promise<Session[]> {
    return prisma.session.findMany({
      where: { userId },
    });
  }

  async create(data: CreateSessionInput): Promise<Session> {
    return prisma.session.create({
      data: {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async update(id: string, data: UpdateSessionInput): Promise<Session> {
    return prisma.session.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  async delete(id: string): Promise<Session> {
    return prisma.session.delete({
      where: { id },
    });
  }

  async deleteByToken(token: string): Promise<Session> {
    return prisma.session.delete({
      where: { token },
    });
  }

  async deleteExpiredSessions(): Promise<number> {
    const result = await prisma.session.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
    return result.count;
  }
}
