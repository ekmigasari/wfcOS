import { Session } from "@/infrastructure/db/prisma/generated";
import { SessionRepository } from "@/infrastructure/repo";
import { v4 as uuidv4 } from "uuid";

export class SessionService {
  private sessionRepository: SessionRepository;

  constructor() {
    this.sessionRepository = new SessionRepository();
  }

  async getSessionById(id: string): Promise<Session | null> {
    return this.sessionRepository.findById(id);
  }

  async getSessionByToken(token: string): Promise<Session | null> {
    return this.sessionRepository.findByToken(token);
  }

  async getUserSessions(userId: string): Promise<Session[]> {
    return this.sessionRepository.findByUserId(userId);
  }

  async createSession(data: {
    userId: string;
    ipAddress?: string;
    userAgent?: string;
    expiresInDays?: number;
  }): Promise<Session> {
    const expiresInDays = data.expiresInDays || 30;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    return this.sessionRepository.create({
      id: uuidv4(),
      token: uuidv4(),
      expiresAt,
      userId: data.userId,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
    });
  }

  async updateSession(
    id: string,
    data: Partial<Omit<Session, "id" | "createdAt">>
  ): Promise<Session> {
    return this.sessionRepository.update(id, data);
  }

  async deleteSession(id: string): Promise<Session> {
    return this.sessionRepository.delete(id);
  }

  async deleteSessionByToken(token: string): Promise<Session> {
    return this.sessionRepository.deleteByToken(token);
  }

  async clearUserSessions(userId: string): Promise<number> {
    const sessions = await this.sessionRepository.findByUserId(userId);
    let count = 0;

    for (const session of sessions) {
      await this.sessionRepository.delete(session.id);
      count++;
    }

    return count;
  }

  async cleanupExpiredSessions(): Promise<number> {
    return this.sessionRepository.deleteExpiredSessions();
  }

  async validateSession(token: string): Promise<Session | null> {
    const session = await this.sessionRepository.findByToken(token);

    if (!session) {
      return null;
    }

    if (new Date(session.expiresAt) < new Date()) {
      await this.sessionRepository.delete(session.id);
      return null;
    }

    return session;
  }
}
