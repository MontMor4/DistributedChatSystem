import { createServerFn } from "@tanstack/react-start";
import { useAppSession } from "@/lib/session";
import { redirect } from "@tanstack/react-router";

export const logoutFn = createServerFn({ method: "POST" }).handler(async () => {
  const session = await useAppSession();
  await session.clear();
  throw redirect({ href: "/" });
});
