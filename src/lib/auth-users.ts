import { createClient } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";

type AuthUser = {
  id: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  role: string;
};

function getSupabaseCredentials() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.SUPABASE_SERVICE_ROLE ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return null;
  }

  return { url, key };
}

async function findUserWithSupabase(email: string): Promise<AuthUser | null> {
  const credentials = getSupabaseCredentials();

  if (!credentials) {
    return null;
  }

  const supabase = createClient(credentials.url, credentials.key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const { data, error } = await supabase
    .from("User")
    .select("id,email,passwordHash,firstName,lastName,role")
    .eq("email", email)
    .maybeSingle<AuthUser>();

  if (error) {
    throw error;
  }

  return data;
}

async function findUserWithPrisma(email: string): Promise<AuthUser | null> {
  return prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      passwordHash: true,
      firstName: true,
      lastName: true,
      role: true,
    },
  });
}

export async function findAuthUserByEmail(
  email: string,
): Promise<AuthUser | null> {
  if (!process.env.DATABASE_URL) {
    return findUserWithSupabase(email);
  }

  try {
    const user = await findUserWithPrisma(email);

    if (user) {
      return user;
    }
  } catch (error) {
    console.error(
      "Prisma login lookup failed. Trying Supabase REST fallback.",
      error,
    );
  }

  return findUserWithSupabase(email);
}
