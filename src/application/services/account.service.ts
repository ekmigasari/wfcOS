// import { Account } from "@/infrastructure/db/prisma/generated";
// import { AccountRepository } from "@/infrastructure/repo";
// import { v4 as uuidv4 } from "uuid";
// import bcrypt from "bcryptjs";

// export class AccountService {
//   private accountRepository: AccountRepository;

//   constructor() {
//     this.accountRepository = new AccountRepository();
//   }

//   async getAccountById(id: string): Promise<Account | null> {
//     return this.accountRepository.findById(id);
//   }

//   async getUserAccounts(userId: string): Promise<Account[]> {
//     return this.accountRepository.findByUserId(userId);
//   }

//   async getAccountByProvider(
//     providerId: string,
//     accountId: string
//   ): Promise<Account | null> {
//     return this.accountRepository.findByProviderAccount(providerId, accountId);
//   }

//   async createSocialAccount(data: {
//     userId: string;
//     providerId: string;
//     accountId: string;
//     accessToken?: string;
//     refreshToken?: string;
//     idToken?: string;
//     accessTokenExpiresAt?: Date;
//     refreshTokenExpiresAt?: Date;
//     scope?: string;
//   }): Promise<Account> {
//     return this.accountRepository.create({
//       id: uuidv4(),
//       ...data,
//     });
//   }

//   async createPasswordAccount(data: {
//     userId: string;
//     email: string;
//     password: string;
//   }): Promise<Account> {
//     const hashedPassword = await bcrypt.hash(data.password, 10);

//     return this.accountRepository.create({
//       id: uuidv4(),
//       userId: data.userId,
//       providerId: "credentials",
//       accountId: data.email,
//       password: hashedPassword,
//     });
//   }

//   async updateAccount(
//     id: string,
//     data: Partial<Omit<Account, "id" | "createdAt">>
//   ): Promise<Account> {
//     return this.accountRepository.update(id, data);
//   }

//   async updateAccessToken(
//     id: string,
//     accessToken: string,
//     expiresAt?: Date
//   ): Promise<Account> {
//     return this.accountRepository.update(id, {
//       accessToken,
//       accessTokenExpiresAt: expiresAt,
//     });
//   }

//   async updateRefreshToken(
//     id: string,
//     refreshToken: string,
//     expiresAt?: Date
//   ): Promise<Account> {
//     return this.accountRepository.update(id, {
//       refreshToken,
//       refreshTokenExpiresAt: expiresAt,
//     });
//   }

//   async updatePassword(id: string, newPassword: string): Promise<Account> {
//     const hashedPassword = await bcrypt.hash(newPassword, 10);

//     return this.accountRepository.update(id, {
//       password: hashedPassword,
//     });
//   }

//   async deleteAccount(id: string): Promise<Account> {
//     return this.accountRepository.delete(id);
//   }

//   async deleteUserProviderAccounts(
//     userId: string,
//     providerId: string
//   ): Promise<number> {
//     return this.accountRepository.deleteByUserIdAndProvider(userId, providerId);
//   }

//   async verifyPassword(accountId: string, password: string): Promise<boolean> {
//     const account = await this.accountRepository.findById(accountId);

//     if (!account || !account.password) {
//       return false;
//     }

//     return bcrypt.compare(password, account.password);
//   }
// }
