"use server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";

export async function suspendUser(userId: string) {
  const session = await getSession();
  if (!session || session.role !== "Admin") {
    return { error: "Unauthorized" };
  }

  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) return { error: "User not found" };

  await db.user.update({
    where: { id: userId },
    data: { isActive: !user.isActive } // toggles suspension
  });

  await db.activityLog.create({
    data: { 
      userId: session.userId, 
      actionType: user.isActive ? "SUSPEND_USER" : "UNSUSPEND_USER", 
      targetEntity: userId, 
      resultStatus: "SUCCESS" 
    }
  });

  revalidatePath("/admin");
  return { success: true };
}

export async function adminDeletePost(postId: string) {
  const session = await getSession();
  if (!session || session.role !== "Admin") {
    return { error: "Unauthorized" };
  }

  // Delete related meeting requests first
  await db.meetingRequest.deleteMany({ where: { postId } });
  await db.post.delete({ where: { id: postId } });

  await db.activityLog.create({
    data: { userId: session.userId, actionType: "ADMIN_DELETE_POST", targetEntity: postId, resultStatus: "SUCCESS" }
  });

  revalidatePath("/admin");
  revalidatePath("/dashboard");
  revalidatePath("/posts");
  return { success: true };
}
