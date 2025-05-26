import { NextResponse } from "next/server";
import logger from "@/infrastructure/utils/logger";
import { auth } from "@/infrastructure/utils/auth";
import { headers } from "next/headers";
import { userSettingsService } from "@/application/services";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;
    const data = await userSettingsService.getUserSettingsData(userId);
    return NextResponse.json(data);
  } catch (error) {
    logger.error(error as string, "Failed to get user settings data");
    return NextResponse.json(
      { error: "Failed to get user settings data" },
      { status: 500 }
    );
  }
}
