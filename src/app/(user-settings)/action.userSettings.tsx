"use server";

import { updateUser } from "@/infrastructure/lib/auth-client";

export async function updateUserAction(
  prevState: { success: boolean },
  formData: FormData
) {
  const name = formData.get("name");
  try {
    await updateUser({
      name: name as string,
    });

    return {
      success: true,
    };
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }
    return {
      success: false,
    };
  }
}
