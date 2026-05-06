"use server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";

export async function requestMeeting(formData: FormData) {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  const postId = formData.get("postId") as string;
  const timeSlots = formData.get("timeSlots") as string;
  const message = formData.get("message") as string;
  const ndaAccepted = formData.get("ndaAccepted") === "on";

  if (!ndaAccepted) {
    return { error: "You must accept the NDA to request a meeting." };
  }

  const existing = await db.meetingRequest.findFirst({
    where: { postId, requesterId: session.userId }
  });

  if (existing) {
    return { error: "You have already requested a meeting for this post." };
  }

  const mr = await db.meetingRequest.create({
    data: {
      postId,
      requesterId: session.userId,
      timeSlots,
      message,
      ndaAccepted: true,
      status: "Pending"
    }
  });

  await db.activityLog.create({
    data: { userId: session.userId, actionType: "REQUEST_MEETING", targetEntity: mr.id, resultStatus: "SUCCESS" }
  });

  const post = await db.post.findUnique({ where: { id: postId }, select: { ownerId: true, title: true } });
  if (post) {
    await db.notification.create({
      data: {
        userId: post.ownerId,
        type: "MEETING_REQUEST",
        message: `New meeting request for your post: ${post.title}`
      }
    });
  }

  revalidatePath(`/posts/${postId}`);
  return { success: true };
}

export async function respondToMeeting(requestId: string, status: "Scheduled" | "Declined") {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  const mr = await db.meetingRequest.findUnique({
    where: { id: requestId },
    include: { post: true }
  });

  if (!mr || mr.post.ownerId !== session.userId) {
    return { error: "Not authorized to respond to this request." };
  }

  await db.meetingRequest.update({
    where: { id: requestId },
    data: { status }
  });

  if (status === "Scheduled" && mr.post.status === "Active") {
    await db.post.update({
      where: { id: mr.postId },
      data: { status: "Meeting Scheduled" }
    });
  }

  await db.activityLog.create({
    data: {
      userId: session.userId,
      actionType: `RESPOND_MEETING_${status.toUpperCase()}`,
      targetEntity: requestId,
      resultStatus: "SUCCESS"
    }
  });

  await db.notification.create({
    data: {
      userId: mr.requesterId,
      type: "MEETING_UPDATE",
      message: `Your meeting request for "${mr.post.title}" was ${status.toLowerCase()}.`
    }
  });

  revalidatePath(`/posts/${mr.postId}`);
  revalidatePath("/dashboard");
  return { success: true };
}
