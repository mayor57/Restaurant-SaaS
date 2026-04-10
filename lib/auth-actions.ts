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

  const originHeaders = headers();
  const origin = originHeaders.get("origin") || originHeaders.get("referer");
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
    if (error.message.toLowerCase().includes("rate limit")) {
      return { error: "Verification limit reached. Supabase free tier only allows 3 signup attempts per hour. Please wait a few minutes or check your spam for previous links." };
    }
    return { error: error.message };
  }

  if (data?.user && data?.session === null) {
      return { success: "Handshake initialized. Please verify your identity via the transmission sent to your email." };
  }

  redirect("/");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}