"use server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";

export async function markAsRead(notificationId: string) {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  await db.notification.updateMany({
    where: { id: notificationId, userId: session.userId },
    data: { isRead: true }
  });

  revalidatePath("/notifications");
  return { success: true };
}
