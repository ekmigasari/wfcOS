// src/app/api/user-settings/route.ts
import { NextResponse } from "next/server";
import { userSettingsService } from "@/application/services";
import logger from "@/infrastructure/utils/logger";

export async function GET() {
  try {
    const data = await userSettingsService.getUserSettingsData();
    return NextResponse.json(data);
  } catch (error) {
    logger.error(error as string, "Failed to get user settings data");
    return NextResponse.json(
      { error: "Failed to get user settings data" },
      { status: 500 }
    );
  }
}
