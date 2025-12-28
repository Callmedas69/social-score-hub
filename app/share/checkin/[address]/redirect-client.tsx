"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function RedirectToCheckin() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/checkin");
  }, [router]);

  return null;
}
