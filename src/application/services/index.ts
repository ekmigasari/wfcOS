export * from "./subscription.service";
export * from "./verification.service";
export * from "./account.service";
export * from "./session.service";
export * from "./auth.services";
export * from "./webhook.service";
import { UserService } from "./user.service";
import { UserSettingsService } from "./userSettings.service";

export const userSettingsService = new UserSettingsService();
export const userService = new UserService();
