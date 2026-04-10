import { createClient } from "./supabase/server";
import { redirect } from "next/navigation";
import { z } from "zod";

const authSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function signIn(formData: FormData) {
  "use server";
  
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
  "use server";

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const restaurantName = formData.get("restaurantName") as string;

  const validated = authSchema.safeParse({ email, password });
  if (!validated.success) {
    return { error: "Invalid email or password format" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        restaurant_name: restaurantName,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  // Handle profile creation or linkage here if needed
  
  redirect("/");
}

export async function signOut() {
  "use server";
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
