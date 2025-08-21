"use server";

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { createSession, deleteSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { z } from "zod";

// Validation schemas
const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export async function signUp(
  data: FormData | { name: string; email: string; password: string }
) {
  let rawData;

  if (data instanceof FormData) {
    rawData = {
      name: data.get("name") as string,
      email: data.get("email") as string,
      password: data.get("password") as string,
    };
  } else {
    rawData = data;
  }

  try {
    // Validate input
    const validatedData = signUpSchema.parse(rawData);

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, validatedData.email))
      .limit(1);

    if (existingUser.length > 0) {
      return { error: "User with this email already exists" };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12);

    // Create user
    const [newUser] = await db
      .insert(users)
      .values({
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
      })
      .returning({ id: users.id, name: users.name, email: users.email });

    // Create session
    await createSession(newUser.id, newUser.email, newUser.name || "");
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.issues[0].message };
    }
    console.error("Sign up error:", error);
    return { error: "Something went wrong. Please try again." };
  }

  redirect("/dashboard");
}

export async function signIn(
  data: FormData | { email: string; password: string }
) {
  let rawData;

  if (data instanceof FormData) {
    rawData = {
      email: data.get("email") as string,
      password: data.get("password") as string,
    };
  } else {
    rawData = data;
  }

  try {
    // Validate input
    const validatedData = signInSchema.parse(rawData);

    // Find user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, validatedData.email))
      .limit(1);

    if (!user || !user.password) {
      return { error: "Invalid email or password" };
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(
      validatedData.password,
      user.password
    );

    if (!isValidPassword) {
      return { error: "Invalid email or password" };
    }

    // Create session
    await createSession(user.id, user.email, user.name || "");
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.issues[0].message };
    }
    console.error("Sign in error:", error);
    return { error: "Something went wrong. Please try again." };
  }

  redirect("/dashboard");
}

export async function signOut() {
  await deleteSession();
  redirect("/");
}
