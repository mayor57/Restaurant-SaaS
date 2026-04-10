"use server";

import { createClient } from "./supabase/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { z } from "zod";

const authSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function signIn(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  
  const validated = authSchema.safeParse({ email, password });
  if (!validated.success) {
    return { error: "Invalid email or password format" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/");
}

export async function signUp(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const restaurantName = formData.get("restaurantName") as string;

  const validated = authSchema.safeParse({ email, password });
  if (!validated.success) {
    return { error: "Invalid email or password format" };
  }

  const origin = headers().get("origin");
  const supabase = await createClient();
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: {
        restaurant_name: restaurantName,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  // If email confirmation is enabled, we should tell the user to check their email
  // instead of redirecting immediately to a protected route (which would redirect back to login)
  if (data?.user && data?.session === null) {
      return { success: "Registration successful. Please check your email to verify your account." };
  }

  redirect("/");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
