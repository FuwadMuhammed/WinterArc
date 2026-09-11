import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { getAdminSession } from "./session";

/** The real auth gate. The proxy redirect is only an optimistic check, so every
 * admin page, data loader and Server Action must call this itself. */
export const requireAdmin = cache(async () => {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  return session;
});
