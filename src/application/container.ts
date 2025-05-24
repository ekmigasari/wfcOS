import { UserRepository } from "@/infrastructure/repo";
import { UserService } from "./services";

export const contaner = {
  userRepository: new UserRepository(),
};

export const services = {
  userService: new UserService(),
};
