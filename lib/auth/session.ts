import { getServerSession } from "next-auth";
import { authConfig } from "./config";
import { cache } from "react";

export const getSession = cache(async () => {
  return await getServerSession(authConfig);
});

export const getCurrentUser = cache(async () => {
  const session = await getSession();
  return session?.user;
});