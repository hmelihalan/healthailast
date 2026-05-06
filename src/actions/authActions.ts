"use server";

import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { createSession, destroySession, getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export async function registerUser(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as string;
  const city = formData.get("city") as string;
  const institution = formData.get("institution") as string;

  const eduRegex = /\.edu(\.[a-z]{2})?$/i;
  if (!eduRegex.test(email)) {
    return { error: "Registration is restricted to institutional .edu (or .edu.xx) email addresses only." };
  }

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "User already exists with this email." };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();

  const user = await db.user.create({
    data: { email, passwordHash, role, city, institution, verificationToken, emailVerified: false }
  });

  console.log(`\n\n=== MOCK EMAIL ===\nTo: ${email}\nSubject: Verify your Health AI Account\nToken: ${verificationToken}\n==================\n\n`);

  await db.activityLog.create({
    data: { userId: user.id, actionType: "REGISTER", resultStatus: "SUCCESS" }
  });

  redirect(`/verify?email=${encodeURIComponent(email)}`);
}

export async function verifyAndLogin(email: string, token: string) {
  const user = await db.user.findUnique({ where: { email } });
  if (!user) return { error: "User not found" };

  if (user.verificationToken !== token) {
    return { error: "Invalid verification token" };
  }

  await db.user.update({
    where: { email },
    data: { emailVerified: true, verificationToken: null }
  });

  await createSession({ userId: user.id, role: user.role, email: user.email });

  await db.activityLog.create({
    data: { userId: user.id, actionType: "EMAIL_VERIFIED", resultStatus: "SUCCESS" }
  });

  redirect("/dashboard");
}

export async function loginUser(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const user = await db.user.findUnique({ where: { email } });

  if (!user) {
    return { error: "Invalid credentials" };
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);

  if (!isValid) {
    await db.activityLog.create({
      data: { userId: user.id, actionType: "LOGIN", resultStatus: "FAILED" }
    });
    return { error: "Invalid credentials" };
  }

  if (!user.isActive) {
    return { error: "Your account has been suspended." };
  }

  if (!user.emailVerified) {
    return { error: "Please verify your email before logging in." };
  }

  await createSession({ userId: user.id, role: user.role, email: user.email });

  await db.activityLog.create({
    data: { userId: user.id, actionType: "LOGIN", resultStatus: "SUCCESS" }
  });

  redirect("/dashboard");
}

export async function logoutUser() {
  await destroySession();
  redirect("/login");
}

export async function updateProfile(formData: FormData) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const city = formData.get("city") as string;
  const institution = formData.get("institution") as string;

  await db.user.update({
    where: { id: session.userId },
    data: { city, institution }
  });

  await db.activityLog.create({
    data: { userId: session.userId, actionType: "UPDATE_PROFILE", resultStatus: "SUCCESS" }
  });

  redirect("/profile");
}

export async function changePassword(formData: FormData) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const oldPassword = formData.get("oldPassword") as string;
  const newPassword = formData.get("newPassword") as string;

  const user = await db.user.findUnique({ where: { id: session.userId } });
  if (!user) return { error: "User not found" };

  const isValid = await bcrypt.compare(oldPassword, user.passwordHash);
  if (!isValid) {
    return { error: "Incorrect current password" };
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await db.user.update({
    where: { id: session.userId },
    data: { passwordHash }
  });

  await db.activityLog.create({
    data: { userId: session.userId, actionType: "CHANGE_PASSWORD", resultStatus: "SUCCESS" }
  });

  return { success: true };
}

export async function deleteAccount() {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  // Delete all related records
  await db.notification.deleteMany({ where: { userId: session.userId } });
  await db.activityLog.deleteMany({ where: { userId: session.userId } });
  
  // Find posts to delete meeting requests for them
  const userPosts = await db.post.findMany({ where: { ownerId: session.userId } });
  const postIds = userPosts.map(p => p.id);
  
  await db.meetingRequest.deleteMany({ where: { OR: [{ requesterId: session.userId }, { postId: { in: postIds } }] } });
  await db.post.deleteMany({ where: { ownerId: session.userId } });
  
  // Finally delete the user
  await db.user.delete({ where: { id: session.userId } });

  await destroySession();
  redirect("/login");
}
