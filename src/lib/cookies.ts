import { cookies } from "next/headers";

const USER_COOKIE_NAME = "kapi_user";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

interface UserCookie {
  id: string;
  name: string;
}

export async function setUserCookie(id: string, name: string) {
  (await cookies()).set(USER_COOKIE_NAME, JSON.stringify({ id, name }), {
    maxAge: MAX_AGE,
    path: "/",
    secure: process.env.NODE_ENV === "production",
  });
}

export async function getUserFromCookies(): Promise<UserCookie | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(USER_COOKIE_NAME);
  if (!cookie) return null;

  try {
    return JSON.parse(cookie.value) as UserCookie;
  } catch {
    return null;
  }
}

export async function clearUserCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(USER_COOKIE_NAME);
}
