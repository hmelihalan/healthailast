"use server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";

export async function createPost(formData: FormData) {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  const title = formData.get("title") as string;
  const domain = formData.get("domain") as string;
  const requiredExpertise = formData.get("requiredExpertise") as string;
  const projectStage = formData.get("projectStage") as string;
  const confidentialityLevel = formData.get("confidentialityLevel") as string;
  const city = formData.get("city") as string;
  const description = formData.get("description") as string;
  const status = (formData.get("status") as string) || "Active";

  const post = await db.post.create({
    data: {
      title, domain, requiredExpertise, projectStage,
      confidentialityLevel, city, description, status,
      ownerId: session.userId,
    }
  });

  await db.activityLog.create({
    data: { userId: session.userId, actionType: "CREATE_POST", targetEntity: post.id, resultStatus: "SUCCESS" }
  });

  revalidatePath("/dashboard");
  revalidatePath("/posts");
  return { success: true, postId: post.id };
}

export async function updatePost(formData: FormData) {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  const postId = formData.get("postId") as string;
  const title = formData.get("title") as string;
  const domain = formData.get("domain") as string;
  const requiredExpertise = formData.get("requiredExpertise") as string;
  const projectStage = formData.get("projectStage") as string;
  const confidentialityLevel = formData.get("confidentialityLevel") as string;
  const city = formData.get("city") as string;
  const description = formData.get("description") as string;
  const status = formData.get("status") as string;

  const existingPost = await db.post.findUnique({ where: { id: postId } });
  if (!existingPost) return { error: "Not found" };
  if (existingPost.ownerId !== session.userId) return { error: "Unauthorized" };

  await db.post.update({
    where: { id: postId },
    data: { title, domain, requiredExpertise, projectStage, confidentialityLevel, city, description, ...(status ? { status } : {}) }
  });

  await db.activityLog.create({
    data: { userId: session.userId, actionType: "UPDATE_POST", targetEntity: postId, resultStatus: "SUCCESS" }
  });

  revalidatePath("/dashboard");
  revalidatePath(`/posts/${postId}`);
  return { success: true };
}

export async function updatePostStatus(postId: string, status: string) {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  const post = await db.post.findUnique({ where: { id: postId, ownerId: session.userId } });
  if (!post) return { error: "Unauthorized" };

  await db.post.update({
    where: { id: postId, ownerId: session.userId },
    data: { status }
  });

  const requesters = await db.meetingRequest.findMany({
    where: { postId },
    select: { requesterId: true }
  });

  if (requesters.length > 0) {
    await db.notification.createMany({
      data: requesters.map(r => ({
        userId: r.requesterId,
        type: "POST_UPDATE",
        message: `The status of the post "${post.title}" has changed to ${status}.`
      }))
    });
  }

  await db.activityLog.create({
    data: { userId: session.userId, actionType: "UPDATE_POST_STATUS", targetEntity: postId, resultStatus: status }
  });

  revalidatePath("/dashboard");
  revalidatePath("/posts");
  return { success: true };
}

export async function deletePost(postId: string) {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  const post = await db.post.findUnique({ where: { id: postId } });
  if (!post) return { error: "Not found" };
  if (post.ownerId !== session.userId && session.role !== "Admin") return { error: "Unauthorized" };

  // Delete related meeting requests first
  await db.meetingRequest.deleteMany({ where: { postId } });
  await db.post.delete({ where: { id: postId } });

  await db.activityLog.create({
    data: { userId: session.userId, actionType: "DELETE_POST", targetEntity: postId, resultStatus: "SUCCESS" }
  });

  revalidatePath("/dashboard");
  revalidatePath("/posts");
  return { success: true };
}
