import { toNextJsHandler } from "better-auth/next-js";

import { auth } from "@/infrastructure/utils/auth";

export const { POST, GET } = toNextJsHandler(auth.handler);
